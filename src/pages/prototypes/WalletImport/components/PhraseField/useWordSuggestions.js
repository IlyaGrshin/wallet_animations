import { useState } from "react"

import {
    MAX_SUGGESTIONS,
    MIN_PREFIX_LENGTH,
    isWord,
    suggest,
} from "../../bip39"

const NO_SELECTION = { prefix: "", index: 0 }

/**
 * What the strip should show for `value` and which entry the keyboard is on.
 * Selection is keyed by the prefix that produced it, so a new keystroke resets
 * the highlight without an effect.
 */
export function useWordSuggestions(value, focused, dismissed) {
    const [selection, setSelection] = useState(NO_SELECTION)

    const hasPrefix = value.length >= MIN_PREFIX_LENGTH
    const complete = isWord(value)
    const matches = focused && hasPrefix ? suggest(value, MAX_SUGGESTIONS) : []
    // A word typed out in full keeps its place in the strip, but only while the
    // list has something longer to offer: alone it would just repeat the field.
    const suggestions = matches.some((word) => word !== value) ? matches : []
    const noMatches = suggestions.length === 0

    // Explicit means the user walked the strip with the arrow keys: only then
    // does a longer word win over the one already typed out in full, which is
    // what the strip opens on.
    const explicit = selection.prefix === value
    const activeIndex = explicit
        ? Math.min(selection.index, Math.max(suggestions.length - 1, 0))
        : 0

    const moveSelection = (delta) => {
        const count = suggestions.length
        setSelection({
            prefix: value,
            index: (activeIndex + delta + count) % count,
        })
    }

    return {
        complete,
        suggestions,
        noMatches,
        activeIndex,
        // A complete word with nothing left to offer needs no strip at all.
        open: focused && hasPrefix && !dismissed && !(complete && noMatches),
        moveSelection,
        resetSelection: () => setSelection(NO_SELECTION),
    }
}

export default useWordSuggestions
