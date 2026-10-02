import { clamp } from "../../utils/number"

// Pure layout math for the trailing swipe actions. Distances are measured
// from the row's trailing (right) edge, so "revealed" is how far the content
// has been pulled left and every action is placed inside that strip.

export const SIZE = 44
const GAP = 8
const PAD = 8

// The full-swipe arms at this share of the row width (at least a little past
// the resting strip). Disarming needs HYSTERESIS less, so the haptic does not
// chatter around the threshold.
const ARM_EXTRA = 16
const ARM_SHARE = 0.6
export const HYSTERESIS = 16

const mix = (a, b, t) => a + (b - a) * t

export const restWidth = (count) =>
    2 * PAD + count * SIZE + Math.max(0, count - 1) * GAP

// How far an open row rests: the action strip, but never past the row
// itself (many actions in a narrow row squeeze inside it instead).
export const openOffset = (count, width) =>
    Math.min(restWidth(count), width - PAD)

// Capped just short of the full row width, which is as far as the drag
// constraint lets the content go, so narrow rows can still arm.
export const armThreshold = (count, width) =>
    Math.min(
        Math.max(restWidth(count) + ARM_EXTRA, width * ARM_SHARE),
        width - PAD
    )

/**
 * iOS layout: the content slides off over the action slots. Each circle is
 * pinned to its slot centre and scales in place: it starts once the content
 * edge is PAD past that centre and its edge always keeps PAD from the content,
 * so it is never cut and never moves. They appear one after another
 * from the trailing edge. Past the strip the secondaries ride the content
 * edge and the full-swipe action stretches.
 * @param {number} revealed px the content is pulled left (>= 0)
 * @param {number} arm 0..1 progress of the full-swipe state
 * @param {number} slot position from the trailing edge, 0 = full-swipe action
 * @param {number} count total actions
 * @param {number} width row width; a strip wider than the row is squeezed
 */
export const layoutAction = (revealed, arm, slot, count, width) => {
    const rest = restWidth(count)
    const squeeze = width > 0 ? Math.min(1, openOffset(count, width) / rest) : 1
    const size = SIZE * squeeze
    const slotCenter = (PAD + slot * (SIZE + GAP)) * squeeze + size / 2
    const half = clamp(revealed - slotCenter - PAD * squeeze, 0, size / 2)
    // Element scale (circles are SIZE wide) and a quick fade-in over the
    // first half of the growth.
    const grow = (2 * half) / SIZE
    const opacity = size > 0 ? clamp((4 * half) / size, 0, 1) : 0
    const overflow = Math.max(0, revealed - rest * squeeze)

    if (slot > 0) {
        // Secondary actions ride the content edge and fold away once the
        // full-swipe action takes over the strip.
        return {
            center: slotCenter + overflow,
            scale: grow * (1 - arm * 0.5),
            opacity: opacity * (1 - arm),
        }
    }

    // The full-swipe action stretches with the extra pull, then snaps to fill
    // the whole strip when armed. Its icon stays centred in the pill while it
    // grows and stretches, then travels to the leading edge when armed.
    const right = slotCenter - half
    const left = mix(slotCenter + half + overflow, revealed - PAD, arm)
    return {
        right,
        left,
        half,
        scale: grow,
        opacity,
        iconCenter: mix(slotCenter + overflow / 2, left - SIZE / 2, arm),
    }
}

const ROUND_DISTANCE = 24

export const contentRadius = (revealed, radius) =>
    radius * clamp(revealed / ROUND_DISTANCE, 0, 1)

// Rubber-banding between the finger (raw pull) and the content (shown pull):
// 1:1 up to the resting strip, firmer up to the arm threshold, and stiff once
// armed so the confirm state feels locked.
const STRETCH = 0.75
const LOCKED = 0.3

const bands = (count, width) => {
    const rest = openOffset(count, width)
    const armAt = armThreshold(count, width)
    return { rest, armAt, rawArm: rest + (armAt - rest) / STRETCH }
}

/** Shown pull (px, >= 0) for a raw finger pull. */
export const rubberBand = (raw, count, width) => {
    if (width <= 0) return raw
    const { rest, armAt, rawArm } = bands(count, width)
    if (raw <= rest) return raw
    if (raw <= rawArm) return rest + (raw - rest) * STRETCH
    return armAt + (raw - rawArm) * LOCKED
}

/** Raw finger pull that shows `shown` px: inverse of rubberBand. */
export const rawPull = (shown, count, width) => {
    if (width <= 0) return shown
    const { rest, armAt, rawArm } = bands(count, width)
    if (shown <= rest) return shown
    if (shown <= armAt) return rest + (shown - rest) / STRETCH
    return rawArm + (shown - armAt) / LOCKED
}
