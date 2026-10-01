// Pure layout math for the trailing swipe actions. Distances are measured
// from the row's trailing (right) edge, so "revealed" is how far the content
// has been pulled left and every action is placed inside that strip.

export const SIZE = 44
export const GAP = 8
export const PAD = 8

// Past the resting strip the full-swipe arms at this extra pull, or at this
// share of the row width — whichever is further. Disarming needs HYSTERESIS
// less, so the haptic does not chatter around the threshold.
const ARM_EXTRA = 48
const ARM_SHARE = 0.55
export const HYSTERESIS = 16

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const mix = (a, b, t) => a + (b - a) * t

export const restWidth = (count) =>
    2 * PAD + count * SIZE + Math.max(0, count - 1) * GAP

export const armThreshold = (count, width) =>
    Math.max(restWidth(count) + ARM_EXTRA, width * ARM_SHARE)

/**
 * @param {number} revealed px the content is pulled left (>= 0)
 * @param {number} arm 0..1 progress of the full-swipe state
 * @param {number} slot position from the trailing edge, 0 = full-swipe action
 * @param {number} count total actions
 */
export const layoutAction = (revealed, arm, slot, count) => {
    const progress = clamp01(revealed / restWidth(count))
    const overflow = Math.max(0, revealed - restWidth(count))
    const center = (PAD + SIZE / 2 + slot * (SIZE + GAP)) * progress
    const half = (SIZE / 2) * progress
    const opacity = clamp01(progress * 1.5)

    if (slot > 0) {
        // Secondary actions ride the content edge and fold away once the
        // full-swipe action takes over the strip.
        return {
            center: center + overflow,
            scale: progress * (1 - arm * 0.5),
            opacity: opacity * (1 - arm),
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
        scale: progress,
        opacity,
        iconCenter: mix((left + right) / 2, left - SIZE / 2, arm),
    }
}
