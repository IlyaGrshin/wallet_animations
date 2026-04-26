import { useCallback, useState } from "react"

import { VISIBLE_SLOT_BUFFER } from "../SpinReel/geometry"
import { buildItems } from "../../utils"
import { REEL_HARD_CAP, REEL_LENGTH, SPIN_TURNS } from "./animationConfig"

// За пределами центрального + VISIBLE_SLOT_BUFFER слотов лента невидима, так
// что её можно безопасно перегенерировать без визуального скачка.
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

    // Idle nudge крутится бесконечно, пока модалка открыта — без потолка
    // массив рос бы по REEL_LENGTH каждые ~2.3 с (≈30 МБ за час). Cap
    // останавливает рост; после него лента визуально упирается в конец,
    // но это происходит только после очень долгого простоя.
    const growForIdle = useCallback((nextIndex) => {
        setItems((curr) => {
            if (nextIndex + SPIN_TURNS < curr.length) return curr
            if (curr.length >= REEL_HARD_CAP) return curr
            return [...curr, ...buildItems(REEL_LENGTH)]
        })
    }, [])

    return { items, reset, growForSpin, growForIdle }
}
