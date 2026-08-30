import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import {
    AnimatePresence,
    useAnimationControls,
    useReducedMotion,
} from "motion/react"

import Text from "../../../../../components/Text"
import {
    TAIL_HEIGHT_REGULAR,
    TAIL_WIDTH_VERTICAL,
    buildTailClipPath,
} from "../../../../../components/Tooltip/tooltipPath"
import { GAP } from "../../../../../components/Tooltip/tooltipPosition"
import { EASING, SPRING } from "../../../../../utils/animations"

import * as styles from "./SuggestionTooltip.module.scss"

const ANCHOR_STYLE = { top: `calc(100% + ${GAP + TAIL_HEIGHT_REGULAR}px)` }

const TAIL_STYLE = {
    width: TAIL_WIDTH_VERTICAL,
    height: TAIL_HEIGHT_REGULAR,
    clipPath: buildTailClipPath({
        breadth: TAIL_WIDTH_VERTICAL,
        protrusion: TAIL_HEIGHT_REGULAR,
    }),
}

const STRIP_VARIANTS = {
    hidden: { opacity: 0, scale: 0.92, filter: "blur(5px)" },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...SPRING.APPLE,
            opacity: { duration: 0.12, ease: EASING.QUINT_OUT },
            filter: { duration: 0.16, ease: EASING.QUINT_OUT },
        },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        filter: "blur(4px)",
        transition: { duration: 0.14, ease: EASING.QUINT_OUT },
    },
}

// Both live here rather than in the stylesheet: motion only undoes the scale
// distortion of a layout animation for values it owns.
const BUBBLE_STYLE = {
    borderRadius: 18,
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.18)",
}

const INSTANT = { duration: 0 }

const REDUCED_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: INSTANT },
    exit: { opacity: 0, transition: INSTANT },
}

const RESIZE_SPRING = { type: "spring", stiffness: 700, damping: 55 }

const ITEM_HIDDEN = { opacity: 0, scale: 0.96 }
const ITEM_VISIBLE = { opacity: 1, scale: 1 }
const ITEM_TRANSITION = {
    ...RESIZE_SPRING,
    opacity: { duration: 0.12, ease: EASING.QUINT_OUT },
}

const ERROR_PULSE = { scale: [1, 1.05, 1] }
const ERROR_PULSE_TRANSITION = { duration: 0.4, ease: EASING.EASE_IN_OUT }

export const suggestionsId = (fieldId) => `${fieldId}-suggestions`
export const suggestionId = (fieldId, index) =>
    `${fieldId}-suggestion-${index}`

/**
 * Word strip anchored under a phrase field. Resizes itself as the match count
 * changes and swaps to an inline error when nothing is left to suggest.
 * @param {string[]} props.suggestions Words to offer, already limited.
 * @param {string} props.prefix        Letters typed so far — rendered highlighted.
 * @param {number} props.activeIndex   Keyboard-selected suggestion.
 * @param {(word: string) => void} props.onPick
 * @example
 * <SuggestionTooltip suggestions={["word"]} prefix="wor" activeIndex={0} onPick={fill} />
 */
const SuggestionTooltip = ({
    suggestions,
    prefix,
    activeIndex,
    fieldId,
    onPick,
}) => {
    const reduced = useReducedMotion()
    const errorControls = useAnimationControls()
    const pulsedPrefix = useRef(null)

    const invalid = suggestions.length === 0
    const layoutTransition = reduced ? INSTANT : RESIZE_SPRING
    const itemTransition = reduced ? INSTANT : ITEM_TRANSITION

    // With nothing to choose between, the highlight has no work to do — the lone
    // word is what Enter takes either way.
    const highlighted = suggestions.length > 1 ? activeIndex : -1

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
            style={ANCHOR_STYLE}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={reduced ? REDUCED_VARIANTS : STRIP_VARIANTS}
        >
            <span className={styles.tail} style={TAIL_STYLE} />
            <m.div
                layout
                transition={layoutTransition}
                style={BUBBLE_STYLE}
                className={styles.bubble}
                role="listbox"
                id={suggestionsId(fieldId)}
                aria-label="Word suggestions"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {invalid ? (
                        <m.span
                            key="invalid"
                            layout="position"
                            transition={layoutTransition}
                            initial={ITEM_HIDDEN}
                            animate={ITEM_VISIBLE}
                            exit={ITEM_HIDDEN}
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
                                        variant: "subheadline2",
                                        weight: "semibold",
                                    }}
                                    material={{
                                        variant: "subheadline2",
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
                                transition={itemTransition}
                                initial={ITEM_HIDDEN}
                                animate={ITEM_VISIBLE}
                                exit={ITEM_HIDDEN}
                                whileTap={reduced ? undefined : { scale: 0.94 }}
                                className={
                                    index === highlighted
                                        ? `${styles.chip} ${styles.active}`
                                        : styles.chip
                                }
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
                                        variant: "subheadline2",
                                        weight: "semibold",
                                    }}
                                    material={{
                                        variant: "subheadline2",
                                        weight: "medium",
                                    }}
                                >
                                    <span>
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
    fieldId: PropTypes.string.isRequired,
    onPick: PropTypes.func.isRequired,
}

export default SuggestionTooltip
