import { useCallback, useState } from "react"

import { VISIBLE_SLOT_BUFFER } from "../SpinReel/geometry"
import { buildItems } from "../../utils"
import { REEL_HARD_CAP, REEL_LENGTH, SPIN_TURNS } from "./animationConfig"

// Anything past the centred slot + VISIBLE_SLOT_BUFFER is offscreen, so it
// can be regenerated safely without a visual jump.
const KEEP_AHEAD = VISIBLE_SLOT_BUFFER + 1

export default function useReelItems() {
    const [items, setItems] = useState(() => buildItems(REEL_LENGTH))

    const reset = useCallback(() => {
        setItems(buildItems(REEL_LENGTH))
    }, [])

    const growForSpin = useCallback((focusedIndex) => {
        setItems((curr) => [
            ...curr.slice(0, focusedIndex + KEEP_AHEAD),
            ...buildItems(SPIN_TURNS + REEL_LENGTH),
        ])
    }, [])

    // The idle nudge runs as long as the modal is open. Without a ceiling
    // the array would grow by REEL_LENGTH every ~2.3s (≈30 MB per hour).
    // The cap stops the growth; once hit the strip visually runs out, but
    // only after a very long idle session.
    const growForIdle = useCallback((nextIndex) => {
        setItems((curr) => {
            if (nextIndex + SPIN_TURNS < curr.length) return curr
            if (curr.length >= REEL_HARD_CAP) return curr
            return [...curr, ...buildItems(REEL_LENGTH)]
        })
    }, [])

    return { items, reset, growForSpin, growForIdle }
}
