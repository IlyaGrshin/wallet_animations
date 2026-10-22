const DPR_MAX = 2
// Particles per CSS px^2 of the WHOLE (padded) canvas, matching the demo's areal
// density: ~7000 particles over its ~500css square = 7000 / 500^2.
const PARTICLE_DENSITY = 0.028
const PARTICLE_MIN = 300
const PARTICLE_MAX = 8000

// Read-only half of the layout: no DOM writes, so a batch of instances can
// all measure before any of them invalidates layout with applyLayout().
export function measureCanvas(content, { padding, radius }) {
    const rect = content.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX)
    // Headroom around the content so particles have room to billow (shader
    // motion scales with the canvas's short side). The demo runs a ~500css
    // square over ~48css text rows, so default to ~1x the content height
    // per side; callers can override with the `padding` prop.
    const pad = padding != null ? padding : Math.round(rect.height)
    const cssW = rect.width + 2 * pad
    const cssH = rect.height + 2 * pad
    return {
        contentW: rect.width,
        contentH: rect.height,
        dpr,
        pad,
        cssW,
        cssH,
        w: Math.floor(cssW * dpr),
        h: Math.floor(cssH * dpr),
        radius: (radius || 2) * dpr,
        count: Math.max(
            PARTICLE_MIN,
            Math.min(PARTICLE_MAX, Math.round(cssW * cssH * PARTICLE_DENSITY))
        ),
    }
}

// Write half: the canvas overflows the content box equally on every side.
export function applyLayout(canvas, layout) {
    const { pad, cssW, cssH, w, h } = layout
    canvas.style.left = canvas.style.top = `${-pad}px`
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    if (canvas.width !== w) canvas.width = w
    if (canvas.height !== h) canvas.height = h
}
