import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import { initialState, isDigit, reconcile, slots } from "./reconcile"
import * as styles from "./SimpleNumber.module.scss"

const DIGIT_SHIFT = 8
const STAGGER = 0.02
const SLIDE_DURATION = 250
const SLIDE_EASING = "cubic-bezier(0.23, 1, 0.32, 1)"

const shiftFor = (char, shift) => `${isDigit(char) ? shift : 0}px`

function Dropped({ dropped, ref }) {
    const shift = -DIGIT_SHIFT * dropped.direction
    return (
        <span ref={ref} className={styles.dropped}>
            {dropped.slots.map(({ key, char }) => (
                <span
                    key={key}
                    className={styles.ghost}
                    style={{ "--shift": shiftFor(char, shift) }}
                >
                    {char}
                </span>
            ))}
        </span>
    )
}

Dropped.propTypes = {
    dropped: PropTypes.shape({
        slots: PropTypes.arrayOf(
            PropTypes.shape({ key: PropTypes.string, char: PropTypes.string })
        ).isRequired,
        direction: PropTypes.number.isRequired,
    }).isRequired,
    ref: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
}

function Column({ char, change, index, children }) {
    if (!change) {
        return (
            <span className={styles.column} aria-hidden="true">
                {char}
                {children}
            </span>
        )
    }

    const delay = `${index * STAGGER}s`
    const shift = DIGIT_SHIFT * change.direction

    return (
        <span className={styles.column} aria-hidden="true">
            {change.prevChar !== undefined && (
                <span
                    key={`exit-${change.gen}`}
                    className={styles.exit}
                    style={{
                        "--delay": delay,
                        "--shift": shiftFor(change.prevChar, -shift),
                    }}
                >
                    {change.prevChar}
                </span>
            )}
            <span
                key={`enter-${change.gen}`}
                className={styles.enter}
                style={{ "--delay": delay, "--shift": shiftFor(char, shift) }}
            >
                {char}
            </span>
            {children}
        </span>
    )
}

Column.propTypes = {
    char: PropTypes.string.isRequired,
    change: PropTypes.shape({
        gen: PropTypes.number,
        prevChar: PropTypes.string,
        direction: PropTypes.number,
    }),
    index: PropTypes.number.isRequired,
    children: PropTypes.node,
}

export default function SimpleNumber({
    value,
    className,
    as: Component = "span",
    ...rest
}) {
    const [state, setState] = useState(() => initialState(value))
    const current = value === state.text ? state : reconcile(state, value)
    if (current !== state) setState(current)

    const digitsRef = useRef(null)
    const droppedRef = useRef(null)
    const { slide, dropped } = current

    useLayoutEffect(() => {
        const digits = digitsRef.current
        if (!digits) return
        if (!slide) {
            digits.getAnimations().forEach((animation) => animation.cancel())
            return
        }

        const host = digits.parentElement.parentElement
        if (host && getComputedStyle(host).direction === "rtl") return

        const offset = slide.added
            ? -(digits.children[slide.added]?.offsetLeft ?? 0)
            : (droppedRef.current?.offsetWidth ?? 0)
        if (!offset) return

        digits.animate(
            [{ translate: `${offset}px 0` }, { translate: "0 0" }],
            { duration: SLIDE_DURATION, easing: SLIDE_EASING }
        )
    }, [slide])

    const all = slots(value)
    const prefixLength = all.findIndex(({ key }) => !key.startsWith("p"))
    const split = prefixLength === -1 ? all.length : prefixLength
    const renderColumn = ({ char, key }, index) => (
        <Column
            key={`col-${key}`}
            char={char}
            change={current.changes[key]}
            index={index}
        >
            {index === split && dropped && (
                <Dropped
                    key={`dropped-${dropped.gen}`}
                    ref={droppedRef}
                    dropped={dropped}
                />
            )}
        </Column>
    )

    return (
        <Component
            aria-label={value}
            {...rest}
            className={cx(styles.root, className)}
        >
            {all.slice(0, split).map(renderColumn)}
            <span ref={digitsRef} className={styles.digits}>
                {all
                    .slice(split)
                    .map((slot, index) => renderColumn(slot, index + split))}
            </span>
        </Component>
    )
}

SimpleNumber.propTypes = {
    value: PropTypes.string.isRequired,
    className: PropTypes.string,
    as: PropTypes.elementType,
}
