  precision highp float;

  attribute vec3 aPosition;
  attribute vec3 aNormal;

  uniform mat4 uProjection;
  uniform mat4 uModelView;
  uniform mat3 uNormalMatrix;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vCardPosition;
  varying float vFaceDirection;

  void main() {
    // The source model uses X for thickness. Reorient it so Z faces the camera.
    vec3 cardPosition = vec3(aPosition.z, aPosition.y, aPosition.x);
    vec3 cardNormal = vec3(aNormal.z, aNormal.y, aNormal.x);
    vec4 viewPosition = uModelView * vec4(cardPosition, 1.0);

    vPosition = viewPosition.xyz;
    vNormal = normalize(uNormalMatrix * cardNormal);
    vCardPosition = cardPosition.xy;
    vFaceDirection = cardNormal.z;
    gl_Position = uProjection * viewPosition;
  }
