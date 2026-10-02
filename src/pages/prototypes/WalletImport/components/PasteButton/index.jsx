import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useReducedMotion } from "motion/react"

import Tappable from "../../../../../components/Tappable"
import Text from "../../../../../components/Text"
import WebApp, { isTelegram } from "../../../../../lib/twa"
import { splitPhrase } from "../../bip39"
import { EASING } from "../../../../../utils/animations"

import * as styles from "./PasteButton.module.scss"

const HIDDEN = { opacity: 0, scale: 0.92 }
const VISIBLE = { opacity: 1, scale: 1 }
const TRANSITION = { duration: 0.16, ease: EASING.QUINT_OUT }

// Telegram hands the clipboard back through a callback; the browser resolves a
// promise and may refuse outright when the page has no permission.
const readClipboard = () => {
    if (isTelegram()) {
        return new Promise((resolve) =>
            WebApp.readTextFromClipboard((text) => resolve(text ?? ""))
        )
    }
    return (
        navigator.clipboard?.readText?.().catch(() => "") ?? Promise.resolve("")
    )
}

/**
 * Fills the phrase from the clipboard. Sits inside a field, so the mousedown is
 * swallowed to keep the caret where it was.
 * @param {(words: string[]) => void} props.onPaste
 * @example
 * <PasteButton onPaste={(words) => fillFrom(0, words)} />
 */
const PasteButton = ({ onPaste }) => {
    const reduced = useReducedMotion()

    const handleClick = async () => {
        const words = splitPhrase(await readClipboard())
        if (words.length === 0) return
        WebApp.HapticFeedback?.impactOccurred("light")
        onPaste(words)
    }

    return (
        <m.span
            className={styles.root}
            initial={HIDDEN}
            animate={VISIBLE}
            exit={HIDDEN}
            transition={reduced ? { duration: 0 } : TRANSITION}
        >
            <Tappable
                as="button"
                type="button"
                mode="opacity"
                className={styles.button}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleClick}
            >
                <Text
                    apple={{ variant: "subheadline1", weight: "semibold" }}
                    material={{ variant: "subheadline1", weight: "medium" }}
                    rounded
                >
                    Paste
                </Text>
            </Tappable>
        </m.span>
    )
}

PasteButton.propTypes = {
    onPaste: PropTypes.func.isRequired,
}

export default PasteButton
