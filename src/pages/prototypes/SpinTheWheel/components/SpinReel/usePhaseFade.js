import { useEffect } from "react"
import { animate, useMotionValue, useReducedMotion } from "motion/react"

import { PHASE } from "../../mockData"

const PHASE_FADE = { duration: 0.35, ease: "linear" }
const WIN_PULSE_KEYFRAMES = [1, 1.08, 1]
const WIN_PULSE_OPTIONS = {
    duration: 0.5,
    times: [0, 0.32, 1],
    ease: "easeOut",
}

// Two independent animations tied to the modal phase:
//  - phaseFade dims the non-winner slots when entering RESULT.
//  - winnerPulse gives the winner a short scale beat.
// Under reduceMotion both collapse into instant sets — the signal still
// reads (winner is separated from the strip) without any travel.
export default function usePhaseFade(phase) {
    const phaseFade = useMotionValue(1)
    const winnerPulse = useMotionValue(1)
    const reduceMotion = useReducedMotion()

    useEffect(() => {
        const fadeTarget = phase === PHASE.RESULT ? 0 : 1
        if (reduceMotion) {
            phaseFade.set(fadeTarget)
            winnerPulse.set(1)
            return undefined
        }
        const fadeControls = animate(phaseFade, fadeTarget, PHASE_FADE)
        let pulseControls
        if (phase === PHASE.RESULT) {
            pulseControls = animate(
                winnerPulse,
                WIN_PULSE_KEYFRAMES,
                WIN_PULSE_OPTIONS
            )
        } else {
            winnerPulse.set(1)
        }
        return () => {
            fadeControls.stop()
            pulseControls?.stop()
        }
    }, [phase, phaseFade, winnerPulse, reduceMotion])

    return { phaseFade, winnerPulse }
}
