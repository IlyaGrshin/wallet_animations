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
    // A word typed out in full is already in the field, so it is dropped from
    // its own suggestions; one extra candidate is pulled so the strip still
    // fills up after that.
    const suggestions =
        focused && hasPrefix
            ? suggest(value, MAX_SUGGESTIONS + 1)
                  .filter((word) => word !== value)
                  .slice(0, MAX_SUGGESTIONS)
            : []
    const noMatches = suggestions.length === 0

    // Explicit means the user walked the strip with the arrow keys: only then
    // does a suggestion win over a word already typed out in full.
    const explicit = selection.prefix === value
    const activeIndex = explicit
        ? Math.min(selection.index, Math.max(suggestions.length - 1, 0))
        : complete
          ? -1
          : 0

    const moveSelection = (delta) => {
        const count = suggestions.length
        // Nothing highlighted yet: step in from whichever end was asked for.
        const from = activeIndex < 0 ? (delta > 0 ? -1 : 0) : activeIndex
        setSelection({ prefix: value, index: (from + delta + count) % count })
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
