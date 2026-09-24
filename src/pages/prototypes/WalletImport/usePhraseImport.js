import { useRef, useState } from "react"

import { clamp } from "../../../utils/number"
import { PHRASE_LENGTH, isWord } from "./bip39"

const emptyPhrase = () => Array.from({ length: PHRASE_LENGTH }, () => "")

/**
 * Phrase state plus the focus choreography between the 24 slots: committing a
 * word hands focus to the next one, navigation walks the list, and a pasted
 * phrase spreads across the slots in one go.
 */
export function usePhraseImport() {
    const [words, setWords] = useState(emptyPhrase)
    const inputsRef = useRef([])
    // The writers below are handed to all 24 slots, so they read the phrase
    // through a ref: closing over the state would give each of them a new
    // identity per keystroke and re-render every slot.
    const phraseRef = useRef(words)

    const write = (next) => {
        phraseRef.current = next
        setWords(next)
    }

    const registerRef = (index, element) => {
        inputsRef.current[index] = element
    }

    const focusField = (index) => {
        const element = inputsRef.current[index]
        if (!element) return
        element.focus()
        const end = element.value.length
        element.setSelectionRange(end, end)
        element.scrollIntoView({ block: "nearest" })
    }

    const setWord = (index, value) => {
        const prev = phraseRef.current
        if (prev[index] === value) return
        const next = [...prev]
        next[index] = value
        write(next)
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
        focusField(clamp(index + delta, 0, PHRASE_LENGTH - 1))
    }

    // A full phrase pasted anywhere lands from slot 1; a fragment fills forward
    // from the slot that received it.
    const fillFrom = (index, pasted) => {
        const start = pasted.length >= PHRASE_LENGTH ? 0 : index
        const next = [...phraseRef.current]
        pasted.slice(0, PHRASE_LENGTH - start).forEach((word, offset) => {
            next[start + offset] = word
        })
        write(next)

        const firstGap = next.findIndex((word) => !isWord(word))
        if (firstGap === -1) {
            document.activeElement?.blur()
            return
        }
        focusField(firstGap)
    }

    return {
        words,
        isComplete: words.every(isWord),
        registerRef,
        setWord,
        commitWord,
        navigate,
        fillFrom,
    }
}

export default usePhraseImport
