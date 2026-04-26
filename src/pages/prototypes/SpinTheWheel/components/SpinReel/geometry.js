export const SLOT_HEIGHT = 180
export const VISIBLE_SLOT_BUFFER = 3

// 2/3 ratio between the centred slot and its neighbours, picked visually
// for a 180px slot so the strip reads as a drum rather than a flat list.
const MIN_SCALE = 0.667
const SCALE_RANGE = 1 - MIN_SCALE

export const targetYFor = (index, centerOffset) =>
    -index * SLOT_HEIGHT + centerOffset

export const indexAtY = (y, centerOffset) =>
    Math.round((centerOffset - y) / SLOT_HEIGHT)

export function slotPositionScale(yVal, centerY, slotHeight) {
    const dist = Math.abs(yVal - centerY)
    if (dist >= slotHeight) return MIN_SCALE
    return 1 - SCALE_RANGE * (dist / slotHeight)
}

// Piecewise linear: the "focus zone" (0..slotHeight) drops 1 → 0.5 quickly,
// the "fade zone" (slotHeight..3·slotHeight) eases 0.5 → 0 smoothly. Without
// the split, distant slots would look flat and there'd be no depth cue.
export function slotPositionOpacity(yVal, centerY, slotHeight) {
    const dist = Math.abs(yVal - centerY)
    if (dist >= 3 * slotHeight) return 0
    if (dist <= slotHeight) return 1 - 0.5 * (dist / slotHeight)
    return 0.5 - 0.5 * ((dist - slotHeight) / (2 * slotHeight))
}
