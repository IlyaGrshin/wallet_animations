import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import {
    AnimatePresence,
    useAnimationControls,
    useReducedMotion,
} from "motion/react"

import Text from "../../../../../components/Text"
import { SPRING } from "../../../../../utils/animations"

import * as styles from "./SuggestionTooltip.module.scss"

const ENTER = { opacity: 0, scale: 0.88, y: -6 }
const VISIBLE = { opacity: 1, scale: 1, y: 0 }
const EXIT = { opacity: 0, scale: 0.92, y: -4 }

const CHIP_ENTER = { opacity: 0, scale: 0.7 }
const CHIP_VISIBLE = { opacity: 1, scale: 1 }

// Every further wrong letter nudges the copy, never the bubble around it.
const ERROR_PULSE = { scale: [1, 1.12, 1] }
const ERROR_PULSE_TRANSITION = { duration: 0.32, ease: [0.23, 1, 0.32, 1] }

const suggestionId = (fieldId, index) => `${fieldId}-suggestion-${index}`

/**
 * Word strip anchored under a phrase field. Resizes itself as the match count
 * changes and swaps to an inline error when the prefix matches no BIP-39 word.
 * @param {string[]} props.suggestions Words to offer, already limited.
 * @param {string} props.prefix        Letters typed so far — rendered highlighted.
 * @param {number} props.activeIndex   Keyboard-selected suggestion.
 * @param {boolean} [props.invalid]    Show the error copy instead of words.
 * @param {(word: string) => void} props.onPick
 * @example
 * <SuggestionTooltip suggestions={["word"]} prefix="wor" activeIndex={0} onPick={fill} />
 */
const SuggestionTooltip = ({
    suggestions,
    prefix,
    activeIndex,
    invalid = false,
    fieldId,
    onPick,
}) => {
    const reduced = useReducedMotion()
    const errorControls = useAnimationControls()
    const pulsedPrefix = useRef(null)

    // A resize is a layout change, so motion animates it on the compositor
    // (projection + scale correction) instead of tweening width/height.
    const layoutTransition = reduced ? { duration: 0 } : SPRING.GENTLE
    const shellTransition = reduced ? { duration: 0 } : SPRING.DROPDOWN

    useEffect(() => {
        if (!invalid) {
            pulsedPrefix.current = null
            return
        }
        const previous = pulsedPrefix.current
        pulsedPrefix.current = prefix
        // The first wrong letter rides the strip's own entrance; only the ones
        // typed after it get a pulse of their own.
        if (previous === null || previous === prefix || reduced) return
        errorControls.start({
            ...ERROR_PULSE,
            transition: ERROR_PULSE_TRANSITION,
        })
    }, [invalid, prefix, reduced, errorControls])

    return (
        <m.div
            className={styles.anchor}
            initial={reduced ? { opacity: 0 } : ENTER}
            animate={reduced ? { opacity: 1 } : VISIBLE}
            exit={reduced ? { opacity: 0 } : EXIT}
            transition={shellTransition}
        >
            <span className={styles.tail} />
            <m.div
                layout
                transition={layoutTransition}
                className={styles.bubble}
                role="listbox"
                id={`${fieldId}-suggestions`}
                aria-label="Word suggestions"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {invalid ? (
                        <m.span
                            key="invalid"
                            layout="position"
                            transition={layoutTransition}
                            initial={CHIP_ENTER}
                            animate={CHIP_VISIBLE}
                            exit={CHIP_ENTER}
                            className={styles.error}
                            role="alert"
                        >
                            {/* Scaling an inner span keeps the pulse a pure
                                transform: the bubble never resizes with it. */}
                            <m.span
                                animate={errorControls}
                                className={styles.errorLabel}
                            >
                                <Text
                                    apple={{
                                        variant: "body",
                                        weight: "semibold",
                                    }}
                                    material={{
                                        variant: "subheadline1",
                                        weight: "medium",
                                    }}
                                >
                                    Invalid Word
                                </Text>
                            </m.span>
                        </m.span>
                    ) : (
                        suggestions.map((word, index) => (
                            <m.button
                                key={word}
                                type="button"
                                layout="position"
                                transition={layoutTransition}
                                initial={CHIP_ENTER}
                                animate={CHIP_VISIBLE}
                                exit={CHIP_ENTER}
                                whileTap={reduced ? undefined : { scale: 0.94 }}
                                className={`${styles.chip} ${
                                    index === activeIndex ? styles.active : ""
                                }`}
                                id={suggestionId(fieldId, index)}
                                role="option"
                                aria-selected={index === activeIndex}
                                // Keep the caret in the field: a blur would
                                // close this strip before the click lands.
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => onPick(word)}
                            >
                                <Text
                                    apple={{
                                        variant: "body",
                                        weight: "semibold",
                                    }}
                                    material={{
                                        variant: "subheadline1",
                                        weight: "medium",
                                    }}
                                >
                                    <span className={styles.typed}>
                                        {word.slice(0, prefix.length)}
                                    </span>
                                    <span className={styles.rest}>
                                        {word.slice(prefix.length)}
                                    </span>
                                </Text>
                            </m.button>
                        ))
                    )}
                </AnimatePresence>
            </m.div>
        </m.div>
    )
}

SuggestionTooltip.propTypes = {
    suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
    prefix: PropTypes.string.isRequired,
    activeIndex: PropTypes.number.isRequired,
    invalid: PropTypes.bool,
    fieldId: PropTypes.string.isRequired,
    onPick: PropTypes.func.isRequired,
}

export { suggestionId }
export default SuggestionTooltip
