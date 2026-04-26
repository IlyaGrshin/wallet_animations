import { useEffect } from "react"
import { useReducedMotion } from "motion/react"

import WebApp from "@lib/twa"

import { indexAtY } from "./geometry"
import { PHASE } from "../../mockData"

// `selectionChanged` (not `impactOccurred`) is a deliberate design call:
// it emulates the click of a mechanical drum as slots pass under the
// pointer. Users who turn on reduceMotion are often also sensitive to
// vibration, so we suppress haptics in that mode — same broader signal.
export default function useReelHaptics({ y, phase, centerOffset }) {
    const reduceMotion = useReducedMotion()

    useEffect(() => {
        if (reduceMotion || phase !== PHASE.SPINNING) return undefined
        let lastIndex = indexAtY(y.get(), centerOffset)
        return y.on("change", (latest) => {
            const index = indexAtY(latest, centerOffset)
            if (index !== lastIndex) {
                lastIndex = index
                WebApp.HapticFeedback?.selectionChanged?.()
            }
        })
    }, [y, phase, centerOffset, reduceMotion])
}
