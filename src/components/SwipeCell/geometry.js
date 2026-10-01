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
 * iOS layout: every action sits at its resting slot from the start and the
 * content slides off over it. Each circle grows from its own centre as the
 * revealed strip reaches its slot, so they appear one after another from the
 * trailing edge. Past the strip the secondaries ride the content edge and the
 * full-swipe action stretches.
 * @param {number} revealed px the content is pulled left (>= 0)
 * @param {number} arm 0..1 progress of the full-swipe state
 * @param {number} slot position from the trailing edge, 0 = full-swipe action
 * @param {number} count total actions
 * @param {number} width row width; a strip wider than the row is squeezed
 */
export const layoutAction = (revealed, arm, slot, count, width) => {
    const rest = restWidth(count)
    const squeeze = width > 0 ? Math.min(1, openOffset(count, width) / rest) : 1
    const slotStart = (PAD + slot * (SIZE + GAP)) * squeeze
    const center = slotStart + (SIZE / 2) * squeeze
    const grow = clamp((revealed - slotStart) / (SIZE + GAP), 0, 1)
    const half = (SIZE / 2) * squeeze * grow
    const overflow = Math.max(0, revealed - rest * squeeze)

    if (slot > 0) {
        // Secondary actions ride the content edge and fold away once the
        // full-swipe action takes over the strip.
        return {
            center: center + overflow,
            scale: squeeze * grow * (1 - arm * 0.5),
            opacity: grow * (1 - arm),
        }
    }

    // The full-swipe action stretches with the extra pull, then snaps to fill
    // the whole strip when armed. Its icon travels to the leading edge.
    const right = center - half
    const left = mix(center + half + overflow, revealed - PAD, arm)
    return {
        right,
        left,
        half,
        scale: squeeze * grow,
        opacity: grow,
        iconCenter: mix((left + right) / 2, left - SIZE / 2, arm),
    }
}
