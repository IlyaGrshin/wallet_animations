import { useRef, useState } from "react"

import { PHRASE_LENGTH, isWord } from "./bip39"

const emptyPhrase = () => Array.from({ length: PHRASE_LENGTH }, () => "")

const clamp = (index) => Math.min(Math.max(index, 0), PHRASE_LENGTH - 1)

/**
 * Phrase state plus the focus choreography between the 24 slots: committing a
 * word hands focus to the next one, navigation walks the list, and a pasted
 * phrase spreads across the slots in one go.
 */
export function usePhraseImport() {
    const [words, setWords] = useState(emptyPhrase)
    const inputsRef = useRef([])

    const registerRef = (index, element) => {
        inputsRef.current[index] = element
    }

    const focusField = (index) => {
        const element = inputsRef.current[index]
        if (!element) return
        element.focus()
        // Caret to the end so typing continues the word instead of splitting it.
        const end = element.value.length
        element.setSelectionRange(end, end)
        element.scrollIntoView({ block: "nearest" })
    }

    const setWord = (index, value) => {
        setWords((prev) => {
            if (prev[index] === value) return prev
            const next = [...prev]
            next[index] = value
            return next
        })
    }

    const commitWord = (index, word) => {
        setWord(index, word)
        if (index < PHRASE_LENGTH - 1) {
            focusField(index + 1)
        } else {
            inputsRef.current[index]?.blur()
        }
    }

    const navigate = (index, delta) => {
        focusField(clamp(index + delta))
    }

    // A full phrase pasted anywhere lands from slot 1; a fragment fills forward
    // from the slot that received it.
    const fillFrom = (index, pasted) => {
        const start = pasted.length >= PHRASE_LENGTH ? 0 : index
        const next = [...words]
        pasted.slice(0, PHRASE_LENGTH - start).forEach((word, offset) => {
            next[start + offset] = word
        })
        setWords(next)

        // Land on the first slot still missing a valid word; a phrase that
        // came in whole needs no cursor at all.
        const firstGap = next.findIndex((word) => !isWord(word))
        if (firstGap === -1) {
            document.activeElement?.blur()
            return
        }
        focusField(firstGap)
    }

    const validCount = words.filter(isWord).length

    return {
        words,
        validCount,
        isComplete: validCount === PHRASE_LENGTH,
        registerRef,
        setWord,
        commitWord,
        navigate,
        fillFrom,
    }
}

export default usePhraseImport
