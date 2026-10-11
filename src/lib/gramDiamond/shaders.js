// GLSL ES 3.00 port of Diamond.metal. Function names and constants match the Metal source, so the two
// can be compared side by side. Not ported: the glass "whiten" variant, HDR highlight boost and the
// reference-mode highlights.

const common = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
#define PI 3.14159265358979
float saturate(float x) { return clamp(x, 0.0, 1.0); }
vec2 saturate(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 saturate(vec3 x) { return clamp(x, 0.0, 1.0); }
`

// MARK: - Background stars

export const starVertex =
    common +
    /* glsl */ `
struct StarUniforms {
  mat4 projection;
  vec4 animation;  // burst age, transport time, burst enabled, light background
  vec4 layoutInfo; // viewport pixels (xy), steady instance count, burst seed
  vec4 appearance; // palette identifier
  vec4 tint;       // x: star brightness, y: star opacity, z: emission radius
};
uniform StarUniforms u;
uniform int instanceOffset; // WebGL has no baseInstance
out vec2 vUV;
flat out vec4 vColor;
flat out float vHalo;

float starRandom(uint seed) {
  seed ^= seed >> 16u; seed *= 0x7feb352du;
  seed ^= seed >> 15u; seed *= 0x846ca68bu;
  seed ^= seed >> 16u;
  return float(seed & 0x00ffffffu) / 16777216.0;
}

void main() {
  const vec2 corners[6] = vec2[6](vec2(-1,-1), vec2(1,-1), vec2(-1,1), vec2(-1,1), vec2(1,-1), vec2(1,1));
  uint instance = uint(gl_InstanceID + instanceOffset);
  uint seed = instance * 127u + 9137u;
  bool burst = instance >= uint(u.layoutInfo.z);
  if (burst) seed += uint(u.layoutInfo.w) * 104729u;
  float lifetime = mix(4.5, 7.5, starRandom(seed + 1u));
  float clock = u.animation.y + starRandom(seed + 2u) * lifetime;
  uint cycle = uint(floor(clock / lifetime));
  float age = mod(clock, lifetime);
  if (burst) {
    const float burstDurationScale = 2.0;
    lifetime = mix(1.8, 3.2, starRandom(seed + 1u));
    age = u.animation.x / burstDurationScale;
    cycle = 0u;
  }
  seed += cycle * 7919u;
  float progress = saturate(age / lifetime);
  float alive = float(age >= 0.0 && age < lifetime) * (burst ? u.animation.z : 1.0);
  float fadeIn = burst ? smoothstep(0.0, 0.25, age) : smoothstep(0.0, 0.10, progress);
  float fade = fadeIn * (1.0 - smoothstep(0.62, 1.0, progress)) * alive * u.tint.y;
  float depth = mix(0.60, 1.0, starRandom(seed + 3u));
  float sector = starRandom(seed + 4u);
  float spread = starRandom(seed + 14u);
  const float verticalSpread = 0.78;
  float lowerFanAngle = atan(tan(-PI / 6.0) / verticalSpread);
  float elevation = sector < 0.85 ? mix(lowerFanAngle, 0.34, spread) : mix(0.52, 1.40, spread);
  float side = starRandom(seed + 15u) < 0.5 ? -1.0 : 1.0;
  vec2 direction = vec2(side * cos(elevation), sin(elevation));
  float dist;
  if (burst) {
    float travelTime = max(age, 0.0);
    float baseSpeed = mix(4.8, 7.2, starRandom(seed + 5u));
    float initialSpeed = baseSpeed * 1.40;
    float cruiseSpeed = baseSpeed * 0.30;
    const float slowdownTime = 0.40;
    dist = mix(0.10, 0.32, starRandom(seed + 13u)) + cruiseSpeed * travelTime
      + (initialSpeed - cruiseSpeed) * slowdownTime * (1.0 - exp(-travelTime / slowdownTime));
  } else {
    dist = 0.32 + age * mix(0.38, 0.63, starRandom(seed + 5u));
  }
  float drift = sin(age * 0.85 + starRandom(seed + 6u) * 6.28) * (burst ? 0.06 : 0.16);
  vec2 center = direction * dist + vec2(-direction.y, direction.x) * drift;
  center *= vec2(1.0, verticalSpread) * depth;
  const float emissionHeight = -0.10;
  center.y += emissionHeight + mix(-0.26, 0.24, starRandom(seed + 16u)) * depth;
  if (!burst) {
    float travel = length(direction * vec2(1.0, verticalSpread)) * dist * depth;
    float behavior = starRandom(seed + 17u);
    if (behavior < 0.34) {
      float dimStart = mix(0.76, 0.90, starRandom(seed + 18u));
      float dimEnd = dimStart + mix(0.16, 0.22, starRandom(seed + 19u));
      float returnStart = dimEnd + mix(0.04, 0.09, starRandom(seed + 20u));
      float returnEnd = returnStart + mix(0.14, 0.22, starRandom(seed + 21u));
      float endStart = returnEnd + mix(0.05, 0.12, starRandom(seed + 22u));
      float end = endStart + mix(0.18, 0.28, starRandom(seed + 23u));
      float firstGlow = 1.0 - smoothstep(dimStart, dimEnd, travel);
      float secondGlow = smoothstep(returnStart, returnEnd, travel) * (1.0 - smoothstep(endStart, end, travel));
      fade *= firstGlow + secondGlow;
    } else if (behavior < 0.62) {
      float revealStart = mix(0.86, 1.10, starRandom(seed + 18u));
      float revealEnd = revealStart + mix(0.20, 0.34, starRandom(seed + 19u));
      fade *= smoothstep(revealStart, revealEnd, travel);
    }
  }
  float breathPeriod = mix(2.0, 3.4, starRandom(seed + 24u));
  float breathPhase = age * (2.0 * PI / breathPeriod) + starRandom(seed + 25u) * 2.0 * PI;
  float breathWave = 0.5 - 0.5 * cos(breathPhase);
  float shine = smoothstep(0.0, 1.0, fade) * mix(0.12, 1.0, breathWave);
  const float starSizeScale = 1.53;
  float radius = starSizeScale * mix(0.0228, 0.084, pow(starRandom(seed + 7u), 1.7)) * depth * mix(0.87, 1.0, shine);
  fade *= smoothstep(0.72 * u.tint.z, 1.02 * u.tint.z, length(center));
  float rotation = starRandom(seed + 8u) * 1.57 + age * mix(-0.20, 0.20, starRandom(seed + 9u));
  vec2 uv = corners[gl_VertexID] * 1.45;
  vec2 point = vec2(cos(rotation) * uv.x - sin(rotation) * uv.y, sin(rotation) * uv.x + cos(rotation) * uv.y) * radius;
  float choice = starRandom(seed + 10u);
  vec3 darkColor = choice < 0.22 ? vec3(0.045, 0.36, 1.0) :
                  (choice < 0.50 ? vec3(0.0, 0.451, 1.0) :
                  (choice < 0.82 ? vec3(0.0, 0.639, 1.0) : vec3(0.145, 0.792, 1.0)));
  float iridescence = smoothstep(0.12, 1.0, shine);
  darkColor = mix(darkColor, vec3(0.247, 0.894, 1.0), iridescence * 0.30);
  vec3 lightColor = darkColor * 0.78;
  int palette = int(u.appearance.x);
  if (palette == 1) {
    darkColor = lightColor = vec3(1.0);
  } else if (palette == 2) {
    darkColor = mix(vec3(0.52, 0.84, 1.0), vec3(1.0), choice * 0.8 + iridescence * 0.2);
    lightColor = mix(vec3(0.20, 0.51, 0.91), vec3(0.58, 0.80, 1.0), choice);
  }
  gl_Position = u.projection * vec4(center + point, -1.6 - depth, 1.0);
  // Bounded canvas: stars fade out in a circle before reaching its edge.
  fade *= 1.0 - smoothstep(0.6, 0.95, length(gl_Position.xy / gl_Position.w));
  vUV = uv;
  vColor = vec4(mix(darkColor, lightColor, u.animation.w) * u.tint.x,
                fade * mix(0.52, 0.95, starRandom(seed + 11u)) * mix(0.80, 1.0, depth));
  vHalo = mix(0.075, 0.035, u.animation.w) * u.tint.x;
}
`

export const starFragment =
    common +
    /* glsl */ `
in vec2 vUV;
flat in vec4 vColor;
flat in float vHalo;
out vec4 fragColor;
void main() {
  vec2 p = abs(vUV);
  float d = sqrt(max(p.x, 0.00001)) + sqrt(max(p.y, 0.00001)) - 1.0;
  float aa = max(fwidth(d), 0.04);
  float core = 1.0 - smoothstep(-aa, aa, d);
  float glow = exp(-dot(vUV, vUV) * 4.5) * vHalo;
  float alpha = saturate(core + glow) * vColor.a;
  fragColor = vec4(vColor.rgb * alpha, alpha);
}
`

// MARK: - Stone

const uniforms = /* glsl */ `
struct Uniforms {
  mat4 model;
  mat4 projection;
  mat4 inverseModel;
  vec4 parameters;      // time, refraction, brightness, sparkles
  vec4 viewport;        // width, height, optical plane count, only-sparkles flag
  vec4 sparkleShape;    // main layer scale, contour morph, core scale, star glow scale
  vec4 sparkleHalo;     // circular glow scale, main face rotation, horizontal correction, visibility
  vec4 crownGradient;
  vec4 pavilionGradient;
  vec4 lightSweep;      // diagonal position, environment phase, transmission
  vec4 facetProjection; // reference pitch cosine/sine, source units, projected top
  vec4 crownSweep;
  vec4 rightCrownSweep;
  vec4 leftCrownSweep;
  vec4 pavilionSweep;
  vec4 rightPavilionSweep;
  vec4 leftPavilionSweep;
  vec4 appearance;      // palette identifier
};
uniform Uniforms u;
`

export const diamondVertex =
    common +
    uniforms +
    /* glsl */ `
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec3 aSurface; // table weight, crown weight, kind (0 table, 1 crown, 2 pavilion, 3 rounded)
out vec3 vLocalPosition;
out vec3 vNormal;
out vec3 vWorldPosition;
out vec3 vFacetWeights;
void main() {
  vec4 world = u.model * vec4(aPosition, 1.0);
  gl_Position = u.projection * world;
  vLocalPosition = aPosition;
  vNormal = normalize((u.model * vec4(aNormal, 0.0)).xyz);
  vWorldPosition = world.xyz;
  vFacetWeights = aSurface.z == 3.0 ? vec3(aSurface.xy, 1.0 - aSurface.x - aSurface.y)
    : vec3(aSurface.z == 0.0, aSurface.z == 1.0, aSurface.z == 2.0);
}
`

export const diamondFragment =
    common +
    uniforms +
    /* glsl */ `
uniform vec4 planes[17];
in vec3 vLocalPosition;
in vec3 vNormal;
in vec3 vWorldPosition;
in vec3 vFacetWeights;
out vec4 fragColor;

struct Raster { vec3 localPosition; vec3 normal; vec3 worldPosition; vec3 facetWeights; };

vec3 referenceCrown(vec2 p, vec4 gradient) {
  const float stops[7] = float[7](0.0, 0.162, 0.324, 0.501, 0.667, 0.833, 1.0);
  const vec3 colors[7] = vec3[7](vec3(0.145,0.792,1.0), vec3(0.373,0.875,1.0),
    vec3(0.6,0.957,1.0), vec3(0.3,0.798,1.0), vec3(0.0,0.639,1.0),
    vec3(0.0,0.545,1.0), vec3(0.0,0.451,1.0));
  vec2 start = gradient.xy, direction = gradient.zw - start;
  float t = saturate(dot(p - start, direction) / dot(direction, direction));
  for (int i = 1; i < 7; ++i) {
    if (t <= stops[i]) return mix(colors[i-1], colors[i], (t - stops[i-1]) / (stops[i] - stops[i-1]));
  }
  return colors[6];
}

vec3 lateralDepth(vec3 color, vec3 normal, float y, vec3 facetWeights, float opticalLuminance) {
  float horizontalNormal = length(normal.xz);
  float side = smoothstep(0.22, 0.80, abs(normal.x) / max(horizontalNormal, 0.001));
  float shoulder = smoothstep(0.06, 0.57, y);
  float lower = smoothstep(0.12, 0.90, -y);
  float reflectedLight = smoothstep(0.28, 0.78, color.g);
  vec3 deepBlue = mix(vec3(0.017, 0.035, 0.90), vec3(0.006, 0.11, 1.0), reflectedLight);
  vec3 sideColor = mix(deepBlue, vec3(0.22, 0.86, 1.0), shoulder * 0.69);
  sideColor = mix(sideColor, vec3(0.018, 0.39, 1.0), lower * 0.52);
  float reflectionDetail = 0.105 + opticalLuminance * 0.14 + smoothstep(0.70, 0.95, color.g) * 0.26;
  sideColor = mix(sideColor, color, reflectionDetail);
  float weight = side * 0.96 * (1.0 - facetWeights.x);
  return mix(color, sideColor, weight);
}

vec3 facetBarycentric(vec2 p, vec2 a, vec2 b, vec2 c) {
  vec2 v = b - a, w = c - a, q = p - a;
  float determinant = v.x * w.y - v.y * w.x;
  float y = (q.x * w.y - q.y * w.x) / determinant;
  float z = (v.x * q.y - v.y * q.x) / determinant;
  return vec3(1.0 - y - z, y, z);
}

float facetCoverage(vec3 barycentric) {
  float edge = min(barycentric.x, min(barycentric.y, barycentric.z));
  float aa = max(fwidth(edge), 0.004);
  return smoothstep(-aa, aa, edge);
}

vec2 sourceFacetPoint(vec3 localPosition, vec2 outward) {
  float across = dot(localPosition.xz, vec2(outward.y, -outward.x));
  float depth = dot(localPosition.xz, outward);
  float c = u.facetProjection.x, s = u.facetProjection.y;
  float y = c * localPosition.y - s * depth;
  float z = s * localPosition.y + c * depth;
  float w = u.projection[2].w * z + u.projection[3].w;
  return vec2(257.6 + across / w * u.facetProjection.z,
              103.8 + (u.facetProjection.w - y / w) * u.facetProjection.z);
}

vec2 outwardAxis(vec3 localNormal) {
  return abs(localNormal.x) > abs(localNormal.z) ? vec2(sign(localNormal.x), 0.0) : vec2(0.0, sign(localNormal.z));
}

float broadFace(vec3 localNormal) {
  vec2 normalXZ = abs(localNormal.xz);
  return 1.0 - smoothstep(0.20, 0.65, min(normalXZ.x, normalXZ.y) / max(max(normalXZ.x, normalXZ.y), 0.0001));
}

vec3 illustratedFacets(vec3 color, Raster r) {
  vec3 localNormal = normalize((u.inverseModel * vec4(normalize(r.normal), 0.0)).xyz);
  // Fixed material coordinates on each broad face. The same reference camera
  // maps the authored facets and the sparkle anchors onto the current cut.
  vec2 outward = outwardAxis(localNormal);
  vec3 tangent = vec3(outward.y, 0.0, -outward.x);
  vec2 p = sourceFacetPoint(r.localPosition, outward);
  float broad = broadFace(localNormal);
  vec3 worldTangent = (u.model * vec4(tangent, 0.0)).xyz;
  vec3 n = normalize(r.normal);
  vec3 light = normalize(vec3(0.6 * sin(u.lightSweep.y), 0.5, 1.0));
  float leftLight = pow(saturate(dot(normalize(n - worldTangent * 0.38), light)), 5.0);
  float rightLight = pow(saturate(dot(normalize(n + worldTangent * 0.38), light)), 5.0);
  if (r.facetWeights.y > 0.0) {
    // Both crown triangles meet at the same upper junction.
    const vec2 crownJunction = vec2(258.8, 128.9);
    const vec2 crownBaseLeft = vec2(108.8, 240.8);
    const vec2 crownBaseRight = vec2(406.8, 240.8);
    vec3 left = facetBarycentric(p, vec2(142.1, 106.3), crownJunction, crownBaseLeft);
    float leftStrength = facetCoverage(left) * (0.18 + 0.40 * leftLight) * saturate(1.0 - left.y);
    color = mix(color, vec3(0.79, 0.988, 1.0), leftStrength * r.facetWeights.y * broad);
    vec3 right = facetBarycentric(p, crownBaseRight, crownJunction, vec2(378.5, 108.2));
    // Light at the left junction, dark at the right edge, in horizontal facet coordinates.
    float gradient = smoothstep(crownJunction.x, crownBaseRight.x, p.x);
    vec3 tint = mix(vec3(0.28, 0.83, 1.0), vec3(0.025, 0.43, 1.0), gradient);
    tint = mix(tint, vec3(0.57, 0.95, 1.0), rightLight * 0.24);
    color = mix(color, tint, facetCoverage(right) * 0.90 * r.facetWeights.y * broad);
  }
  if (r.facetWeights.z > 0.0) {
    // A translucent kite on each broad pavilion face, attached to the surface.
    vec2 kite = vec2(dot(r.localPosition, tangent), r.localPosition.y);
    const float halfWidth = 0.245, top = -0.61, shoulder = -0.70, bottom = -1.075;
    const float upperHeight = top - shoulder, lowerHeight = shoulder - bottom;
    float upperEdge = ((top - kite.y) * halfWidth - abs(kite.x) * upperHeight) / length(vec2(halfWidth, upperHeight));
    float lowerEdge = ((kite.y - bottom) * halfWidth - abs(kite.x) * lowerHeight) / length(vec2(halfWidth, lowerHeight));
    float edge = min(upperEdge, lowerEdge);
    float aa = max(fwidth(edge), 0.0015);
    float coverage = smoothstep(-aa, aa, edge);
    float illumination = saturate(dot(n, normalize(vec3(-0.65, 0.5, 1.0))));
    vec3 tint = mix(vec3(0.48, 0.96, 1.0), vec3(0.70, 1.0, 1.0), illumination);
    float across = saturate(0.5 + kite.x / (2.0 * halfWidth));
    tint *= mix(vec3(1.0), vec3(0.88, 0.97, 1.0), across);
    color = mix(color, tint, coverage * 0.28 * r.facetWeights.z * broad);
  }
  return color;
}

vec3 studio(vec3 d, float phase) {
  float angle = 0.85 * sin(phase);
  d.xz = vec2(cos(angle) * d.x - sin(angle) * d.z, sin(angle) * d.x + cos(angle) * d.z);
  float up = smoothstep(-0.65, 0.85, d.y);
  vec3 c = mix(vec3(0.002, 0.075, 0.88), vec3(0.19, 0.78, 1.0), up);
  float key = pow(saturate(dot(d, normalize(vec3(-0.6, 0.8, 0.7)))), 10.0);
  float stripPosition = 0.12 + 0.48 * sin(phase);
  float strip = exp(-pow((d.x + d.y * 0.42 - stripPosition) * 9.0, 2.0));
  float side = pow(saturate(dot(d, normalize(vec3(0.8, 0.2, -0.5)))), 18.0);
  c = mix(c, vec3(0.68, 0.98, 1.0), key * 0.94);
  c = mix(c, vec3(0.80, 0.99, 1.0), strip * 0.64);
  c += side * vec3(0.1, 0.3, 0.38);
  return c;
}

vec2 facetEdgeRoll(vec2 p, vec2 a, vec2 b) {
  vec2 segment = b - a;
  float edgeLength = length(segment);
  vec2 along = segment / edgeLength;
  vec2 across = vec2(-along.y, along.x);
  float d = dot(p - a, across);
  float progress = dot(p - a, along);
  float width = max(1.6, fwidth(d));
  float q = d / width;
  float ends = smoothstep(0.0, 5.0, progress) * (1.0 - smoothstep(edgeLength - 5.0, edgeLength, progress));
  return across * (q * exp(-q * q) * 0.22 * ends);
}

vec3 polishedNormal(Raster r, vec3 localNormal) {
  // Only the two surface crown diagonals get this tiny optical fillet.
  // Computed unconditionally (derivatives need uniform control flow), then masked.
  vec2 outward = outwardAxis(localNormal);
  float broad = broadFace(localNormal);
  vec2 p = sourceFacetPoint(r.localPosition, outward);
  vec2 roll = facetEdgeRoll(p, vec2(258.8, 128.9), vec2(108.8, 240.8))
            + facetEdgeRoll(p, vec2(258.8, 128.9), vec2(406.8, 240.8));
  if (r.facetWeights.y <= 0.0) return normalize(r.normal);
  vec3 across = vec3(outward.y, 0.0, -outward.x);
  vec3 up = normalize(cross(localNormal, across));
  vec3 normal = normalize(localNormal - (across * roll.x - up * roll.y) * broad * r.facetWeights.y);
  return normalize((u.model * vec4(normal, 0.0)).xyz);
}

float studioPanel(vec3 reflected, vec3 direction, vec2 size) {
  float alignment = dot(reflected, direction);
  vec3 horizontal = normalize(cross(vec3(0.0, 1.0, 0.0), direction));
  vec3 vertical = cross(direction, horizontal);
  vec2 point = vec2(dot(reflected, horizontal), dot(reflected, vertical)) / max(alignment, 0.15);
  // Filter the narrow reflection at small sizes and grazing angles.
  vec2 dx = dFdx(point), dy = dFdy(point);
  vec2 variance = size * size + dx * dx + dy * dy;
  float energy = size.x * size.y / sqrt(variance.x * variance.y);
  return exp(-dot(point * point, 1.0 / variance)) * energy * smoothstep(0.15, 0.40, alignment);
}

vec3 surfaceFinish(vec3 color, vec3 normal, vec3 view) {
  vec3 reflected = reflect(-view, normal);
  float phase = u.lightSweep.y;
  float key = studioPanel(reflected, normalize(vec3(-0.36 + 0.14 * sin(phase), 0.90, 0.72)), vec2(0.16, 0.48));
  float rim = studioPanel(reflected, normalize(vec3(0.72, -0.52 + 0.10 * cos(phase), 0.18)), vec2(0.10, 0.60));
  float fresnel = pow(1.0 - saturate(dot(normal, view)), 4.0);
  float strength = key * (0.35 + 0.35 * fresnel) + rim * (0.16 + 0.30 * fresnel);
  return mix(color, vec3(0.87, 0.99, 1.0), strength);
}

float nearestExit(vec3 origin, vec3 ray, inout vec3 normal) {
  float nearest = 1e5;
  float second = 1e5;
  vec3 secondNormal = normal;
  int count = int(u.viewport.z);
  for (int i = 0; i < 17; ++i) {
    if (i >= count) break;
    float denominator = dot(planes[i].xyz, ray);
    if (denominator > 0.0001) {
      float t = -(dot(planes[i].xyz, origin) + planes[i].w) / denominator;
      if (t > 0.001 && t < nearest) {
        second = nearest; secondNormal = normal;
        nearest = t; normal = planes[i].xyz;
      } else if (t > 0.001 && t < second) {
        second = t; secondNormal = planes[i].xyz;
      }
    }
  }
  // The optical hull inherits a tiny edge fillet, also filtering its reflected boundaries.
  // fwidth stays outside the branch (uniform control flow); 1e5 - 1e5 is harmless.
  float gap = second - nearest;
  float width = max(0.008, min(0.035, fwidth(gap)));
  if (second < 1e5) {
    float blend = 0.5 * (1.0 - smoothstep(0.0, width, gap));
    normal = normalize(mix(normal, secondNormal, blend));
  }
  return nearest;
}

vec4 oppositeFacets(vec3 p, vec3 ray) {
  vec3 origin = p + ray * 0.004;
  vec3 normal = vec3(0.0, 1.0, 0.0);
  float dist = nearestExit(origin, ray, normal);
  if (dist > 100.0 || normal.y > 0.95) return vec4(0.0);
  vec3 hit = origin + ray * dist;
  vec3 worldNormal = (u.model * vec4(normal, 0.0)).xyz;
  vec3 tangent = normalize(vec3(normal.z + 0.00001, 0.0, -normal.x));
  float across = dot(hit, tangent);
  vec2 authored = vec2(across * 225.8, (normal.y > 0.0 ? 0.3065 - hit.y : -0.54 - hit.y) * 239.0);
  vec3 color;
  if (normal.y > 0.0) {
    color = referenceCrown(authored, u.crownGradient);
    float response = pow(saturate(dot(worldNormal, normalize(vec3(0.7 * sin(u.lightSweep.y), 0.55, -1.0)))), 4.0);
    color = mix(color * vec3(0.45, 0.70, 0.98), vec3(0.60, 0.94, 1.0), response * 0.55);
  } else {
    // The pavilion is one connected eight-facet hull; looking through its front reveals the opposite facet.
    vec3 reflected = normalize((u.model * vec4(reflect(ray, normal), 0.0)).xyz);
    vec3 environment = studio(reflected, u.lightSweep.y);
    float response = pow(saturate(dot(worldNormal, normalize(vec3(-0.4, -0.55, -1.0)))), 2.0);
    color = mix(vec3(0.012, 0.38, 1.0), vec3(0.27, 0.94, 1.0), response * 0.65 + environment.g * 0.35);
    color = mix(color, environment, 0.28);
    float panel = studioPanel(reflected, normalize(vec3(-0.36, 0.90, 0.72)), vec2(0.20, 0.52));
    color = mix(color, vec3(0.72, 0.98, 1.0), panel * 0.48);
  }
  float coverage = smoothstep(0.03, 0.35, dist) * exp(-dist * 0.16);
  return vec4(color, coverage);
}

float sourceBand(vec2 p, vec4 gradient) {
  vec2 direction = gradient.zw - gradient.xy;
  float t = dot(p - gradient.xy, direction) / dot(direction, direction);
  return saturate(1.0 - abs(t - 0.49) / 0.49);
}

float facetSweep(Raster r, vec3 localNormal) {
  vec3 tangent = normalize(vec3(localNormal.z + 0.00001, 0.0, -localNormal.x));
  float across = dot(r.localPosition, tangent) * 225.8;
  float side = smoothstep(0.20, 0.50, abs(normalize(r.normal).x));
  bool right = r.normal.x > 0.0;
  vec4 crown = mix(u.crownSweep, right ? u.rightCrownSweep : u.leftCrownSweep, side);
  vec4 pavilion = mix(u.pavilionSweep, right ? u.rightPavilionSweep : u.leftPavilionSweep, side);
  return sourceBand(vec2(across, (0.3065 - r.localPosition.y) * 239.0), crown) * r.facetWeights.y
       + sourceBand(vec2(across, (-0.54 - r.localPosition.y) * 235.0), pavilion) * r.facetWeights.z;
}

vec3 internalEnvironment(vec3 position, vec3 direction, float pavilion) {
  vec3 worldPosition = (u.model * vec4(position, 1.0)).xyz;
  vec3 worldDirection = normalize((u.model * vec4(direction, 0.0)).xyz);
  // A finite studio gives each reflected facet a spatial gradient rather than a flat swatch.
  float along = dot(worldPosition, worldDirection);
  float dist = -along + sqrt(max(0.0, along * along + 3.2 * 3.2 - dot(worldPosition, worldPosition)));
  vec3 samplePoint = normalize(worldPosition + worldDirection * dist);
  vec3 environment = studio(samplePoint, u.lightSweep.y);
  // Uniform blue surround below the crown; narrow studio panels keep moving reflections.
  float phase = u.lightSweep.y;
  float key = studioPanel(samplePoint, normalize(vec3(-0.12 + 0.035 * sin(phase), -0.60, 0.79)), vec2(0.055, 0.52));
  float rim = studioPanel(samplePoint, normalize(vec3(0.12, 0.75 + 0.035 * cos(phase), -0.65)), vec2(0.055, 0.50));
  if (pavilion <= 0.0) return environment;
  vec3 lower = mix(vec3(0.015, 0.41, 1.0), vec3(0.58, 0.94, 1.0), key * 0.95);
  lower = mix(lower, vec3(0.24, 0.78, 1.0), rim * 0.82);
  return pavilion < 1.0 ? mix(environment, lower, pavilion) : lower;
}

float reflectionTriangle(vec3 origin, vec3 ray, vec3 a, vec3 b, vec3 c, out vec3 coordinates) {
  vec3 ab = b - a, ac = c - a, crossRay = cross(ray, ac);
  float determinant = dot(ab, crossRay);
  coordinates = vec3(0.0);
  if (abs(determinant) < 0.00001) return 1e5;
  vec3 offset = origin - a;
  float uu = dot(offset, crossRay) / determinant;
  vec3 q = cross(offset, ab);
  float vv = dot(ray, q) / determinant;
  float t = dot(ac, q) / determinant;
  coordinates = vec3(1.0 - uu - vv, uu, vv);
  return min(min(coordinates.x, coordinates.y), coordinates.z) >= 0.0 && t > 0.001 ? t : 1e5;
}

vec3 pavilionReflections(vec3 color, vec3 origin, vec3 ray) {
  const vec2 ring[8] = vec2[8](vec2(0.0, 1.0), vec2(0.70710678, 0.70710678),
    vec2(1.0, 0.0), vec2(0.70710678, -0.70710678), vec2(0.0, -1.0),
    vec2(-0.70710678, -0.70710678), vec2(-1.0, 0.0), vec2(-0.70710678, 0.70710678));
  // One convex fan of reflected facets, shared by every camera orientation.
  const vec3 top = vec3(0.0, -0.28, 0.0), tip = vec3(0.0, -1.06, 0.0);
  float entry = 0.0, exit = 1e5;
  vec3 entryNormal = vec3(0.0, 1.0, 0.0);
  vec3 worldRay = normalize((u.model * vec4(ray, 0.0)).xyz);
  vec3 illumination = normalize(vec3(-0.55, 0.65, 1.0));
  vec3 sideColor = vec3(0.0);
  float sideWeight = 0.0;
  vec3 veilColor = vec3(0.0);
  float veilWeight = 0.0;
  for (int i = 0; i < 8; ++i) {
    vec2 current = ring[i], next = ring[(i + 1) % 8];
    vec3 a = vec3(current.x * 0.28, -0.68, current.y * 0.28);
    vec3 b = vec3(next.x * 0.28, -0.68, next.y * 0.28);
    for (int part = 0; part < 2; ++part) {
      vec3 peak = part == 0 ? top : tip;
      vec3 n = normalize(cross(a - peak, b - peak));
      if (dot(n, (a + b + peak) / 3.0 - vec3(0.0, -0.68, 0.0)) < 0.0) n = -n;
      float denominator = dot(n, ray);
      float side = dot(n, origin - peak);
      if (abs(denominator) < 0.00001) {
        if (side > 0.0) exit = -1.0;
      } else {
        float t = -side / denominator;
        if (denominator < 0.0 && t > entry) { entry = t; entryNormal = n; }
        if (denominator > 0.0) exit = min(exit, t);
      }
    }
    vec3 radial = vec3(current.x, 0.0, current.y);
    vec3 tangent = vec3(current.y, 0.0, -current.x);
    // Broad, low-contrast echoes of the crown stretch through the volume towards the lower junction,
    // continued above the girdle so their top fade stays hidden behind the crown.
    const float upperY = 0.20;
    const float extension = (upperY + 0.12) / 0.65;
    const float upperRadius = 0.64 + (0.64 - 0.19) * extension;
    const float upperWidth = 0.265097 + (0.265097 - 0.078701) * extension;
    vec3 upperLeft = radial * upperRadius - tangent * upperWidth + vec3(0.0, upperY, 0.0);
    vec3 upperRight = radial * upperRadius + tangent * upperWidth + vec3(0.0, upperY, 0.0);
    vec3 lowerLeft = radial * 0.19 - tangent * 0.078701 + vec3(0.0, -0.77, 0.0);
    vec3 lowerRight = radial * 0.19 + tangent * 0.078701 + vec3(0.0, -0.77, 0.0);
    vec3 ribbonCoordinates;
    float ribbon = reflectionTriangle(origin, ray, upperLeft, upperRight, lowerLeft, ribbonCoordinates);
    if (ribbon > 100.0) ribbon = reflectionTriangle(origin, ray, upperRight, lowerRight, lowerLeft, ribbonCoordinates);
    if (ribbon < 100.0) {
      vec3 hit = origin + ray * ribbon;
      float depth = (-0.12 - hit.y) / 0.65;
      float across = dot(hit, tangent);
      float right = mix(0.265097, 0.078701, depth), left = -right;
      vec3 worldRadial = normalize((u.model * vec4(radial, 0.0)).xyz);
      float facing = saturate(-dot(worldRadial, worldRay));
      float fade = smoothstep(0.0, 0.065, upperY - hit.y) * (1.0 - smoothstep(0.70, 1.0, depth));
      float opacity = fade * (0.16 + 0.84 * facing);
      float light = saturate(0.5 + 0.5 * dot(worldRadial, illumination));
      float acrossPlane = saturate((across - left) / (right - left));
      float diagonal = smoothstep(-0.045, 0.045, acrossPlane - 0.35 - depth * 0.55);
      float middle = smoothstep(0.12, 0.24, depth) * (1.0 - smoothstep(0.50, 0.64, depth));
      vec3 tint = mix(vec3(0.015, 0.56, 1.0), vec3(0.33, 0.97, 1.0), light);
      tint = mix(tint, vec3(0.42, 0.97, 1.0), middle * (0.32 - 0.20 * diagonal));
      tint = mix(tint, vec3(0.015, 0.46, 1.0), diagonal * 0.24);
      veilColor += tint * opacity;
      veilWeight += opacity;
    }
    vec3 aSide = radial * 0.72 + tangent * 0.055 + vec3(0.0, -0.30, 0.0);
    vec3 bSide = radial * 0.49 - tangent * 0.105 + vec3(0.0, -0.60, 0.0);
    vec3 cSide = radial * 0.15 + tangent * 0.020 + vec3(0.0, -0.93, 0.0);
    vec3 coordinates;
    float t = reflectionTriangle(origin, ray, aSide, bSide, cSide, coordinates);
    if (t < 100.0) {
      vec3 worldRadial = normalize((u.model * vec4(radial, 0.0)).xyz);
      // Long glints read at the sides; a front-facing sector must not become an opaque needle.
      float sideFacing = 1.0 - abs(dot(worldRadial, worldRay));
      float edge = min(coordinates.y, coordinates.z);
      float opacity = smoothstep(0.20, 0.75, sideFacing) * smoothstep(0.0, 0.085, edge) * smoothstep(0.0, 0.035, coordinates.x);
      float light = 0.5 + 0.5 * dot(worldRadial, illumination);
      vec3 tint = mix(vec3(0.16, 0.80, 1.0), vec3(0.85, 1.0, 1.0), light);
      sideColor += tint * opacity;
      sideWeight += opacity;
    }
  }
  float strength = saturate(u.parameters.y / 0.72);
  if (veilWeight > 0.0) color = mix(color, veilColor / veilWeight, (1.0 - exp(-veilWeight * 0.46)) * strength);
  if (sideWeight > 0.0) color = mix(color, sideColor / sideWeight, (1.0 - exp(-sideWeight * 1.4)) * strength);
  // Derivatives before the branch (uniform control flow).
  vec3 entryWorldNormal = normalize((u.model * vec4(entryNormal, 0.0)).xyz);
  float gleam = studioPanel(reflect(worldRay, entryWorldNormal),
    normalize(vec3(-0.35 + 0.15 * sin(u.lightSweep.y), 0.60, 0.75)), vec2(0.25, 0.65));
  if (entry < exit) {
    vec3 hit = origin + ray * entry;
    float light = saturate(dot(entryWorldNormal, normalize(vec3(-0.65, 0.15, 1.0))));
    vec3 tint = mix(vec3(0.025, 0.54, 1.0), vec3(0.40, 0.92, 1.0), light);
    tint = mix(tint, vec3(0.72, 0.99, 1.0), gleam * 0.16);
    float thickness = smoothstep(0.0, 0.18, exit - entry);
    float fade = smoothstep(-1.07, -0.93, hit.y);
    color = mix(color, tint, 0.28 * thickness * fade * strength);
  }
  return color;
}

vec3 interior(vec3 p, vec3 direction, float pavilion) {
  vec3 accumulated = vec3(0.0);
  float weight = 0.60;
  vec3 origin = p + direction * 0.004;
  for (int bounce = 0; bounce < 2; ++bounce) {
    vec3 n = vec3(0.0, 1.0, 0.0);
    float dist = nearestExit(origin, direction, n);
    if (dist > 100.0) break;
    vec3 hit = origin + direction * dist;
    vec3 outgoing = refract(direction, -n, 1.62);
    vec3 reflection = reflect(direction, n);
    vec3 color = internalEnvironment(hit, reflection, pavilion);
    vec3 transmittedColor = internalEnvironment(hit, outgoing, pavilion);
    if (dot(outgoing, outgoing) > 0.01) {
      // Fresnel approaches total internal reflection continuously.
      float incident = saturate(dot(direction, n));
      float transmitted = saturate(dot(outgoing, n));
      float rs = (1.62 * incident - transmitted) / (1.62 * incident + transmitted);
      float rp = (incident - 1.62 * transmitted) / (incident + 1.62 * transmitted);
      float reflectance = 0.5 * (rs * rs + rp * rp);
      color = mix(transmittedColor, color, reflectance);
    }
    color *= exp(-vec3(0.30, 0.07, 0.006) * dist);
    accumulated += weight * color;
    weight *= 0.52;
    direction = reflection;
    origin = hit + direction * 0.004;
  }
  return accumulated;
}

vec3 materialPalette(vec3 color, vec3 facetWeights, int appearance) {
  if (appearance == 1) {
    // Keep the authored icy blue in the middle values instead of a cold grey.
    float tone = smoothstep(0.0, 0.92, saturate(dot(color.rg, vec2(0.22, 0.78))));
    vec3 shadow = mix(vec3(0.63, 0.77, 0.95), vec3(0.733, 0.859, 1.0), facetWeights.y * 0.25);
    const vec3 ice = vec3(207.0, 241.0, 253.0) / 255.0; // #cff1fd
    vec3 upper = mix(shadow, ice, smoothstep(0.0, 0.62, tone));
    upper = mix(upper, vec3(1.0), smoothstep(0.58, 1.0, tone) * 0.92);
    vec3 lower = mix(vec3(0.59, 0.71, 0.865), vec3(0.96, 0.985, 1.0), pow(tone, 1.10));
    return mix(upper, lower, facetWeights.z);
  }
  if (appearance == 2) {
    float tone = smoothstep(0.035, 0.90, saturate(dot(color.rg, vec2(0.20, 0.80))));
    vec3 cool = mix(vec3(0.025, 0.29, 0.83), vec3(0.38, 0.78, 1.0), smoothstep(0.0, 0.65, tone));
    vec3 upper = mix(cool, vec3(0.94, 0.99, 1.0), smoothstep(0.45, 1.0, tone));
    vec3 lower = mix(vec3(0.025, 0.34, 0.92), vec3(0.90, 0.99, 1.0), pow(tone, 2.35));
    return mix(upper, lower, facetWeights.z);
  }
  return color;
}

vec3 coolInnerGlow(vec3 color, vec3 position, vec3 ray, vec3 normal, vec3 localNormal, vec3 view) {
  // Thin parts transmit a white light band into the stone, following the 3D cut.
  float thickness = 1e5;
  float planeAlignment = 0.0;
  int count = int(u.viewport.z);
  for (int i = 0; i < 17; ++i) {
    if (i >= count) break;
    planeAlignment = max(planeAlignment, dot(planes[i].xyz, localNormal));
    float denominator = dot(planes[i].xyz, ray);
    if (denominator > 0.0001) {
      float exitDistance = -(dot(planes[i].xyz, position) + planes[i].w) / denominator;
      thickness = min(thickness, max(0.0, exitDistance));
    }
  }
  // Scale the penetration with the taper: the tip gets a narrow rim, not a solid white pool.
  float crossSection = clamp((position.y + 1.09) / 0.98, 0.07, 1.0);
  float inner = 1.0 - smoothstep(0.01, 0.80 * crossSection, thickness);
  float grazing = 1.0 - saturate(dot(normal, view));
  float roundedEdge = smoothstep(0.0015, 0.028, 1.0 - planeAlignment);
  float bevel = pow(grazing, 3.0);
  float glow = saturate(inner * 0.85 + bevel * 0.85 + roundedEdge * smoothstep(0.18, 0.80, grazing));
  return mix(color, vec3(0.96, 1.0, 1.0), glow);
}

vec4 diamondSurface(Raster r) {
  vec3 n = normalize(r.normal);
  float cameraDistance = -u.projection[3].w / u.projection[2].w;
  vec3 view = normalize(vec3(0.0, 0.0, cameraDistance) - r.worldPosition);
  vec3 localView = (u.inverseModel * vec4(-view, 0.0)).xyz;
  vec3 localNormal = normalize((u.inverseModel * vec4(n, 0.0)).xyz);
  vec3 transmitted = refract(localView, localNormal, 1.0 / 1.62);
  vec3 optical = interior(r.localPosition, transmitted, r.facetWeights.z);
  vec3 reflection = studio(reflect(-view, n), u.lightSweep.y);
  float fresnel = 0.08 + 0.46 * pow(1.0 - saturate(dot(n, view)), 4.0);

  float height = saturate((r.localPosition.y + 1.05) / 1.65);
  float key = saturate(dot(n, normalize(vec3(-0.65, 0.85, 1.0))));
  float left = saturate(0.52 - r.worldPosition.x * 0.43);
  vec3 blue = vec3(0.008, 0.22, 1.0);
  vec3 cyan = vec3(0.29, 0.87, 1.0);
  vec3 body = mix(blue, cyan, saturate(key * 0.60 + left * 0.38));
  float verticalBand = mix(0.5 + 0.5 * sin(height * 18.0 + n.x * 3.0), 1.0, r.facetWeights.z);
  body *= mix(vec3(0.24, 0.48, 0.96), vec3(1.0), verticalBand * 0.5 + 0.5);
  float opticalLuminance = smoothstep(0.25, 0.85, optical.g);
  // A cyan body tone in the pavilion; crown and table keep their palette.
  vec3 opticalShadow = mix(vec3(0.005, 0.13, 1.0), vec3(0.015, 0.36, 1.0), r.facetWeights.z);
  vec3 opticalLight = mix(vec3(0.58, 0.97, 1.0), vec3(0.45, 0.99, 1.0), r.facetWeights.z);
  optical = mix(opticalShadow, opticalLight, opticalLuminance);
  float opticalWeight = u.parameters.y * mix(0.90, 0.08, r.facetWeights.y);
  vec3 color = mix(body, optical, opticalWeight);
  color = mix(color, reflection, fresnel);

  float crownGlow = smoothstep(0.10, 0.60, r.localPosition.y) * left;
  color = mix(color, vec3(0.70, 0.99, 1.0), crownGlow * 0.58);
  float crownLight = pow(saturate(dot(n, normalize(vec3(-0.38, 0.55, 1.0)))), 9.0);
  crownLight *= smoothstep(-0.03, 0.28, r.localPosition.y);
  color = mix(color, vec3(0.65, 0.98, 1.0), crownLight * 0.35);
  vec3 facetBase = color;
  if (r.facetWeights.y > 0.0) {
    float softbox = exp(-pow((r.worldPosition.x + 0.42) * 1.6, 2.0) - pow((r.worldPosition.y - 0.32) * 2.2, 2.0));
    color = mix(color, vec3(0.71, 0.99, 1.0), softbox * crownLight * 0.36);
    float shadow = pow(saturate(1.0 - key), 1.4);
    color = mix(color, vec3(0.015, 0.08, 1.0), shadow * 0.7);
    vec3 tangent = normalize(vec3(localNormal.z, 0.0, -localNormal.x));
    vec2 authoredPosition = vec2(dot(r.localPosition, tangent) * 225.8 + n.x * 65.0,
                                 (0.3065 - r.localPosition.y) * 244.0);
    color = mix(referenceCrown(authoredPosition, u.crownGradient), color, 0.28);
    color = mix(facetBase, color, r.facetWeights.y);
  }
  if (r.facetWeights.z > 0.0) {
    color = mix(color, mix(vec3(0.008, 0.32, 1.0), optical, 0.86), r.facetWeights.z * u.parameters.y);
  }
  float facetFlash = smoothstep(0.20, 0.78, opticalLuminance);
  float flashWeight = mix(0.24, 0.08, r.facetWeights.y);
  color *= mix(vec3(1.0), mix(vec3(0.76, 0.82, 0.99), vec3(1.0), facetFlash), flashWeight);
  color = mix(color, vec3(0.66, 0.98, 1.0), pow(facetFlash, 2.0) * 0.24 * flashWeight);
  color = lateralDepth(color, n, r.localPosition.y, r.facetWeights, opticalLuminance);
  color = mix(color, optical, r.facetWeights.z * u.parameters.y * 0.48);
  color = mix(color, body, r.facetWeights.z * pow(saturate(n.z), 2.0) * 0.32);
  vec3 rearRay = normalize(mix(localView, transmitted, mix(0.68, 0.18, r.facetWeights.y)));
  vec4 rear = oppositeFacets(r.localPosition, rearRay);
  float transmission = mix(0.34, 0.12 + u.lightSweep.z * 0.65, r.facetWeights.y) * u.parameters.y;
  float facing = smoothstep(0.12, 0.65, n.z);
  color = mix(color, rear.rgb, rear.a * transmission * facing * mix(1.0, 0.12, r.facetWeights.y));
  vec3 detailRay = normalize(mix(localView, transmitted, 0.16));
  vec3 reflected = u.parameters.y > 0.0 ? pavilionReflections(color, r.localPosition, detailRay) : color;
  color = mix(color, reflected, r.facetWeights.z);
  float tipGlow = pow(saturate((-r.localPosition.y - 0.55) / 0.50), 2.0);
  color = mix(color, vec3(0.57, 0.96, 1.0), tipGlow * 0.20);
  // A shallow, translucent image of the table, like Layer 36 in the Lottie reference.
  vec3 tableRay = localView;
  tableRay.y *= 0.72;
  float tableHeight = -planes[0].w / planes[0].y;
  float tableDistance = (tableHeight - r.localPosition.y) / max(tableRay.y, 0.001);
  vec2 tableHit = (r.localPosition + tableRay * tableDistance).xz;
  const float extent = 0.632;
  const float corner = 0.285;
  vec2 q = abs(tableHit);
  float tableEdge = max(max(q.x, q.y) - extent, (q.x + q.y - extent - corner) * 0.70710678);
  float tableAA = max(fwidth(tableEdge), 0.001);
  if (tableRay.y > 0.001) {
    float coverage = 1.0 - smoothstep(-tableAA, tableAA, tableEdge);
    vec2 direction = tableRay.xz / max(length(tableRay.xz), 0.0001);
    float depth = saturate(0.5 + dot(tableHit, direction) / (2.0 * extent));
    // Source opacity: 80% group opacity times a 49...65% fill gradient.
    float opacity = mix(0.39, 0.52, depth);
    color = mix(color, vec3(0.765, 0.988, 1.0), coverage * opacity * saturate(u.parameters.y / 0.72) * r.facetWeights.y);
  }
  color = illustratedFacets(color, r);
  color = mix(color, vec3(0.63, 0.96, 1.0), 0.58 * r.facetWeights.x);
  float sweep = facetSweep(r, localNormal);
  float sweepCore = smoothstep(0.35, 1.0, sweep);
  color = mix(color, vec3(0.592, 0.953, 1.0), sweep * 0.20 + sweepCore * sweepCore * 0.62);
  color = surfaceFinish(color, polishedNormal(r, localNormal), view);
  int appearance = int(u.appearance.x);
  color = materialPalette(color, r.facetWeights, appearance);
  if (appearance == 2) {
    color = coolInnerGlow(color, r.localPosition, localView, n, localNormal, view);
  }
  return vec4(saturate(color * u.parameters.z), 1.0);
}

// MARK: Lens (diamondLensFragment): what lies behind the stone, bent by its facets.

struct LensUniforms {
  vec4 rect;       // source rect in CSS px, relative to the canvas center (y down)
  vec4 uv;         // region of the texture
  vec4 viewport;   // pixel center (xy), pixels per CSS px, hull edge count
  vec4 parameters; // strength, yaw, radius in CSS px, mode (0 mask, 1 dark mask, 2 color, <0 off)
  vec4 center;     // stone center in CSS px (xy)
  vec4 tint;       // color backdrop's background color (rgb), enabled (w)
};
uniform LensUniforms lens;
uniform vec4 lensEdges[128]; // screen-space convex hull of the stone: normal.xy, offset
uniform sampler2D lensTexture;

// Luminosity blend helpers (W3C compositing spec), on unpremultiplied sRGB-encoded colors.
float blendLum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
vec3 blendClipColor(vec3 c) {
  float l = blendLum(c), n = min(c.r, min(c.g, c.b)), x = max(c.r, max(c.g, c.b));
  if (n < 0.0) c = l + (c - l) * l / max(l - n, 1e-4);
  if (x > 1.0) c = l + (c - l) * (1.0 - l) / max(x - l, 1e-4);
  return c;
}
vec3 blendSetLum(vec3 c, float l) { return blendClipColor(c + (l - blendLum(c))); }

// Maps a lens point (CSS px from the canvas center) into the texture, or returns a negative
// coordinate outside the source rect. textureLod: no implicit derivatives inside branches.
vec2 lensSourceUV(vec2 samplePosition, vec2 halfTexel) {
  vec2 glyphPosition = (samplePosition - lens.rect.xy) / lens.rect.zw;
  if (any(lessThan(glyphPosition, vec2(0.0))) || any(greaterThan(glyphPosition, vec2(1.0)))) return vec2(-1.0);
  return clamp(lens.uv.xy + glyphPosition * lens.uv.zw, lens.uv.xy + halfTexel, lens.uv.xy + lens.uv.zw - halfTexel);
}

vec4 diamondLens(vec4 stone, Raster r) {
  // gl_FragCoord has a bottom-left origin; the lens works in y-down CSS px like the Metal version.
  vec2 pixel = vec2(gl_FragCoord.x, 2.0 * lens.viewport.y - gl_FragCoord.y);
  vec2 position = (pixel - lens.viewport.xy) / lens.viewport.z;
  float distanceToEdge = 1e9;
  int edgeCount = int(lens.viewport.w);
  for (int i = 0; i < 128; ++i) {
    if (i >= edgeCount) break;
    distanceToEdge = min(distanceToEdge, dot(lensEdges[i].xy, position) + lensEdges[i].z);
  }
  if (distanceToEdge <= 0.0) return stone;
  // Fades lens effects out over the stone's outermost 1.5 px.
  float rimFade = smoothstep(0.0, 1.5, distanceToEdge);

  bool colorBackdrop = lens.parameters.w > 1.5;
  float strength = lens.parameters.x;
  // A color backdrop is always fully bent; strength only sets how much of it shows.
  float edge = smoothstep(0.0, 5.0, distanceToEdge) * (colorBackdrop ? 1.0 : strength);
  float radius = max(lens.parameters.z, 1.0);
  vec2 local = position - lens.center.xy;
  vec2 q = local / radius;
  float facet = (asin(clamp(q.x, -0.999, 0.999)) - lens.parameters.y) / (PI / 4.0);
  float wave = sin(PI * facet);
  float prism = sign(wave) * pow(abs(wave), 0.6);
  float crown = 1.0 - smoothstep(-0.25, 0.05, q.y);
  vec2 bend = vec2(prism * 0.12, mix(-0.08 * q.y, 0.09, crown)) * radius;
  float zoom = mix(0.84, 0.72, crown * (1.0 - smoothstep(0.2, 0.6, abs(q.x))));
  vec2 halfTexel = 0.5 / vec2(textureSize(lensTexture, 0));

  if (colorBackdrop) {
    vec3 stoneColor = stone.rgb / max(stone.a, 1e-4);
    // The stone takes the surroundings' hue, keeping its own shading (luminosity blend), capped
    // below white with the brightest part added back, so near-white facets stay light blue.
    if (lens.tint.w > 0.5) {
      float luminance = blendLum(stoneColor);
      float tinted = min(luminance, 0.82);
      stoneColor = blendSetLum(lens.tint.rgb, tinted) + (luminance - tinted) * 0.6;
    }
    // Dispersion ("fire") differs per facet: its own direction and amount, more at steep facet
    // edges and in the pavilion. Facets move with the rotation, so the fringes change as it turns.
    float facetIndex = floor(facet) + (crown > 0.5 ? 17.0 : 0.0);
    float facetRandom = fract(sin(facetIndex * 12.9898 + 4.1414) * 43758.5453);
    float facetAngle = atan(bend.y, bend.x + 1e-4) + (facetRandom - 0.5) * 2.4;
    float fire = mix(0.25, 1.0, facetRandom) * mix(0.35, 1.0, abs(prism)) * mix(1.3, 0.7, crown);
    vec2 fireOffset = vec2(cos(facetAngle), sin(facetAngle)) * fire * edge * radius * 0.05;
    // Magnified ~1.5-1.7x, so the bending, tint and fire read clearly.
    vec2 basePosition = lens.center.xy + local * mix(1.0, zoom * 0.8, edge) + bend * edge;
    vec3 channelColor = vec3(0.0), channelAlpha = vec3(0.0);
    for (int channel = 0; channel < 3; ++channel) {
      // Red bends least, blue most.
      vec2 uv = lensSourceUV(basePosition + fireOffset * (float(channel) - 1.0), halfTexel);
      if (uv.x < 0.0) continue;
      vec4 texel = textureLod(lensTexture, uv, 0.0);
      channelColor[channel] = texel[channel];
      channelAlpha[channel] = texel.a;
    }
    // Bright, reflective facets mostly show their highlight; darker ones are clear.
    float transmission = mix(0.2, 1.0, 1.0 - smoothstep(0.4, 0.95, blendLum(stoneColor)));
    // Premultiplied backdrop, filtered by the facet's color as if the light passed through it.
    vec3 filtered = channelColor * mix(vec3(1.0), stoneColor, 0.5);
    // The crown is mostly surface highlight, so less shows through it.
    float crownFacets = saturate(r.facetWeights.x + r.facetWeights.y);
    float amount = strength * transmission * mix(1.0, 0.6, crownFacets) * rimFade;
    vec3 color = stoneColor * (1.0 - channelAlpha * amount) + filtered * amount;

    // Internal reflections in the pavilion: an inverted, smaller image of the surroundings,
    // pushed along the facet normal; fainter and softer the farther the reflected point.
    float pavilion = saturate(r.facetWeights.z);
    if (pavilion > 0.01) {
      vec3 normal = normalize(r.normal);
      vec3 reflected = reflect(vec3(0.0, 0.0, -1.0), normal);
      vec2 offset = -local * 0.55 + vec2(reflected.x, -reflected.y) * radius * 0.9;
      float travel = length(offset);
      float depthFade = exp(-travel / (radius * 1.1));
      float blur = travel * 0.04;
      vec4 reflection = vec4(0.0);
      float samples = 0.0;
      for (int tap = 0; tap < 4; ++tap) {
        vec2 tapOffset = vec2(tap % 2 == 0 ? -1.0 : 1.0, tap < 2 ? -1.0 : 1.0) * blur;
        vec2 reflectionUV = lensSourceUV(lens.center.xy + offset + tapOffset, halfTexel);
        if (reflectionUV.x < 0.0) continue;
        reflection += textureLod(lensTexture, reflectionUV, 0.0);
        samples += 1.0;
      }
      if (samples > 0.0) {
        reflection /= samples;
        // Schlick's Fresnel with diamond's F0 = 0.17.
        float schlick = 0.17 + 0.83 * pow(1.0 - saturate(abs(normal.z)), 5.0);
        float reflectionAmount = strength * pavilion * mix(0.35, 0.8, schlick) * depthFade * rimFade;
        color = color * (1.0 - reflection.a * reflectionAmount)
          + reflection.rgb * mix(vec3(1.0), stoneColor, 0.15) * reflectionAmount;
      }
    }
    stone.rgb = color * stone.a;
    return stone;
  }

  vec2 uv = lensSourceUV(lens.center.xy + local * mix(1.0, zoom, edge) + bend * edge, halfTexel);
  if (uv.x < 0.0) return stone;
  float opacity = textureLod(lensTexture, uv, 0.0).r * 0.55 * strength * rimFade;
  vec3 tint = lens.parameters.w > 0.5 ? vec3(0.02, 0.13, 0.48) : vec3(1.0);
  stone.rgb = mix(stone.rgb, tint * stone.a, opacity);
  return stone;
}

void main() {
  Raster r = Raster(vLocalPosition, vNormal, vWorldPosition, vFacetWeights);
  vec4 stone = diamondSurface(r);
  fragColor = lens.parameters.w >= 0.0 ? diamondLens(stone, r) : stone;
}
`

// MARK: - Surface sparkles

export const sparkleVertex =
    common +
    uniforms +
    /* glsl */ `
layout(location = 0) in vec4 aContours; // wide.xy, narrow.zw, in the original authoring units
layout(location = 1) in float aLayer;   // 0 circular glow, 1 star glow, 2 white core, 3/4 small glow/core
uniform vec4 anchorPositions[8];
uniform vec4 anchorNormals[8];
uniform int instanceOffset;
out vec2 vSourcePoint;
flat out float vStrength;
flat out int vLayer;
void main() {
  int instance = gl_InstanceID + instanceOffset;
  int layer = int(aLayer + 0.5);
  const float authoringToWorld = 2.0 / 447.9;
  vec3 local = anchorPositions[instance].xyz;
  vec3 normal = anchorNormals[instance].xyz;
  if (instance == 0) {
    float c = cos(u.sparkleHalo.y), s = sin(u.sparkleHalo.y);
    local.xz = vec2(c * local.x + s * local.z, -s * local.x + c * local.z);
    normal.xz = vec2(c * normal.x + s * normal.z, -s * normal.x + c * normal.z);
  }
  if (instance != 0) local += normal * 0.008;
  vec3 worldNormal = (u.model * vec4(normal, 0.0)).xyz;
  float pulse = pow(max(0.0, sin(u.parameters.x * 2.1 + float(instance) * 2.37 + 1.5)), 16.0);
  float front = instance == 0 ? u.sparkleHalo.w : smoothstep(0.15, 0.55, worldNormal.z);
  float strength = front * u.parameters.w;
  vec4 center = u.projection * u.model * vec4(local, 1.0);
  float morph = instance == 0 ? u.sparkleShape.y : 0.0;
  vec2 sourcePoint = mix(aContours.xy, aContours.zw, morph);
  float groupScale = 1.0;
  vec2 offset = vec2(0.0);
  if (layer == 0) { groupScale = u.sparkleHalo.x; offset.y = 5.9; }
  if (layer == 1) { groupScale = u.sparkleShape.w; offset.y = -0.8; }
  if (layer == 2) { groupScale = u.sparkleShape.z; offset.y = -0.9; }
  if (layer == 3) { groupScale = 0.309; offset = vec2(0.6, -0.4); }
  float scale = instance == 0 ? u.sparkleShape.x * u.sparkleHalo.w : (0.632 / 0.75) * pulse;
  vec2 point = (sourcePoint * groupScale + offset) * authoringToWorld * scale;
  // Correct the anchor with the gem, but keep the authored flare proportions.
  gl_Position = center + center.w * vec4(point.x * u.projection[0][0] / u.sparkleHalo.z,
                                         -point.y * u.projection[1][1], 0.0, 0.0);
  vSourcePoint = sourcePoint;
  vStrength = strength;
  vLayer = layer;
}
`

export const sparkleFragment =
    common +
    uniforms +
    /* glsl */ `
in vec2 vSourcePoint;
flat in float vStrength;
flat in int vLayer;
out vec4 fragColor;
float radialOpacity(float radius, float first, float middle) {
  if (radius <= first) return 1.0;
  if (radius <= middle) return mix(1.0, 0.5, (radius - first) / (middle - first));
  return 0.5 * saturate((1.0 - radius) / (1.0 - middle));
}
void main() {
  float alpha = 1.0;
  vec3 color = vec3(1.0);
  if (vLayer == 0) {
    float r = length(vSourcePoint - vec2(-0.5, 0.2)) / 108.5;
    alpha = radialOpacity(r, 0.312, 0.624) * 0.60;
  } else if (vLayer == 1) {
    float r = length(vSourcePoint - vec2(-0.5, 0.9)) / 113.1;
    alpha = radialOpacity(r, 0.297, 0.503) * 0.60;
    color = vec3(0.82, 1.0, 0.902);
  } else if (vLayer == 2) {
    alpha = 0.96;
  } else if (vLayer == 3) {
    float r = saturate(length(vSourcePoint) / length(vec2(176.0, -170.0)));
    alpha = 1.0 - r;
    color = mix(vec3(0.694, 0.969, 1.0), vec3(0.663, 0.957, 1.0), r);
  }
  int appearance = int(u.appearance.x);
  if (appearance == 1) {
    color = vLayer == 0 ? vec3(0.635, 0.749, 1.0) : vec3(1.0);
    // The white material keeps only the circular halo, without the star-shaped glow.
    if (vLayer == 1) alpha = 0.0;
  } else if (appearance == 2) {
    color = vLayer == 1 ? vec3(0.82, 0.96, 1.0) : vec3(1.0);
  }
  // Alpha above 1 would subtract the stone below; clamp it.
  alpha = saturate(alpha * vStrength);
  fragColor = vec4(color * alpha, alpha);
}
`
