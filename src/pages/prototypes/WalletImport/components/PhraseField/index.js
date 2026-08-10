import { useState } from "react"
import PropTypes from "prop-types"
import { AnimatePresence } from "motion/react"

import Text from "../../../../../components/Text"
import TextField from "../../../../../components/TextField"
import WebApp from "../../../../../lib/twa"
import { PHRASE_LENGTH, isWord, sanitize, splitPhrase } from "../../bip39"
import SuggestionTooltip, { suggestionId } from "../SuggestionTooltip"
import { useWordSuggestions } from "./useWordSuggestions"

import * as styles from "./PhraseField.module.scss"

/**
 * One numbered slot of the recovery phrase. Owns its suggestion strip, the
 * keyboard selection inside it, and the guard that refuses to commit a word
 * outside the BIP-39 list.
 * @param {number} props.index      Zero-based slot; rendered as index + 1.
 * @param {string} props.value      Letters typed so far (sanitized).
 * @param {(word: string) => void} props.onCommit  Accept and move on.
 * @param {(delta: number) => void} props.onNavigate
 * @param {(words: string[]) => void} props.onPasteWords
 */
const PhraseField = ({
    index,
    value,
    registerRef,
    onChange,
    onCommit,
    onNavigate,
    onPasteWords,
}) => {
    const [focused, setFocused] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    const {
        complete,
        suggestions,
        noMatches,
        activeIndex,
        open,
        moveSelection,
        resetSelection,
    } = useWordSuggestions(value, focused, dismissed)

    // Anything left behind that the wordlist does not know reads as an error,
    // including slots filled by a paste that were never focused.
    const invalid = !focused && value.length > 0 && !complete

    const fieldId = `phrase-word-${index + 1}`

    // Refusing a word the list does not contain: the strip already says so, the
    // haptic just confirms it did not go through.
    const reject = () => {
        WebApp.HapticFeedback?.notificationOccurred("error")
    }

    const commit = (word) => {
        WebApp.HapticFeedback?.selectionChanged()
        setDismissed(false)
        resetSelection()
        onCommit(word)
    }

    // TextField hands over the raw string, not the event.
    const handleChange = (raw) => {
        const next = sanitize(raw)
        // Whitespace means the user finished the word (space bar, autocorrect):
        // accept it only if the list knows it, otherwise refuse out loud.
        if (/\s/.test(raw) && next.length > 0) {
            if (isWord(next)) {
                commit(next)
            } else {
                onChange(next)
                reject()
            }
            return
        }
        setDismissed(false)
        onChange(next)
    }

    const handlePaste = (event) => {
        const text = event.clipboardData?.getData("text") ?? ""
        const words = splitPhrase(text)
        if (words.length < 2) return
        event.preventDefault()
        onPasteWords(words)
    }

    const handleKeyDown = (event) => {
        const listOpen = open && !noMatches

        if (event.key === "Escape") {
            setDismissed(true)
            return
        }
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault()
            onNavigate(event.key === "ArrowDown" ? 1 : -1)
            return
        }
        // Left/right drive the strip while it is open; Escape hands them back
        // to the caret.
        if (
            listOpen &&
            (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ) {
            event.preventDefault()
            moveSelection(event.key === "ArrowRight" ? 1 : -1)
            return
        }
        if (event.key === "Backspace" && !value) {
            event.preventDefault()
            onNavigate(-1)
            return
        }
        if (event.key === "Enter" || event.key === "Tab" || event.key === " ") {
            if (event.key === "Tab" && !value) return
            if (event.key === " ") event.preventDefault()
            const word =
                listOpen && activeIndex >= 0 ? suggestions[activeIndex] : value
            if (isWord(word)) {
                event.preventDefault()
                commit(word)
            } else if (event.key !== "Tab") {
                event.preventDefault()
                reject()
            }
        }
    }

    const handleFocus = () => {
        setFocused(true)
        setDismissed(false)
    }

    const handleBlur = () => {
        setFocused(false)
    }

    return (
        <div className={styles.row}>
            <label
                htmlFor={fieldId}
                className={`${styles.field} ${focused ? styles.focused : ""} ${
                    invalid ? styles.invalid : ""
                }`}
            >
                {/* The digit is decoration over the field's own padding; the
                    slot's real name lives in the hidden span. */}
                <span className={styles.index} aria-hidden="true">
                    <Text
                        apple={{ variant: "body", weight: "regular" }}
                        material={{ variant: "subheadline1" }}
                    >
                        {index + 1}.
                    </Text>
                </span>
                <span className={styles.name}>Word {index + 1}</span>
                <TextField
                    id={fieldId}
                    ref={(element) => registerRef(index, element)}
                    value={value}
                    onChange={handleChange}
                    inputMode="text"
                    enterKeyHint={index === PHRASE_LENGTH - 1 ? "done" : "next"}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-autocomplete="list"
                    aria-controls={`${fieldId}-suggestions`}
                    aria-activedescendant={
                        open && activeIndex >= 0
                            ? suggestionId(fieldId, activeIndex)
                            : undefined
                    }
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </label>
            <AnimatePresence>
                {open && (
                    <SuggestionTooltip
                        suggestions={suggestions}
                        prefix={value}
                        activeIndex={activeIndex}
                        invalid={noMatches}
                        fieldId={fieldId}
                        onPick={commit}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

PhraseField.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
    registerRef: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onCommit: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onPasteWords: PropTypes.func.isRequired,
}

export default PhraseField
