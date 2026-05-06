#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_brushed;
uniform float u_amount;

out vec4 fragColor;

float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
        v += amp * vnoise(p);
        p *= 2.0;
        amp *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.y;

    // very mild anisotropic mottling — soft satin sheen
    float aspectX = mix(150.0, 420.0, u_brushed);
    float aspectY = mix(150.0, 90.0, u_brushed);
    vec2 mottleUV = vec2(uv.x * aspectX, uv.y * aspectY);
    float mottle = fbm(mottleUV) - 0.5;

    // tight high-frequency grain
    vec2 grainUV = gl_FragCoord.xy * 1.7;
    float grain = vnoise(grainUV) - 0.5;

    float modulation = (mottle * 0.06 + grain * 0.03) * u_amount;

    fragColor = vec4(vec3(0.5 + modulation), 1.0);
}
