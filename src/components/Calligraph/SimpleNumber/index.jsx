import { useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import * as styles from "./SimpleNumber.module.scss"

const DIGIT_SHIFT = 8
const STAGGER = 0.02

const isDigit = (char) => char >= "0" && char <= "9"
const toNumber = (text) => parseFloat(text.replace(/[^0-9.-]/g, "")) || 0

const reconcile = (state, text) => {
    const direction = Math.sign(toNumber(text) - toNumber(state.text)) || 1
    const oldChars = Array.from(state.text)
    const newChars = Array.from(text)
    const changes = {}
    let gen = state.gen

    for (let col = 0; col < newChars.length; col++) {
        const prevChar = oldChars[oldChars.length - 1 - col]
        const char = newChars[newChars.length - 1 - col]
        if (prevChar === char) {
            if (state.changes[col]) changes[col] = state.changes[col]
            continue
        }
        gen += 1
        changes[col] = { gen, prevChar, direction }
    }

    return { text, gen, changes }
}

export default function SimpleNumber({ value, className }) {
    const [state, setState] = useState({ text: value, gen: 0, changes: {} })
    const current = value === state.text ? state : reconcile(state, value)
    if (current !== state) setState(current)

    const chars = Array.from(value)

    return (
        <span className={cx(styles.root, className)} aria-label={value}>
            {chars.map((char, index) => {
                const col = chars.length - 1 - index
                const change = current.changes[col]

                if (!change) {
                    return (
                        <span
                            key={`col-${col}`}
                            className={styles.column}
                            aria-hidden="true"
                        >
                            {char}
                        </span>
                    )
                }

                const delay = `${index * STAGGER}s`
                const shift = DIGIT_SHIFT * change.direction

                return (
                    <span
                        key={`col-${col}`}
                        className={styles.column}
                        aria-hidden="true"
                    >
                        {change.prevChar !== undefined && (
                            <span
                                key={`exit-${change.gen}`}
                                className={styles.exit}
                                style={{
                                    "--delay": delay,
                                    "--shift": `${isDigit(change.prevChar) ? -shift : 0}px`,
                                }}
                            >
                                {change.prevChar}
                            </span>
                        )}
                        <span
                            key={`enter-${change.gen}`}
                            className={styles.enter}
                            style={{
                                "--delay": delay,
                                "--shift": `${isDigit(char) ? shift : 0}px`,
                            }}
                        >
                            {char}
                        </span>
                    </span>
                )
            })}
        </span>
    )
}

SimpleNumber.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
}
