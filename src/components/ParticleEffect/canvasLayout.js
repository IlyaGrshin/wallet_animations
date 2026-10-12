const DPR_MAX = 2
// Particles per CSS px^2 of the WHOLE (padded) canvas, matching the demo's areal
// density: ~7000 particles over its ~500css square = 7000 / 500^2.
const PARTICLE_DENSITY = 0.028
const PARTICLE_MIN = 300
const PARTICLE_MAX = 8000

export function layoutCanvas(canvas, content, prev, { padding, radius }) {
    const rect = content.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
    if (
        rect.width === prev.contentW &&
        rect.height === prev.contentH &&
        dpr === prev.dpr
    ) {
        return null
    }
    // Headroom around the content so particles have room to billow (shader
    // motion scales with the canvas's short side). The demo runs a ~500css
    // square over ~48css text rows, so default to ~1x the content height
    // per side; callers can override with the `padding` prop.
    const pad = padding != null ? padding : Math.round(rect.height)
    const cssW = rect.width + 2 * pad
    const cssH = rect.height + 2 * pad
    // Canvas overflows the content box equally on every side.
    canvas.style.left = canvas.style.top = `${-pad}px`
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    return {
        contentW: rect.width,
        contentH: rect.height,
        dpr,
        pad,
        w: (canvas.width = Math.floor(cssW * dpr)),
        h: (canvas.height = Math.floor(cssH * dpr)),
        radius: (radius || 1.6) * dpr,
        count: Math.max(
            PARTICLE_MIN,
            Math.min(PARTICLE_MAX, Math.round(cssW * cssH * PARTICLE_DENSITY))
        ),
    }
}
