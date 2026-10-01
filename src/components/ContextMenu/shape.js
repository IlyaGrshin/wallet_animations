import { clamp } from "../../utils/number"

// How the pressed element lifts: its box, corner radius and growth. Read from
// the element itself so the menu works on any tappable — a full-width cell,
// a round avatar, a pill button — without per-element configuration.

const MIN_GROW = 0.04
const MAX_GROW = 0.1
// Roughly how many px the larger side grows by while held; small targets
// get a stronger relative lift so the hold is visible.
const GROW_PX = 14
// Once the menu is open a wide element (a row) settles slightly narrower
// than its slot, like the iOS preview; small ones stay lifted.
const SETTLED_SCALE = 0.96
const WIDE_SHARE = 0.6

/**
 * @param {HTMLElement} el The pressed element
 * @param {number} fallbackRadius Radius (px) for square-cornered elements,
 * which round off as they lift, iOS-style.
 */
export const measureShape = (el, fallbackRadius) => {
    // The layout box, without the element's transforms: the preview re-applies
    // its resting transform, and a press scale (a button's whileTap) must not
    // skew the slot. Transitions are paused so the swap back doesn't animate.
    const { transform, transition } = el.style
    el.style.transition = "none"
    el.style.transform = "none"
    const { left, top, width, height } = el.getBoundingClientRect()
    el.style.transform = transform
    void el.offsetWidth
    el.style.transition = transition
    const own = getComputedStyle(el).borderRadius
    const isSquare = !own || own.split(" ").every((v) => parseFloat(v) === 0)
    const grown =
        1 + clamp(GROW_PX / Math.max(width, height), MIN_GROW, MAX_GROW)

    return {
        rect: {
            left,
            top,
            right: left + width,
            bottom: top + height,
            width,
            height,
        },
        radiusFrom: isSquare ? "0px" : own,
        radiusTo: isSquare ? `${fallbackRadius}px` : own,
        scale: grown,
        settledScale:
            width >= window.innerWidth * WIDE_SHARE ? SETTLED_SCALE : grown,
    }
}
