// Colour maths for the hero Gradient: hex helpers, an sRGB blend, and the
// OKLab/OKLCH conversions used to blend perceptually and to derive an
// inner/outer pair from one base colour. Everything resolves to plain hex so
// the SVG stops render everywhere.

const clamp01 = (t) => Math.max(0, Math.min(1, t))

const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const rgbToHex = (rgb) =>
    "#" +
    rgb
        .map((v) =>
            Math.max(0, Math.min(255, Math.round(v)))
                .toString(16)
                .padStart(2, "0")
        )
        .join("")

// --- OKLab / OKLCH (Björn Ottosson) --------------------------------------
const toLinear = (c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const toGamma = (c) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055

const hexToOklab = (hex) => {
    const [r, g, b] = hexToRgb(hex).map((v) => toLinear(v / 255))
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ]
}

const oklabToHex = (L, A, B) => {
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
    const lin = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
    return rgbToHex(lin.map((c) => toGamma(clamp01(c)) * 255))
}

// Shortest signed angular delta a->b (radians).
const hueDelta = (a, b) => {
    let d = b - a
    if (d > Math.PI) d -= 2 * Math.PI
    if (d < -Math.PI) d += 2 * Math.PI
    return d
}

// Linear sRGB blend between two hex colours.
export const mixHex = (a, b, t) => {
    const ca = hexToRgb(a)
    const cb = hexToRgb(b)
    const k = clamp01(t)
    return rgbToHex(ca.map((v, i) => v + (cb[i] - v) * k))
}

// Polar blend in OKLCH: interpolate lightness, chroma and hue (shortest arc) for
// a perceptually smooth, colourful ramp.
export const mixOklch = (a, b, t) => {
    const [La, Aa, Ba] = hexToOklab(a)
    const [Lb, Ab, Bb] = hexToOklab(b)
    const ca = Math.hypot(Aa, Ba)
    const cb = Math.hypot(Ab, Bb)
    const ha = Math.atan2(Ba, Aa)
    const k = clamp01(t)
    const L = La + (Lb - La) * k
    const c = ca + (cb - ca) * k
    const h = ha + hueDelta(ha, Math.atan2(Bb, Ab)) * k
    return oklabToHex(L, c * Math.cos(h), c * Math.sin(h))
}

// Derive a dark inner + bright outer pair from one base colour by spreading its
// OKLCH lightness, chroma and hue (deg) symmetrically. Returns hex.
export const oklchPair = (base, lSpread, cSpread, hSpread = 0) => {
    const [L, A, B] = hexToOklab(base)
    const c = Math.hypot(A, B)
    const h = Math.atan2(B, A)
    const dh = (hSpread * Math.PI) / 180
    const at = (l, chroma, hue) =>
        oklabToHex(l, chroma * Math.cos(hue), chroma * Math.sin(hue))
    return {
        inner: at(L - lSpread, Math.max(0, c - cSpread), h - dh),
        outer: at(L + lSpread, c + cSpread, h + dh),
    }
}

// Decompose an inner/outer pair into base + symmetric OKLCH spreads, so the
// editor can start from the exact Figma colours yet expose one base knob.
export const oklchDefaults = (inner, outer) => {
    const [Li, Ai, Bi] = hexToOklab(inner)
    const [Lo, Ao, Bo] = hexToOklab(outer)
    const ci = Math.hypot(Ai, Bi)
    const co = Math.hypot(Ao, Bo)
    const hi = Math.atan2(Bi, Ai)
    const dh = hueDelta(hi, Math.atan2(Bo, Ao))
    const hMid = hi + dh / 2
    const cMid = (ci + co) / 2
    return {
        base: oklabToHex((Li + Lo) / 2, cMid * Math.cos(hMid), cMid * Math.sin(hMid)),
        lSpread: (Lo - Li) / 2,
        cSpread: (co - ci) / 2,
        hSpread: (dh / 2) * (180 / Math.PI),
    }
}
