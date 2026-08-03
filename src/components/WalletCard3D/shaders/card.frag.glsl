  #extension GL_OES_standard_derivatives : enable
  precision highp float;

  uniform mat3 uNormalMatrix;
  uniform float uEdge;
  uniform float uMaterialVariant;
  uniform float uRadialFrequency;
  uniform float uRadialDetail;
  uniform float uRidgeDepth;
  uniform float uRidgeFrequency;
  uniform float uRidgeRadialSpecular;
  uniform float uHeightMapDepth;
  uniform float uHeightMapShade;
  uniform float uFinishDetail;
  uniform float uAnisotropy;
  uniform float uMasterLighting;
  uniform float uSpecularStrength;
  uniform float uDiffuseStrength;
  uniform float uEnvironmentSpecularStrength;
  uniform float uAmbientDiffuseStrength;
  uniform float uGrazingStrength;
  uniform float uBlueSaturation;
  uniform float uEdgeReflectionStrength;
  uniform float uStudioFillStrength;
  uniform float uStudioSoftboxStrength;
  uniform float uEngravingDepth;
  uniform float uAmbientDetailStrength;
  uniform float uDetailLightStrength;
  uniform float uDetailLightX;
  uniform float uDetailLightY;
  uniform float uDetailLightZ;
  uniform float uDetailLightSoftness;
  uniform float uAppHighlightStrength;
  uniform float uPrintBrightness;
  uniform float uPrintSpecularStrength;
  uniform float uPrintBevelStrength;
  uniform float uPrintContactStrength;
  uniform float uPrintOpacity;
  uniform float uTypographyLightingStrength;
  uniform float uQrRoughnessScale;
  uniform float uQrReflectionStrength;
  uniform float uQrEngravingStrength;
  uniform float uQrLightingStrength;
  uniform float uFrontFace;
  uniform sampler2D uArtworkTexture;
  uniform sampler2D uEngravingTexture;
  uniform sampler2D uQrTexture;
  uniform sampler2D uHeightTexture;
  uniform vec2 uArtworkTexel;
  uniform vec2 uEngravingTexel;
  uniform vec2 uHeightTexel;
  uniform float uLightType;
  uniform vec3 uLightDirection;
  uniform vec3 uLightPosition;
  uniform float uLightIntensity;
  uniform float uEnvironmentIntensity;
  uniform float uRoughnessScale;
  uniform float uExposure;
  uniform vec3 uCardColor;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vCardPosition;
  varying float vFaceDirection;

  const float PI = 3.14159265359;

  float hash(float value) {
    return fract(sin(value * 127.1) * 43758.5453);
  }

  float hash2(vec2 value) {
    return fract(
      sin(dot(value, vec2(127.1, 311.7))) * 43758.5453
    );
  }

  vec3 fresnelSchlick(float cosine, vec3 reflectance) {
    return reflectance + (1.0 - reflectance)
      * pow(1.0 - cosine, 5.0);
  }

  float anisotropicDistribution(
    float normalHalf,
    float tangentHalf,
    float bitangentHalf,
    float alphaTangent,
    float alphaBitangent
  ) {
    float denominator =
      tangentHalf * tangentHalf / (alphaTangent * alphaTangent) +
      bitangentHalf * bitangentHalf / (alphaBitangent * alphaBitangent) +
      normalHalf * normalHalf;
    return 1.0 / max(
      PI * alphaTangent * alphaBitangent * denominator * denominator,
      0.0001
    );
  }

  float anisotropicVisibility(
    float normalDirection,
    float tangentDirection,
    float bitangentDirection,
    float alphaTangent,
    float alphaBitangent
  ) {
    float projectedRoughness = sqrt(
      tangentDirection * tangentDirection * alphaTangent * alphaTangent +
      bitangentDirection * bitangentDirection * alphaBitangent * alphaBitangent +
      normalDirection * normalDirection
    );
    return 2.0 * normalDirection / max(
      normalDirection + projectedRoughness,
      0.0001
    );
  }

  vec3 studioEnvironment(vec3 direction, float roughness) {
    float horizon = smoothstep(-0.45, 0.72, direction.y);
    vec3 environment = mix(
      vec3(0.055, 0.062, 0.075),
      vec3(0.32, 0.36, 0.42),
      horizon
    );

    // A large frontal ceiling card keeps the broad face illuminated when its
    // reflection does not happen to intersect either narrow softbox.
    float frontalFill = pow(
      max(dot(direction, normalize(vec3(0.0, 0.22, 0.98))), 0.0),
      mix(3.6, 1.25, roughness)
    );
    float overheadFill = pow(
      max(dot(direction, normalize(vec3(0.0, 0.82, 0.57))), 0.0),
      mix(5.0, 1.5, roughness)
    );
    environment += vec3(0.24, 0.29, 0.36)
      * frontalFill * 0.9 * uStudioFillStrength;
    environment += vec3(0.17, 0.21, 0.28)
      * overheadFill * 0.55 * uStudioFillStrength;

    float keySoftbox = pow(
      max(dot(direction, normalize(vec3(-0.52, 0.46, 0.72))), 0.0),
      mix(18.0, 3.5, roughness)
    );
    float rimSoftbox = pow(
      max(dot(direction, normalize(vec3(0.72, 0.12, 0.68))), 0.0),
      mix(34.0, 5.5, roughness)
    );
    environment += vec3(1.0, 0.93, 0.76)
      * keySoftbox * 2.7 * uStudioSoftboxStrength;
    environment += vec3(0.62, 0.72, 0.90)
      * rimSoftbox * 1.1 * uStudioSoftboxStrength;
    return environment;
  }

  vec3 acesToneMap(vec3 color) {
    return clamp(
      (color * (2.51 * color + 0.03)) /
      (color * (2.43 * color + 0.59) + 0.14),
      0.0,
      1.0
    );
  }

  float qrEngravingAt(vec2 uv) {
    vec4 sampleValue = texture2D(uQrTexture, uv);
    float luminance = dot(sampleValue.rgb, vec3(0.2126, 0.7152, 0.0722));
    return sampleValue.a
      * (1.0 - smoothstep(0.12, 0.58, luminance));
  }

  void main() {
    bool radialVariant = uMaterialVariant < 0.5;
    bool ridgeVariant =
      uMaterialVariant > 9.5 && uMaterialVariant < 10.5;
    bool heightMapVariant = uMaterialVariant > 19.5;
    bool blueVariant =
      radialVariant || ridgeVariant || heightMapVariant;
    float faceMask = 1.0 - uEdge;
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(-vPosition);
    vec2 artworkUv = vec2(
      vCardPosition.x * 0.5 + 0.5,
      0.5 - vCardPosition.y / 1.219512
    );
    float heightMapActive = step(19.5, uMaterialVariant)
      * uFrontFace;
    vec2 heightFilterTexel = max(
      uHeightTexel,
      fwidth(artworkUv) * 0.65
    );
    float heightCenter = texture2D(
      uHeightTexture,
      artworkUv
    ).r;
    float heightLeft = texture2D(
      uHeightTexture,
      artworkUv - vec2(heightFilterTexel.x, 0.0)
    ).r;
    float heightRight = texture2D(
      uHeightTexture,
      artworkUv + vec2(heightFilterTexel.x, 0.0)
    ).r;
    float heightTop = texture2D(
      uHeightTexture,
      artworkUv - vec2(0.0, heightFilterTexel.y)
    ).r;
    float heightBottom = texture2D(
      uHeightTexture,
      artworkUv + vec2(0.0, heightFilterTexel.y)
    ).r;
    float heightValue = (
      heightCenter * 4.0
      + heightLeft
      + heightRight
      + heightTop
      + heightBottom
    ) * 0.125 * heightMapActive;
    vec2 heightGradient = vec2(
      heightRight - heightLeft,
      heightBottom - heightTop
    ) * heightMapActive;
    vec2 engravingFilterTexel = max(
      uEngravingTexel,
      fwidth(artworkUv) * 0.75
    );
    float engravingCenter = texture2D(
      uEngravingTexture,
      artworkUv
    ).a;
    float engravingLeft = texture2D(
      uEngravingTexture,
      artworkUv - vec2(engravingFilterTexel.x, 0.0)
    ).a;
    float engravingRight = texture2D(
      uEngravingTexture,
      artworkUv + vec2(engravingFilterTexel.x, 0.0)
    ).a;
    float engravingTop = texture2D(
      uEngravingTexture,
      artworkUv - vec2(0.0, engravingFilterTexel.y)
    ).a;
    float engravingBottom = texture2D(
      uEngravingTexture,
      artworkUv + vec2(0.0, engravingFilterTexel.y)
    ).a;
    float engraving = (
      engravingCenter * 4.0
      + engravingLeft
      + engravingRight
      + engravingTop
      + engravingBottom
    ) * 0.125 * uFrontFace;
    float engravingFootprint = max(
      engravingFilterTexel.x / max(uEngravingTexel.x, 0.000001),
      engravingFilterTexel.y / max(uEngravingTexel.y, 0.000001)
    );
    float engravingNormalFilter = inversesqrt(
      max(engravingFootprint, 1.0)
    );
    vec2 engravingGradient = vec2(
      engravingRight - engravingLeft,
      engravingBottom - engravingTop
    ) * uFrontFace * engravingNormalFilter;
    float qrEngraving = qrEngravingAt(artworkUv) * uFrontFace;
    float qrMask = texture2D(uQrTexture, artworkUv).a * uFrontFace;
    float artworkMask = texture2D(
      uArtworkTexture,
      artworkUv
    ).a * uFrontFace;
    vec2 qrShapeGradient = vec2(
      texture2D(
        uQrTexture,
        artworkUv + vec2(uArtworkTexel.x, 0.0)
      ).a - texture2D(
        uQrTexture,
        artworkUv - vec2(uArtworkTexel.x, 0.0)
      ).a,
      texture2D(
        uQrTexture,
        artworkUv + vec2(0.0, uArtworkTexel.y)
      ).a - texture2D(
        uQrTexture,
        artworkUv - vec2(0.0, uArtworkTexel.y)
      ).a
    ) * uFrontFace;
    vec2 qrEngravingGradient = vec2(
      qrEngravingAt(artworkUv + vec2(uArtworkTexel.x, 0.0))
        - qrEngravingAt(artworkUv - vec2(uArtworkTexel.x, 0.0)),
      qrEngravingAt(artworkUv + vec2(0.0, uArtworkTexel.y))
        - qrEngravingAt(artworkUv - vec2(0.0, uArtworkTexel.y))
    ) * uFrontFace;
    engravingGradient += (
      qrEngravingGradient * 0.72
      + qrShapeGradient * 0.18
    ) * uQrEngravingStrength;
    vec3 cardXAxis = normalize(uNormalMatrix * vec3(1.0, 0.0, 0.0));
    vec3 cardYAxis = normalize(uNormalMatrix * vec3(0.0, 1.0, 0.0));
    normal = normalize(
      normal
      - cardXAxis * engravingGradient.x * 0.42 * uEngravingDepth
      + cardYAxis * engravingGradient.y * 0.42 * uEngravingDepth
    );
    normal = normalize(
      normal
      - cardXAxis * heightGradient.x * 0.72 * uHeightMapDepth
      + cardYAxis * heightGradient.y * 0.72 * uHeightMapDepth
    );
    float radius = length(vCardPosition);
    vec2 radial = vCardPosition / max(radius, 0.0001);
    if (radius < 0.0001) radial = vec2(1.0, 0.0);

    // The app finish is a real normal relief rather than a roughness-only
    // anisotropic effect. This is the Wallet shader's concentric ridge
    // equation transformed into this viewer's card coordinate system.
    if (ridgeVariant) {
      vec2 contourPosition = vec2(
        vCardPosition.x,
        vCardPosition.y - 0.0125
      );
      vec2 roundedRectDelta = abs(contourPosition)
        - vec2(0.85, 0.456061);
      float roundedRectSdf =
        length(max(roundedRectDelta, vec2(0.0)))
        + min(max(roundedRectDelta.x, roundedRectDelta.y), 0.0)
        - 0.15;
      float faceEdgeDistance = max(-roundedRectSdf, 0.0);
      float smoothFaceEdge = smoothstep(
        0.010,
        0.026,
        faceEdgeDistance
      );
      float ridgePhase =
        radius / 1.219512 * 500.0 * uRidgeFrequency;
      float ridgeSlope =
        0.04 * cos(ridgePhase)
        + 0.11 * cos(ridgePhase + 0.1);
      float machiningEnvelope =
        0.52 + 0.48 * exp(-radius * radius * 1.55);
      ridgeSlope *= machiningEnvelope
        * smoothFaceEdge
        * (1.0 - smoothstep(0.02, 0.98, qrMask))
        * (1.0 - smoothstep(0.03, 0.52, artworkMask))
        * uRidgeDepth
        * uFinishDetail;
      normal = normalize(
        normal
        - cardXAxis * ridgeSlope * radial.x
        + cardYAxis * ridgeSlope * radial.y
      );
    }

    // The tangent follows each circular machining pass. Unlike a height field,
    // this changes the directional roughness without creating raised ridges.
    vec3 tangent = normalize(
      uNormalMatrix * vec3(-radial.y, radial.x, 0.0)
    );
    // Titanium uses a traditional straight vertical brush.
    if (uMaterialVariant > 4.5 && uMaterialVariant < 5.5) {
      tangent = cardYAxis;
    }
    vec3 bitangent = normalize(cross(normal, tangent));

    float radialRingFrequency = 180.0 * uRadialFrequency;
    float radialWaveFrequency = 560.0 * uRadialFrequency;
    float ringIndex = floor(radius * radialRingFrequency);
    float radialFootprint = fwidth(radius) * uRadialFrequency;
    float radialRingFilter = 1.0 - smoothstep(
      0.35,
      1.10,
      radialFootprint * 180.0
    );
    float radialWaveFilter = 1.0 - smoothstep(
      1.15,
      3.10,
      radialFootprint * 560.0
    );
    float fineFinish = mix(
      0.5,
      hash(ringIndex),
      radialRingFilter
    ) + 0.35 * sin(
        radius * radialWaveFrequency
          + hash(ringIndex * 0.37) * 6.2831
      ) * radialWaveFilter;
    float microNoise = hash2(
      floor((vCardPosition + vec2(1.4)) * 860.0)
    );
    float linearBrush = hash(
      floor((vCardPosition.x + 1.0) * 1800.0)
    ) + 0.3 * sin(vCardPosition.x * 9800.0);
    float carbonWeave =
      sin((vCardPosition.x + vCardPosition.y) * 255.0)
      * sin((vCardPosition.x - vCardPosition.y) * 255.0);
    float leatherGrain = hash2(
      floor((vCardPosition + vec2(1.7)) * 120.0)
    ) + 0.24 * sin(vCardPosition.x * 190.0 + vCardPosition.y * 71.0);

    if (uMaterialVariant > 1.5 && uMaterialVariant < 2.5) {
      fineFinish = microNoise;
    } else if (uMaterialVariant > 2.5 && uMaterialVariant < 4.5) {
      fineFinish = mix(microNoise, 0.5, 0.62);
    } else if (uMaterialVariant > 4.5 && uMaterialVariant < 5.5) {
      fineFinish = linearBrush;
    } else if (uMaterialVariant > 5.5 && uMaterialVariant < 7.5) {
      fineFinish = mix(microNoise, 0.5, 0.72);
    } else if (uMaterialVariant > 7.5 && uMaterialVariant < 8.5) {
      fineFinish = carbonWeave * 0.5 + 0.5;
    } else if (
      uMaterialVariant > 8.5
      && uMaterialVariant < 9.5
    ) {
      fineFinish = leatherGrain * 0.72;
    } else if (ridgeVariant || heightMapVariant) {
      fineFinish = 0.5;
    }
    float finishStrength = uFinishDetail;
    if (radialVariant) {
      finishStrength *= uRadialDetail;
    }
    float finishVariation = mix(
      0.0,
      fineFinish,
      finishStrength
    );

    float baseRoughness = mix(0.16, 0.115, uAnisotropy)
      * uRoughnessScale;
    float materialAnisotropy = uAnisotropy;
    if (uMaterialVariant > 0.5 && uMaterialVariant < 1.5) {
      baseRoughness = 0.23 * uRoughnessScale;
      materialAnisotropy *= 0.72;
    } else if (uMaterialVariant > 1.5 && uMaterialVariant < 2.5) {
      baseRoughness = 0.48 * uRoughnessScale;
      materialAnisotropy *= 0.06;
    } else if (uMaterialVariant > 2.5 && uMaterialVariant < 3.5) {
      baseRoughness = 0.62 * uRoughnessScale;
      materialAnisotropy = 0.0;
    } else if (uMaterialVariant > 3.5 && uMaterialVariant < 4.5) {
      baseRoughness = 0.15 * uRoughnessScale;
      materialAnisotropy = 0.0;
    } else if (uMaterialVariant > 4.5 && uMaterialVariant < 5.5) {
      baseRoughness = 0.19 * uRoughnessScale;
      materialAnisotropy *= 0.92;
    } else if (uMaterialVariant > 5.5 && uMaterialVariant < 6.5) {
      baseRoughness = 0.21 * uRoughnessScale;
      materialAnisotropy *= 0.08;
    } else if (uMaterialVariant > 6.5 && uMaterialVariant < 7.5) {
      baseRoughness = 0.42 * uRoughnessScale;
      materialAnisotropy *= 0.05;
    } else if (uMaterialVariant > 7.5 && uMaterialVariant < 8.5) {
      baseRoughness = 0.22 * uRoughnessScale;
      materialAnisotropy *= 0.22;
    } else if (
      uMaterialVariant > 8.5
      && uMaterialVariant < 9.5
    ) {
      baseRoughness = 0.58 * uRoughnessScale;
      materialAnisotropy = 0.0;
    } else if (ridgeVariant) {
      baseRoughness = 0.12 * uRoughnessScale;
      materialAnisotropy = mix(
        materialAnisotropy * 0.22,
        mix(0.58, 0.94, uAnisotropy),
        uRidgeRadialSpecular
      );
    } else if (heightMapVariant) {
      baseRoughness = 0.145 * uRoughnessScale;
      materialAnisotropy *= 0.32;
    }
    float roughness = clamp(
      baseRoughness + (finishVariation - 0.5) * 0.045 * faceMask,
      0.045,
      0.78
    );
    roughness = mix(roughness, clamp(baseRoughness * 0.82, 0.1, 0.5), uEdge);

    float aspect = mix(1.0, 0.18, materialAnisotropy * faceMask);
    // Concentric brushing scatters the reflected lobe across the radial
    // direction, producing the broad opposing wedges visible on a spun-metal
    // card. Widening the circular tangent instead creates an artificial ring.
    float alphaTangent = max(roughness * roughness * aspect, 0.012);
    float alphaBitangent = max(roughness * roughness / aspect, 0.012);

    vec3 pointLightVector = uLightPosition - vPosition;
    float pointLightDistance = length(pointLightVector);
    vec3 lightDirection = mix(
      normalize(uLightDirection),
      pointLightVector / max(pointLightDistance, 0.0001),
      uLightType
    );
    float lightAttenuation = mix(
      1.0,
      4.0 / max(pointLightDistance * pointLightDistance, 0.25),
      uLightType
    );
    vec3 halfwayDirection = normalize(viewDirection + lightDirection);

    float normalLight = max(dot(normal, lightDirection), 0.0);
    float normalView = max(dot(normal, viewDirection), 0.0);
    float normalHalf = max(dot(normal, halfwayDirection), 0.0);
    float viewHalf = max(dot(viewDirection, halfwayDirection), 0.0);

    float tangentHalf = dot(tangent, halfwayDirection);
    float bitangentHalf = dot(bitangent, halfwayDirection);
    float tangentLight = dot(tangent, lightDirection);
    float bitangentLight = dot(bitangent, lightDirection);
    float tangentView = dot(tangent, viewDirection);
    float bitangentView = dot(bitangent, viewDirection);

    // The app palette, converted from sRGB to linear light:
    // #0D95F0 → #18ABF8 across the broad face.
    float blueGradient = clamp(
      0.50 + vCardPosition.y * 0.58 + vCardPosition.x * 0.14,
      0.0,
      1.0
    );
    vec3 appBlueDark = vec3(0.0040, 0.3005, 0.8714);
    vec3 appBlueLight = vec3(0.0091, 0.4072, 0.9387);
    vec3 baseColor = mix(appBlueDark, appBlueLight, blueGradient);
    float metallic = 1.0;
    if (uMaterialVariant > 0.5 && uMaterialVariant < 1.5) {
      baseColor = mix(
        vec3(0.018, 0.265, 0.52),
        vec3(0.08, 0.52, 0.78),
        blueGradient
      );
    } else if (uMaterialVariant > 1.5 && uMaterialVariant < 2.5) {
      baseColor = mix(
        vec3(0.025, 0.22, 0.38),
        vec3(0.10, 0.46, 0.65),
        blueGradient
      );
    } else if (uMaterialVariant > 2.5 && uMaterialVariant < 3.5) {
      baseColor = mix(
        vec3(0.008, 0.19, 0.38),
        vec3(0.016, 0.38, 0.65),
        blueGradient
      );
      metallic = 0.0;
    } else if (uMaterialVariant > 3.5 && uMaterialVariant < 4.5) {
      baseColor = mix(
        vec3(0.006, 0.28, 0.63),
        vec3(0.02, 0.55, 0.88),
        blueGradient
      );
      metallic = 0.0;
    } else if (uMaterialVariant > 4.5 && uMaterialVariant < 5.5) {
      baseColor = mix(
        vec3(0.22, 0.31, 0.37),
        vec3(0.48, 0.58, 0.64),
        blueGradient
      );
    } else if (uMaterialVariant > 5.5 && uMaterialVariant < 6.5) {
      float pearlShift = pow(1.0 - normalView, 2.0);
      baseColor = mix(
        mix(vec3(0.006, 0.31, 0.69), vec3(0.02, 0.62, 0.79), blueGradient),
        vec3(0.32, 0.20, 0.78),
        pearlShift * 0.46
      );
      metallic = 0.0;
    } else if (uMaterialVariant > 6.5 && uMaterialVariant < 7.5) {
      baseColor = mix(
        vec3(0.035, 0.26, 0.39),
        vec3(0.24, 0.60, 0.72),
        blueGradient
      );
      metallic = 0.0;
    } else if (uMaterialVariant > 7.5 && uMaterialVariant < 8.5) {
      float weaveShade = smoothstep(-0.35, 0.55, carbonWeave);
      baseColor = mix(
        vec3(0.004, 0.012, 0.018),
        vec3(0.018, 0.07, 0.105),
        weaveShade
      );
      metallic = 0.0;
    } else if (
      uMaterialVariant > 8.5
      && uMaterialVariant < 9.5
    ) {
      baseColor = mix(
        vec3(0.006, 0.055, 0.095),
        vec3(0.015, 0.20, 0.31),
        clamp(leatherGrain * 0.62, 0.0, 1.0)
      );
      metallic = 0.0;
    } else if (ridgeVariant || heightMapVariant) {
      baseColor = mix(
        vec3(0.0, 0.175, 0.588),
        vec3(0.016, 0.565, 0.965),
        clamp(0.18 + artworkUv.y * 0.48 + artworkUv.x * 0.16, 0.0, 1.0)
      );
    }
    float sourceLuminance = max(
      dot(baseColor, vec3(0.2126, 0.7152, 0.0722)),
      0.0001
    );
    if (blueVariant) {
      // #0D95F0 has a linear luminance of approximately 0.2788. Referencing
      // that fixed value preserves the finish's light/dark variation while
      // allowing the picker's own value to change material brightness.
      baseColor = uCardColor * sourceLuminance / 0.2788;
    }
    float cardColorPeak = max(
      max(uCardColor.r, uCardColor.g),
      max(uCardColor.b, 0.0001)
    );
    vec3 cardAccent = sqrt(clamp(
      uCardColor / cardColorPeak,
      0.0,
      1.0
    ));
    vec3 blueReflectance = mix(vec3(0.045), baseColor, metallic);
    vec3 edgeReflectance = vec3(0.34, 0.52, 0.66);
    if (blueVariant) {
      edgeReflectance = mix(vec3(0.018), cardAccent * 0.78, 0.94);
    }
    vec3 reflectance = mix(
      blueReflectance,
      edgeReflectance * uEdgeReflectionStrength,
      uEdge
    );
    reflectance *= mix(0.91, 1.06, finishVariation * faceMask);
    vec3 surfaceDiffuseColor = mix(
      baseColor,
      edgeReflectance,
      uEdge
    );

    float distribution = anisotropicDistribution(
      normalHalf,
      tangentHalf,
      bitangentHalf,
      alphaTangent,
      alphaBitangent
    );
    float visibility =
      anisotropicVisibility(
        normalLight,
        tangentLight,
        bitangentLight,
        alphaTangent,
        alphaBitangent
      ) *
      anisotropicVisibility(
        normalView,
        tangentView,
        bitangentView,
        alphaTangent,
        alphaBitangent
      );
    vec3 fresnel = fresnelSchlick(viewHalf, reflectance);
    if (blueVariant) {
      vec3 blueGrazingReflectance = mix(
        vec3(0.04),
        cardAccent,
        0.94
      );
      fresnel = mix(
        reflectance,
        blueGrazingReflectance,
        pow(1.0 - viewHalf, 5.0)
      );
    }
    vec3 direct = distribution * visibility * fresnel;
    direct *= normalLight / max(4.0 * normalLight * normalView, 0.0001);

    // A camera-space diffuse-only fill reveals real normal relief without
    // adding another specular lobe or Fresnel reflection.
    vec3 detailLightDirection = normalize(vec3(
      uDetailLightX,
      uDetailLightY,
      uDetailLightZ
    ));
    float detailDiffuseWrap = clamp(
      (uDetailLightSoftness - 0.5) / 3.5,
      0.0,
      1.0
    );
    detailDiffuseWrap *= 0.8;

    // Radial Blue stores most of its machining in roughness. Give only this
    // diffuse detail pass a tiny, footprint-filtered virtual relief so the
    // brushing can be read without introducing a second glossy highlight.
    vec3 detailSurfaceNormal = normal;
    if (radialVariant) {
      float detailCoarseFilter = 1.0 - smoothstep(
        0.65,
        2.4,
        radialFootprint * radialRingFrequency
      );
      float detailMicroSlope =
        (
          cos(radius * radialRingFrequency + 0.45)
            * 0.12
            * detailCoarseFilter
          + cos(
              radius * radialWaveFrequency
              + hash(ringIndex * 0.37) * 6.2831
            )
            * 0.065
            * radialWaveFilter
        )
        * finishStrength
        * faceMask
        * (1.0 - smoothstep(0.02, 0.98, qrMask))
        * (1.0 - smoothstep(0.03, 0.52, artworkMask));
      detailSurfaceNormal = normalize(
        normal
        - cardXAxis * detailMicroSlope * radial.x
        + cardYAxis * detailMicroSlope * radial.y
      );
    }
    float detailSurfaceDiffuse = clamp(
      (
        dot(detailSurfaceNormal, detailLightDirection)
        + detailDiffuseWrap
      ) / (1.0 + detailDiffuseWrap),
      0.0,
      1.0
    );
    float detailFlatDiffuse = clamp(
      (
        dot(normalize(vNormal), detailLightDirection)
        + detailDiffuseWrap
      ) / (1.0 + detailDiffuseWrap),
      0.0,
      1.0
    );
    // High-pass the diffuse response: the fill illuminates relief facing it,
    // rather than laying a uniform veil over the entire card.
    float detailDiffuse = max(
      detailSurfaceDiffuse - detailFlatDiffuse,
      0.0
    ) * 14.0;
    vec3 reflectionDirection = reflect(-viewDirection, normal);
    vec3 environment = studioEnvironment(reflectionDirection, roughness);
    if (blueVariant) {
      // The blue metal finishes spectrally filter the reflected studio
      // instead of washing toward neutral white at grazing angles.
      environment *= vec3(0.30) + cardAccent * 0.86;
    }
    vec3 environmentFresnel = fresnelSchlick(normalView, reflectance);
    if (blueVariant) {
      vec3 blueGrazingReflectance = mix(
        vec3(0.04),
        cardAccent,
        0.94
      );
      environmentFresnel = mix(
        reflectance,
        blueGrazingReflectance,
        pow(1.0 - normalView, 5.0)
      );
    }
    vec3 indirect = environment * environmentFresnel
      * mix(0.92, 0.60, roughness)
      * uEnvironmentIntensity
      * uEnvironmentSpecularStrength;

    // Cool grazing bounce keeps the thin edge readable against pure black.
    float grazing = pow(1.0 - normalView, 3.0);
    vec3 color = indirect
      + direct
        * uLightIntensity
        * lightAttenuation
        * uSpecularStrength;
    color += surfaceDiffuseColor
      * detailDiffuse
      * 0.24
      * uDetailLightStrength;
    color += surfaceDiffuseColor
      * normalLight
      * 0.055
      * uLightIntensity
      * lightAttenuation
      * uDiffuseStrength;
    color += surfaceDiffuseColor
      * 0.055
      * uEnvironmentIntensity
      * uAmbientDiffuseStrength;
    if (uMaterialVariant > 6.5 && uMaterialVariant < 7.5) {
      color += baseColor * pow(1.0 - normalView, 2.2) * 0.24;
    }
    if (ridgeVariant) {
      vec3 appHighlight = vec3(0.016, 0.565, 0.965);
      float appBroad = pow(
        max(dot(normal, halfwayDirection), 0.0),
        30.0
      );
      float appSharp = pow(
        max(dot(normal, halfwayDirection), 0.0),
        90.0
      );
      color += appHighlight
        * (appBroad * 0.12 + appSharp * 0.24)
        * uLightIntensity
        * lightAttenuation
        * uAppHighlightStrength;
    }
    if (blueVariant) {
      float blueLuminance = dot(
        color,
        vec3(0.2126, 0.7152, 0.0722)
      );
      color = max(
        mix(vec3(blueLuminance), color, uBlueSaturation),
        vec3(0.0)
      );
    }
    color += vec3(0.018, 0.18, 0.42)
      * grazing * 0.28 * uGrazingStrength;
    // Real machining leaves a weak, view-independent energy variation in
    // addition to its much stronger roughness response. This keeps the finish
    // barely legible away from direct highlights without baking in lighting.
    float unlitFinish = (finishVariation - 0.5) * faceMask;
    color *= max(
      0.0,
      1.0 + unlitFinish * 0.18 * uAmbientDetailStrength
    );
    color *= 1.0 - engraving * 0.24 * uEngravingDepth;
    color *= 1.0
      - heightValue * 0.22 * uHeightMapShade;

    vec4 artwork = texture2D(uArtworkTexture, artworkUv);
    vec3 artworkLinear = pow(artwork.rgb, vec3(2.2));
    vec2 printBevelTexel = uArtworkTexel * 2.5;
    float artworkLeft = texture2D(
      uArtworkTexture,
      artworkUv - vec2(printBevelTexel.x, 0.0)
    ).a;
    float artworkRight = texture2D(
      uArtworkTexture,
      artworkUv + vec2(printBevelTexel.x, 0.0)
    ).a;
    float artworkTop = texture2D(
      uArtworkTexture,
      artworkUv - vec2(0.0, printBevelTexel.y)
    ).a;
    float artworkBottom = texture2D(
      uArtworkTexture,
      artworkUv + vec2(0.0, printBevelTexel.y)
    ).a;
    vec2 artworkGradient = vec2(
      artworkRight - artworkLeft,
      artworkBottom - artworkTop
    ) * uFrontFace;
    float artworkNeighborhood = max(
      max(artworkLeft, artworkRight),
      max(artworkTop, artworkBottom)
    ) * uFrontFace;
    float artworkContact = max(
      artworkNeighborhood - artwork.a,
      0.0
    );
    vec3 printNormal = normalize(
      normal
      - cardXAxis * artworkGradient.x
        * 0.48 * uPrintBevelStrength
      + cardYAxis * artworkGradient.y
        * 0.48 * uPrintBevelStrength
    );
    float printNormalLight = max(
      dot(printNormal, lightDirection),
      0.0
    );
    float printNormalView = max(
      dot(printNormal, viewDirection),
      0.0
    );
    float printFrontReadability = smoothstep(
      0.18,
      0.82,
      printNormalView
    );
    float printDirectResponse = printNormalLight * (
      1.0 - exp(
        -uLightIntensity * lightAttenuation * 0.24
      )
    );
    vec3 printReflectionDirection = reflect(
      -viewDirection,
      printNormal
    );
    vec3 printEnvironment = studioEnvironment(
      printReflectionDirection,
      0.24
    );
    float printEnvironmentResponse = clamp(
      dot(
        printEnvironment,
        vec3(0.2126, 0.7152, 0.0722)
      )
        * uEnvironmentIntensity,
      0.0,
      1.0
    );
    float printDiffuse =
      0.18
      + printFrontReadability * 0.24
      + printDirectResponse * 0.24
      + printEnvironmentResponse * 0.10;
    float printSpecular = pow(
      max(dot(printNormal, halfwayDirection), 0.0),
      48.0
    ) * uLightIntensity * lightAttenuation * 0.16;
    float printFresnel = pow(1.0 - printNormalView, 4.0);
    float printBlueTint = mix(
      0.20,
      0.48,
      pow(1.0 - printNormalView, 2.0)
    );
    vec3 printInk = mix(
      artworkLinear,
      artworkLinear * vec3(0.58, 0.86, 1.0),
      printBlueTint
    );
    vec3 printSurface = printInk
      * printDiffuse
      * 0.84
      * uPrintBrightness;
    printSurface += mix(
      printInk,
      vec3(0.42, 0.82, 1.0),
      0.52
    ) * printSpecular * 0.76 * uPrintSpecularStrength;
    vec3 printReflectance = mix(
      vec3(0.055),
      printInk,
      0.34
    );
    printSurface += printEnvironment
      * fresnelSchlick(printNormalView, printReflectance)
      * (0.22 + printFresnel * 0.10)
      * uEnvironmentIntensity;
    float printBevel = clamp(
      length(artworkGradient) * 1.8,
      0.0,
      1.0
    );
    printSurface *= 1.0
      - printBevel * 0.16 * uPrintBevelStrength;
    printSurface *= uTypographyLightingStrength;
    color *= 1.0
      - artworkContact * 0.22 * uPrintContactStrength;
    color = mix(
      color,
      printSurface,
      artwork.a * uFrontFace * uPrintOpacity
    );

    vec4 qrMaterial = texture2D(uQrTexture, artworkUv);
    float qrGradient = dot(qrMaterial.rgb, vec3(0.2126, 0.7152, 0.0722));
    // Give the insert its own circular brushing coordinate system. The center
    // matches the 50 × 38 px Figma button instead of inheriting the card's
    // much larger radial field.
    vec2 qrCenter = vec2(266.0 / 336.0, 92.0 / 205.0);
    vec2 qrPosition = vec2(
      (artworkUv.x - qrCenter.x) * 2.0,
      -(artworkUv.y - qrCenter.y) * 1.219512
    );
    float qrRadius = length(qrPosition);
    vec2 qrRadial = qrPosition / max(qrRadius, 0.0001);
    if (qrRadius < 0.0001) qrRadial = vec2(1.0, 0.0);
    vec3 qrTangent = normalize(
      uNormalMatrix * vec3(-qrRadial.y, qrRadial.x, 0.0)
    );
    vec3 qrBitangent = normalize(cross(normal, qrTangent));

    float qrRingIndex = floor(qrRadius * 2300.0);
    float qrFootprint = fwidth(qrRadius);
    float qrRingFilter = 1.0 - smoothstep(
      0.3,
      1.1,
      qrFootprint * 2300.0
    );
    float qrWaveFilter = 1.0 - smoothstep(
      0.3,
      1.1,
      qrFootprint * 9200.0
    );
    float qrFineFinish = mix(
      0.5,
      hash(qrRingIndex + 41.0),
      qrRingFilter
    ) + 0.28 * sin(
        qrRadius * 9200.0 + hash(qrRingIndex * 0.61) * 6.2831
      ) * qrWaveFilter;
    float qrFinishVariation = mix(
      0.0,
      qrFineFinish,
      uFinishDetail
    );
    float qrRoughness = clamp(
      0.105 * uRoughnessScale * uQrRoughnessScale
        + (qrFinishVariation - 0.5) * 0.038,
      0.045,
      0.22
    );
    float qrAspect = mix(1.0, 0.12, uAnisotropy);
    float qrAlphaTangent = max(
      qrRoughness * qrRoughness * qrAspect,
      0.008
    );
    float qrAlphaBitangent = max(
      qrRoughness * qrRoughness / qrAspect,
      0.008
    );
    float qrTangentHalf = dot(qrTangent, halfwayDirection);
    float qrBitangentHalf = dot(qrBitangent, halfwayDirection);
    float qrTangentLight = dot(qrTangent, lightDirection);
    float qrBitangentLight = dot(qrBitangent, lightDirection);
    float qrTangentView = dot(qrTangent, viewDirection);
    float qrBitangentView = dot(qrBitangent, viewDirection);
    float qrDistribution = anisotropicDistribution(
      normalHalf,
      qrTangentHalf,
      qrBitangentHalf,
      qrAlphaTangent,
      qrAlphaBitangent
    );
    float qrVisibility =
      anisotropicVisibility(
        normalLight,
        qrTangentLight,
        qrBitangentLight,
        qrAlphaTangent,
        qrAlphaBitangent
      ) *
      anisotropicVisibility(
        normalView,
        qrTangentView,
        qrBitangentView,
        qrAlphaTangent,
        qrAlphaBitangent
      );
    vec3 qrReflectance = mix(
      vec3(0.26, 0.29, 0.32),
      vec3(0.58, 0.62, 0.66),
      smoothstep(0.28, 0.95, qrGradient)
    );
    qrReflectance *= mix(0.92, 1.08, qrFinishVariation);
    vec3 qrFresnel = fresnelSchlick(viewHalf, qrReflectance);
    vec3 qrDirect = qrDistribution * qrVisibility * qrFresnel;
    qrDirect *= normalLight
      / max(4.0 * normalLight * normalView, 0.0001);

    vec3 qrSurface = studioEnvironment(reflectionDirection, qrRoughness)
      * fresnelSchlick(normalView, qrReflectance)
      * mix(0.72, 0.42, qrRoughness)
      * uEnvironmentIntensity;
    qrSurface += qrDirect * uLightIntensity * lightAttenuation;
    vec3 qrDiffuseColor = mix(
      vec3(0.20, 0.22, 0.24),
      vec3(0.70, 0.73, 0.76),
      smoothstep(0.28, 0.95, qrGradient)
    );
    qrSurface += qrDiffuseColor
      * detailDiffuse
      * 0.24
      * uDetailLightStrength;
    qrSurface *= uQrReflectionStrength;
    qrSurface *= mix(0.82, 1.08, qrGradient);
    qrSurface *= 1.0
      - qrEngraving * 0.52 * uQrEngravingStrength;
    qrSurface *= uQrLightingStrength;
    color = mix(color, qrSurface, qrMask);

    color *= uMasterLighting;
    color = acesToneMap(color * uExposure);
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
