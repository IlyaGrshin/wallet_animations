import { useState, useEffect, useRef, useMemo } from "react"
import PropTypes from "prop-types"
import { motion } from "motion/react"
import NumberFlow from "@number-flow/react"
import * as styles from "./Wheel.module.scss"

import WebApp from "@twa-dev/sdk"
import { DURATION } from "../../utils/animations"

const Wheel = ({
    value,
    defaultValue = 1,
    onChange,
    max = 40,
    formatter = (v) => `${v}×`,
    disabled = false,
    enableHaptic = true,
    className,
}) => {
    const min = 1
    const scrollRef = useRef(null)
    const ticking = useRef(false)

    // Controlled/uncontrolled pattern (following Switch component)
    const isControlled = value !== undefined
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const currentValue = isControlled ? value : uncontrolled

    const setValue = (newValue) => {
        if (!isControlled) setUncontrolled(newValue)
        onChange?.(newValue)
    }

    // Extract suffix/prefix from formatter
    const getSuffixPrefix = () => {
        const formatted = formatter(1)
        const numberStr = "1"
        const prefixMatch = formatted.match(/^(.+?)1/)
        const suffixMatch = formatted.match(/1(.+?)$/)

        return {
            prefix: prefixMatch ? prefixMatch[1] : "",
            suffix: suffixMatch ? suffixMatch[1] : "",
        }
    }

    const { prefix, suffix } = getSuffixPrefix()

    // Generate ticks array
    const ticks = useMemo(() => {
        return Array.from({ length: max - min + 1 }, (_, i) => min + i)
    }, [min, max])

    // Handle scroll events with RAF throttling (following Picker pattern)
    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current || disabled) return

            ticking.current = true
            requestAnimationFrame(() => {
                if (!scrollRef.current) {
                    ticking.current = false
                    return
                }

                const scrollLeft = scrollRef.current.scrollLeft
                const firstChild = scrollRef.current.children[0]
                if (!firstChild) {
                    ticking.current = false
                    return
                }

                // Calculate tick width + gap from actual elements
                const tickWidth = firstChild.offsetWidth
                const containerStyle = window.getComputedStyle(scrollRef.current)
                const gap = parseFloat(containerStyle.gap) || 16
                const stepWidth = tickWidth + gap

                const index = Math.round(scrollLeft / stepWidth)
                const newValue = Math.min(max, Math.max(min, index + 1))

                if (currentValue !== newValue) {
                    setValue(newValue)
                }

                ticking.current = false
            })
        }

        const container = scrollRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [currentValue, min, max, disabled])

    // Haptic feedback on value change (following Picker pattern)
    useEffect(() => {
        if (enableHaptic && currentValue >= min && currentValue <= max) {
            WebApp.HapticFeedback.selectionChanged()
        }
    }, [currentValue, enableHaptic, min, max])

    // Scroll to specific value
    const scrollToValue = (targetValue) => {
        if (!scrollRef.current) return

        const firstChild = scrollRef.current.children[0]
        if (!firstChild) return

        const tickWidth = firstChild.offsetWidth
        const containerStyle = window.getComputedStyle(scrollRef.current)
        const gap = parseFloat(containerStyle.gap) || 16
        const stepWidth = tickWidth + gap

        const index = targetValue - 1
        scrollRef.current.scrollTo({
            left: index * stepWidth,
            behavior: "smooth",
        })
    }

    // Min/Max button handlers
    const handleMinClick = () => {
        if (disabled) return
        scrollToValue(min)
    }

    const handleMaxClick = () => {
        if (disabled) return
        scrollToValue(max)
    }

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (disabled) return

        switch (e.key) {
            case "ArrowLeft":
            case "ArrowDown":
                e.preventDefault()
                scrollToValue(Math.max(min, currentValue - 1))
                break
            case "ArrowRight":
            case "ArrowUp":
                e.preventDefault()
                scrollToValue(Math.min(max, currentValue + 1))
                break
            case "Home":
                e.preventDefault()
                scrollToValue(min)
                break
            case "End":
                e.preventDefault()
                scrollToValue(max)
                break
        }
    }

    // Initialize scroll position
    useEffect(() => {
        if (scrollRef.current && currentValue) {
            const firstChild = scrollRef.current.children[0]
            if (!firstChild) return

            const tickWidth = firstChild.offsetWidth
            const containerStyle = window.getComputedStyle(scrollRef.current)
            const gap = parseFloat(containerStyle.gap) || 16
            const stepWidth = tickWidth + gap

            const index = currentValue - 1
            scrollRef.current.scrollLeft = index * stepWidth
        }
    }, []) // Run once on mount

    const cx = className ? `${styles.root} ${className}` : styles.root

    return (
        <div className={cx} data-disabled={disabled || undefined}>
            {/* Header with Min/Max buttons */}
            <div className={styles.header}>
                <motion.button
                    className={styles.button}
                    onClick={handleMinClick}
                    disabled={disabled}
                    whileTap={!disabled ? { scale: 0.95 } : undefined}
                >
                    Min
                </motion.button>
                <motion.button
                    className={styles.button}
                    onClick={handleMaxClick}
                    disabled={disabled}
                    whileTap={!disabled ? { scale: 0.95 } : undefined}
                >
                    Max
                </motion.button>
            </div>

            {/* Current value display */}
            <div className={styles.currentValue}>
                <NumberFlow
                    value={currentValue}
                    format={{ notation: "standard" }}
                    prefix={prefix}
                    suffix={suffix}
                    willChange
                    style={{ color: "inherit", fontSize: "inherit" }}
                    spinTiming={{
                        duration: DURATION.FAST,
                        easing: "ease-out",
                    }}
                    opacityTiming={{
                        duration: DURATION.FAST / 2,
                        easing: "ease-out",
                    }}
                />
            </div>

            {/* Wheel container with center indicator */}
            <div className={styles.wheelContainer}>
                {/* Center indicator background */}
                <div className={styles.centerIndicator} />

                {/* Scrollable tick container */}
                <div
                    ref={scrollRef}
                    className={styles.scrollContainer}
                    role="slider"
                    aria-label="Value selector"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={currentValue}
                    aria-disabled={disabled || undefined}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={handleKeyDown}
                >
                    {ticks.map((tickValue, index) => (
                        <div key={index} className={styles.tick}>
                            <span className={styles.tickNumber}>
                                {tickValue}
                            </span>
                            <span className={styles.tickMark} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

Wheel.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func,
    max: PropTypes.number,
    formatter: PropTypes.func,
    disabled: PropTypes.bool,
    enableHaptic: PropTypes.bool,
    className: PropTypes.string,
}

export default Wheel
