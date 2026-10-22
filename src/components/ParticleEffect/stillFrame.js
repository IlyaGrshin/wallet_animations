import { applyLayout, measureCanvas } from "./canvasLayout"
import { resolveColor, toCss } from "./color"
import { renderTextMask } from "./textMask"

// Mirrors the shader's spawn: up to 4 random tries to land on the glyph mask.
const SPAWN_TRIES = 4
const MASK_THRESHOLD = 0.3 * 255
// The live cloud settles at ~45% of the ink a full spawn would paint (measured).
const STILL_DENSITY = 0.45

let maskCtx = null
// Still frames not yet handed over to the live renderer, by canvas.
const stills = new WeakMap()

/**
 * Paints one static frame of the cloud with a plain 2D canvas, so a value that
 * hides before the WebGL renderer chunk is ready shows particles right away
 * instead of a gap. The renderer takes it over with takeStill() and fades it
 * out over its first live frames, so the handoff is a crossfade, not a jump.
 * Off-screen content is skipped: the renderer captures it ahead of scrolling.
 */
export function drawStill(
    canvas,
    content,
    { color, radius, padding, maskDilation = 0.3 }
) {
    const box = content.getBoundingClientRect()
    if (box.bottom < 0 || box.top > window.innerHeight) return
    const layout = measureCanvas(content, { padding, radius })
    if (!layout) return
    const { w, h, dpr, pad, count, radius: size } = layout

    maskCtx ??= document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true })
    maskCtx.canvas.width = w
    maskCtx.canvas.height = h
    const { drawn } = renderTextMask(content, maskCtx, dpr, pad, maskDilation)
    if (!drawn) return
    const { data } = maskCtx.getImageData(0, 0, w, h)

    const still = stills.get(canvas) ?? document.createElement("canvas")
    still.width = w
    still.height = h
    const ctx = still.getContext("2d")
    const fixed = color ? toCss(resolveColor(color)) : null
    let fill = null
    for (let i = 0; i < count * STILL_DENSITY; i++) {
        for (let t = 0; t < SPAWN_TRIES; t++) {
            const x = Math.floor(Math.random() * w)
            const y = Math.floor(Math.random() * h)
            const o = (y * w + x) * 4
            if (data[o + 3] < MASK_THRESHOLD) continue
            const next = fixed ?? `rgb(${data[o]} ${data[o + 1]} ${data[o + 2]})`
            if (next !== fill) ctx.fillStyle = fill = next
            ctx.globalAlpha =
                Math.sin(Math.random() * Math.PI) *
                (0.6 + 0.4 * Math.random()) *
                (data[o + 3] / 255)
            ctx.fillRect(x - size / 2, y - size / 2, size, size)
            break
        }
    }
    ctx.globalAlpha = 1

    applyLayout(canvas, layout)
    const out = canvas.getContext("2d")
    out.clearRect(0, 0, w, h)
    out.drawImage(still, 0, 0)
    stills.set(canvas, still)
}

export function takeStill(canvas) {
    const still = stills.get(canvas) ?? null
    stills.delete(canvas)
    return still
}

// Revealed before the renderer took the still over: nothing else will clear it.
export function clearStill(canvas) {
    if (!takeStill(canvas)) return
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
}
