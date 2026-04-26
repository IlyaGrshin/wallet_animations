export const SLOT_HEIGHT = 180
export const VISIBLE_SLOT_BUFFER = 3

// 2/3 — соотношение «центральный слот / соседний», подобрано визуально для
// 180px slot, чтобы лента ощущалась барабаном, а не плоским списком.
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

// Кусочно-линейная: «зона интереса» (0..slotHeight) гасит 1 → 0.5 быстро,
// «зона затухания» (slotHeight..3·slotHeight) — 0.5 → 0 плавно. Без этого
// дальние слоты выглядели бы плоско и не было бы визуальной глубины.
export function slotPositionOpacity(yVal, centerY, slotHeight) {
    const dist = Math.abs(yVal - centerY)
    if (dist >= 3 * slotHeight) return 0
    if (dist <= slotHeight) return 1 - 0.5 * (dist / slotHeight)
    return 0.5 - 0.5 * ((dist - slotHeight) / (2 * slotHeight))
}
