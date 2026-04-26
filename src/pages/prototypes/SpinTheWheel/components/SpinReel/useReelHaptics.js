import { useEffect } from "react"
import { useReducedMotion } from "motion/react"

import WebApp from "@lib/twa"

import { indexAtY } from "./geometry"
import { PHASE } from "../../mockData"

// `selectionChanged` (а не `impactOccurred`) — намеренное дизайн-решение:
// эмулирует «щёлкание» механического барабана при прокрутке через слоты.
// reduceMotion часто включают и при чувствительности к вибрации, поэтому
// в этом режиме хаптики гасим — следуем общему сигналу пользователя.
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
