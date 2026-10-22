let probe = null
const colorCache = new Map()

// Resolves any CSS color to opaque [r,g,b] 0..1 (alpha dropped), cached.
export function resolveColor(value) {
    let rgb = colorCache.get(value)
    if (rgb) return rgb
    probe ??= document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true })
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = "#fff"
    probe.fillStyle = value
    probe.fillRect(0, 0, 1, 1)
    // getImageData is unpremultiplied, so translucent colors keep their hue.
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
    rgb = [r / 255, g / 255, b / 255]
    colorCache.set(value, rgb)
    return rgb
}

export const toCss = ([r, g, b]) =>
    `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`
