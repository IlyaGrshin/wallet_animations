import { useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import {
    AnimatePresence,
    useAnimationControls,
    useReducedMotion,
} from "motion/react"

import Text from "../../../../../components/Text"
import WebApp from "../../../../../lib/twa"
import {
    MIN_PREFIX_LENGTH,
    PHRASE_LENGTH,
    isWord,
    sanitize,
    splitPhrase,
    suggest,
} from "../../bip39"
import SuggestionTooltip, { suggestionId } from "../SuggestionTooltip"

import * as styles from "./PhraseField.module.scss"

const REJECT_SHAKE = { x: [0, -6, 6, -4, 4, 0] }
const REJECT_TRANSITION = { duration: 0.36, ease: [0.23, 1, 0.32, 1] }

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
    const reduced = useReducedMotion()
    const controls = useAnimationControls()
    const [focused, setFocused] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    // Selection is keyed by the prefix that produced it, so a new keystroke
    // resets to the first match without an effect.
    const [selection, setSelection] = useState({ prefix: "", index: 0 })

    const hasPrefix = value.length >= MIN_PREFIX_LENGTH
    const suggestions = focused && hasPrefix ? suggest(value) : []
    const open = focused && hasPrefix && !dismissed
    const activeIndex =
        selection.prefix === value
            ? Math.min(selection.index, Math.max(suggestions.length - 1, 0))
            : 0
    // Anything left behind that the wordlist does not know reads as an error,
    // including slots filled by a paste that were never focused.
    const invalid = !focused && value.length > 0 && !isWord(value)

    const fieldId = `phrase-word-${index + 1}`

    // Refusing a word the list does not contain: a shake in place, never a
    // silent no-op.
    const reject = () => {
        WebApp.HapticFeedback?.notificationOccurred("error")
        if (reduced) return
        controls.start({ ...REJECT_SHAKE, transition: REJECT_TRANSITION })
    }

    const commit = (word) => {
        WebApp.HapticFeedback?.selectionChanged()
        setDismissed(false)
        setSelection({ prefix: "", index: 0 })
        onCommit(word)
    }

    const handleChange = (event) => {
        const raw = event.target.value
        const next = sanitize(raw)
        // A separator means the user finished the word (space bar, autocorrect):
        // accept it only if the list knows it, otherwise refuse out loud.
        if (raw !== next && next.length > 0) {
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

    const moveSelection = (delta) => {
        const count = suggestions.length
        setSelection({
            prefix: value,
            index: (activeIndex + delta + count) % count,
        })
    }

    const handleKeyDown = (event) => {
        const listOpen = open && suggestions.length > 0

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
            const word = listOpen ? suggestions[activeIndex] : value
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
            <Text
                as={m.label}
                animate={controls}
                htmlFor={fieldId}
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "subheadline1", weight: "medium" }}
                className={`${styles.field} ${focused ? styles.focused : ""} ${
                    invalid ? styles.invalid : ""
                }`}
            >
                <span className={styles.index}>
                    <Text
                        apple={{ variant: "body", weight: "regular" }}
                        material={{ variant: "subheadline1" }}
                    >
                        {index + 1}
                    </Text>
                </span>
                <input
                    id={fieldId}
                    ref={(element) => registerRef(index, element)}
                    className={styles.input}
                    value={value}
                    type="text"
                    inputMode="text"
                    enterKeyHint={index === PHRASE_LENGTH - 1 ? "done" : "next"}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-label={`Word ${index + 1}`}
                    aria-autocomplete="list"
                    aria-controls={`${fieldId}-suggestions`}
                    aria-activedescendant={
                        open && suggestions.length > 0
                            ? suggestionId(fieldId, activeIndex)
                            : undefined
                    }
                    onChange={handleChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
            </Text>
            <AnimatePresence>
                {open && (
                    <SuggestionTooltip
                        suggestions={suggestions}
                        prefix={value}
                        activeIndex={activeIndex}
                        invalid={suggestions.length === 0}
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
