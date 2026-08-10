import { useState } from "react"

import { MIN_PREFIX_LENGTH, isWord, suggest } from "../../bip39"

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
    const matches = focused && hasPrefix ? suggest(value) : []
    // A word typed out in full keeps its place in the strip, but only while the
    // list has something longer to offer: alone it would just repeat the field.
    const suggestions = matches.some((word) => word !== value) ? matches : []

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
        suggestions,
        activeIndex,
        // A complete word with nothing left to offer needs no strip at all.
        open:
            focused &&
            hasPrefix &&
            !dismissed &&
            !(complete && suggestions.length === 0),
        moveSelection,
        resetSelection: () => setSelection(NO_SELECTION),
    }
}

export default useWordSuggestions
