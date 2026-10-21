import { resolveColor, toCss } from "./glUtils"

// Rasterizes the content into a mask: glyphs painted in their own (opaque) text
// color on a transparent background. The particle shader (text = 1) spawns
// particles only where this mask is opaque, so the cloud takes the shape of the
// text, and tints each particle with the glyph color it spawned on.
//
// We walk the content's text nodes and paint each at its live layout position
// (via Range rects + computed font), so it works regardless of how the children
// render their glyphs (plain text, Calligraph spans, etc.). Content is frozen
// while hidden, so a single capture at cover time is stable.
//
// Returns { drawn, color }: the number of glyph runs painted (0 means the caller
// should fall back to block mode rather than render an empty mask) and the
// [r,g,b] of the run covering the most area, the fallback particle color. `pad` is the CSS
// headroom around the content (the canvas is larger than the content box so
// particles have room to billow like the demo), so glyphs are offset by it.
// `dilation` fattens the glyphs (stroke width = dilation * font size) so strokes
// and inter-glyph gaps merge, hiding the text harder — closer to the demo's
// solid block masks than to thin readable digits.
export function renderTextMask(content, ctx, dpr, pad = 0, dilation = 0) {
    const base = content.getBoundingClientRect()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.save()
    ctx.scale(dpr, dpr)
    // Clip to the visible content box. Some children (e.g. Calligraph's rolling
    // odometer) render off-slot glyphs as absolutely-positioned, visible text
    // nodes outside the box — clipping keeps only what is actually shown.
    ctx.beginPath()
    ctx.rect(pad, pad, base.width, base.height)
    ctx.clip()
    ctx.lineJoin = "round"
    ctx.textBaseline = "top"

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
    const range = document.createRange()
    let drawn = 0
    let color = null
    let colorArea = 0
    let node
    while ((node = walker.nextNode())) {
        const text = node.nodeValue
        if (!text || !text.trim()) continue
        const parent = node.parentElement
        if (!parent) continue

        const cs = getComputedStyle(parent)
        if (
            cs.visibility === "hidden" ||
            cs.display === "none" ||
            cs.opacity === "0"
        ) {
            continue
        }

        range.selectNodeContents(node)
        const rect = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) continue

        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        const fontPx = parseFloat(cs.fontSize) || rect.height
        const x = rect.left - base.left + pad
        const y = rect.top - base.top + pad + (rect.height - fontPx) / 2
        const rgb = resolveColor(cs.color)
        ctx.fillStyle = ctx.strokeStyle = toCss(rgb)
        if (rect.width * rect.height > colorArea) {
            colorArea = rect.width * rect.height
            color = rgb
        }
        if (dilation > 0) {
            ctx.lineWidth = fontPx * dilation
            ctx.strokeText(text, x, y)
        }
        ctx.fillText(text, x, y)
        drawn++
    }

    for (const svg of content.querySelectorAll("svg")) {
        const icon = paintIcon(svg, base, ctx, pad, dilation)
        if (!icon) continue
        drawn++
        if (icon.area > colorArea) {
            colorArea = icon.area
            color = icon.rgb
        }
    }

    ctx.restore()
    return { drawn, color }
}

function paintIcon(svg, base, ctx, pad, dilation) {
    const cs = getComputedStyle(svg)
    if (
        cs.visibility === "hidden" ||
        cs.display === "none" ||
        cs.opacity === "0"
    ) {
        return null
    }
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const box = svg.viewBox.baseVal
    const vbW = box?.width || rect.width
    const vbH = box?.height || rect.height
    const sx = rect.width / vbW
    const sy = rect.height / vbH

    let rgb = null
    ctx.save()
    ctx.translate(rect.left - base.left + pad, rect.top - base.top + pad)
    ctx.scale(sx, sy)
    ctx.translate(-(box?.x ?? 0), -(box?.y ?? 0))
    ctx.lineWidth = ((parseFloat(cs.fontSize) || rect.height) * dilation) / sx
    for (const path of svg.querySelectorAll("path")) {
        const d = path.getAttribute("d")
        if (!d) continue
        const fill = getComputedStyle(path).fill
        rgb = resolveColor(fill && fill !== "none" ? fill : cs.color)
        ctx.fillStyle = ctx.strokeStyle = toCss(rgb)
        const shape = new Path2D(d)
        if (dilation > 0) ctx.stroke(shape)
        ctx.fill(shape)
    }
    ctx.restore()
    return rgb && { rgb, area: rect.width * rect.height }
}
