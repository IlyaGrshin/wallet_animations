import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { useReducedMotion } from "motion/react"
import cx from "clsx"

import * as styles from "./StreamingText.module.scss"

const SPEED_PRESETS = {
    slow: 0.08,
    normal: 0.035,
    fast: 0.015,
}

const TYPE_PER_CHAR = {
    slow: 0.02,
    normal: 0.007,
    fast: 0.007 / 1.5,
}

const GRAPHEME_SEGMENTER = new Intl.Segmenter()

const splitGraphemes = (text) =>
    Array.from(GRAPHEME_SEGMENTER.segment(text), (s) => s.segment)

const tokenizeWords = (text) => {
    let index = 0
    return text.split("\n").map((line) =>
        line
            .split(/(\s+)/)
            .filter(Boolean)
            .map((piece) => {
                const animated = !/^\s+$/.test(piece)
                return {
                    content: piece,
                    animated,
                    index: animated ? index++ : -1,
                }
            })
    )
}

const WordReveal = ({ children, speed, delay, onComplete }) => {
    const reduceMotion = useReducedMotion()
    const stagger = reduceMotion
        ? 0
        : (SPEED_PRESETS[speed] ?? SPEED_PRESETS.normal)

    const lines = tokenizeWords(children)
    const lastIndex = Math.max(
        -1,
        ...lines.flatMap((tokens) => tokens.map((token) => token.index))
    )

    useEffect(() => {
        if (lastIndex < 0) onComplete?.()
    }, [lastIndex, onComplete])

    return (
        <span
            className={cx(styles.root, reduceMotion && styles.reduced)}
            style={{
                "--stagger": `${stagger}s`,
                "--delay": `${delay}ms`,
            }}
            onAnimationEnd={(event) => {
                if (event.target.dataset.last !== undefined) onComplete?.()
            }}
        >
            {lines.map((tokens, lineIdx) => (
                <span key={lineIdx} className={styles.line}>
                    {tokens.map((token, tokenIdx) => {
                        if (!token.animated) {
                            return <span key={tokenIdx}>{token.content}</span>
                        }
                        return (
                            <span
                                key={tokenIdx}
                                className={styles.token}
                                style={{ "--index": token.index }}
                                {...(token.index === lastIndex && {
                                    "data-last": "",
                                })}
                            >
                                {token.content}
                            </span>
                        )
                    })}
                </span>
            ))}
        </span>
    )
}

WordReveal.propTypes = {
    children: PropTypes.string.isRequired,
    speed: PropTypes.string,
    delay: PropTypes.number,
    onComplete: PropTypes.func,
}

const TypewriterReveal = ({ children, speed, delay, onComplete }) => {
    const reduceMotion = useReducedMotion()
    const perChar = TYPE_PER_CHAR[speed] ?? TYPE_PER_CHAR.normal
    const revealedRef = useRef(null)
    const leadingRef = useRef(null)

    useEffect(() => {
        const graphemes = splitGraphemes(children)
        const total = graphemes.length
        const text = document.createTextNode("")
        const leading = leadingRef.current
        revealedRef.current.replaceChildren(text)
        let shown = 0

        const show = (whole, frac) => {
            if (whole > shown) {
                text.appendData(graphemes.slice(shown, whole).join(""))
                shown = whole
            }
            leading.textContent = whole < total ? graphemes[whole] : ""
            leading.style.opacity = frac
        }

        if (reduceMotion) {
            show(total, 0)
            onComplete?.()
            return undefined
        }

        show(0, 0)
        const start = performance.now() + delay
        const charDurationMs = perChar * 1000
        let raf
        const tick = (now) => {
            const elapsed = now - start
            if (elapsed < 0) {
                raf = requestAnimationFrame(tick)
                return
            }
            const reveal = elapsed / charDurationMs
            const whole = Math.min(total, Math.floor(reveal))
            show(whole, whole < total ? Math.min(1, reveal - whole) : 0)
            if (whole < total) {
                raf = requestAnimationFrame(tick)
            } else {
                onComplete?.()
            }
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [children, perChar, delay, reduceMotion])

    return (
        <span className={styles.typewriter}>
            <span className={styles.typewriterGhost} aria-hidden="true">
                {children}
            </span>
            <span>
                <span ref={revealedRef} />
                <span ref={leadingRef} />
            </span>
        </span>
    )
}

TypewriterReveal.propTypes = {
    children: PropTypes.string.isRequired,
    speed: PropTypes.string,
    delay: PropTypes.number,
    onComplete: PropTypes.func,
}

const StreamingText = ({
    children,
    speed = "fast",
    mode = "word",
    delay = 0,
    replayKey,
    onComplete,
}) => {
    const Component = mode === "char" ? TypewriterReveal : WordReveal
    return (
        <Component
            key={replayKey}
            speed={speed}
            delay={delay}
            onComplete={onComplete}
        >
            {children}
        </Component>
    )
}

StreamingText.propTypes = {
    children: PropTypes.string.isRequired,
    speed: PropTypes.oneOf(["slow", "normal", "fast"]),
    mode: PropTypes.oneOf(["word", "char"]),
    delay: PropTypes.number,
    replayKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onComplete: PropTypes.func,
}

export default StreamingText
