// Gradient stop generation: the radial colour ramp and the mask's
// fade-to-transparency are generated from functions ("easing gradient") rather
// than hand-tuned stop tables, so the transitions render smoothly and stay
// parametric. Colour blending lives in ./color.
import { mixHex, mixOklch } from "./color"

// Ease-in-out (quadratic): matches the Figma scrim export closely (endpoints
// exact) and keeps the fade perceptually smooth.
export const easeInOutQuad = (t) =>
    t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

const MIXERS = { srgb: mixHex, oklch: mixOklch }

// Radial colour ramp: solid inner colour up to `solidStop`, then an inner->outer
// ramp to the edge, blended in the chosen space.
export const radialStops = (inner, outer, solidStop, count, space = "srgb") => {
    const mix = MIXERS[space] || mixHex
    return Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 1 : i / (count - 1)
        return [solidStop + (1 - solidStop) * t, mix(inner, outer, t)]
    })
}

// Vertical alpha fade (white = visible) whose opacity follows an easing, so the
// mask eases into transparency instead of a hard linear cut.
export const fadeStops = (count, ease = easeInOutQuad) =>
    Array.from({ length: count }, (_, i) => {
        const t = count === 1 ? 0 : i / (count - 1)
        return [t, 1 - ease(t)]
    })
