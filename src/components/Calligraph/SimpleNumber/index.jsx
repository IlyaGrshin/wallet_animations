import { useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import * as styles from "./SimpleNumber.module.scss"

const DIGIT_SHIFT = 8
const STAGGER = 0.02

const isDigit = (char) => char >= "0" && char <= "9"
const toNumber = (text) => parseFloat(text.replace(/[^0-9.-]/g, "")) || 0

const slots = (text) => {
    const chars = Array.from(text)
    const split = Math.max(chars.findIndex(isDigit), 0)
    return chars.map((char, index) => ({
        char,
        key: index < split ? `p${index}` : `${chars.length - 1 - index}`,
    }))
}

const reconcile = (state, text) => {
    const direction = Math.sign(toNumber(text) - toNumber(state.text)) || 1
    const previous = Object.fromEntries(
        slots(state.text).map(({ key, char }) => [key, char])
    )
    const changes = {}
    let gen = state.gen

    for (const { key, char } of slots(text)) {
        const prevChar = previous[key]
        if (prevChar === char) {
            if (state.changes[key]) changes[key] = state.changes[key]
            continue
        }
        gen += 1
        changes[key] = { gen, prevChar, direction }
    }

    return { text, gen, changes }
}

export default function SimpleNumber({
    value,
    className,
    as: Component = "span",
    ...rest
}) {
    const [state, setState] = useState({ text: value, gen: 0, changes: {} })
    const current = value === state.text ? state : reconcile(state, value)
    if (current !== state) setState(current)

    return (
        <Component
            aria-label={value}
            {...rest}
            className={cx(styles.root, className)}
        >
            {slots(value).map(({ char, key }, index) => {
                const change = current.changes[key]

                if (!change) {
                    return (
                        <span
                            key={`col-${key}`}
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
                        key={`col-${key}`}
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
        </Component>
    )
}

SimpleNumber.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
    as: PropTypes.elementType,
}
