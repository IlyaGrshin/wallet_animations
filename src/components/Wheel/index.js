import PropTypes from "prop-types"
import { motion } from "motion/react"
import NumberFlow from "@number-flow/react"
import * as styles from "./Wheel.module.scss"

import { DURATION } from "../../utils/animations"
import useHorizontalDrag from "./useHorizontalDrag"
import useWheelSnap from "./useWheelSnap"

const CenterIndicator = <div className={styles.centerIndicator} />

const Wheel = ({
    value,
    defaultValue = 1,
    onChange,
    max = 40,
    prefix = "",
    suffix = "\u00d7",
    disabled = false,
    enableHaptic = true,
    className,
}) => {
    const {
        dragControls,
        onPointerDown,
        onDragEnd: onDragEndScroll,
        onPointerUp,
    } = useHorizontalDrag(disabled)

    const {
        currentValue,
        shouldAnimate,
        x,
        handleDrag,
        handleDragEnd,
        animateToValue,
        dragConstraints,
        ticks,
        min,
    } = useWheelSnap({
        value,
        defaultValue,
        onChange,
        max,
        disabled,
        enableHaptic,
        onDragEndScroll,
    })

    const handleKeyDown = (e) => {
        if (disabled) return

        const keyActions = {
            ArrowLeft: () => animateToValue(Math.max(min, currentValue - 1)),
            ArrowDown: () => animateToValue(Math.max(min, currentValue - 1)),
            ArrowRight: () => animateToValue(Math.min(max, currentValue + 1)),
            ArrowUp: () => animateToValue(Math.min(max, currentValue + 1)),
            Home: () => animateToValue(min),
            End: () => animateToValue(max),
        }

        const action = keyActions[e.key]
        if (!action) return
        e.preventDefault()
        action()
    }

    const cx = className ? `${styles.root} ${className}` : styles.root

    return (
        <div className={cx} data-disabled={disabled || undefined}>
            <div className={styles.header}>
                <motion.button
                    className={styles.button}
                    onClick={() => animateToValue(min)}
                    disabled={disabled}
                    whileTap={!disabled ? { scale: 0.95 } : undefined}
                >
                    Min
                </motion.button>
                <motion.button
                    className={styles.button}
                    onClick={() => animateToValue(max)}
                    disabled={disabled}
                    whileTap={!disabled ? { scale: 0.95 } : undefined}
                >
                    Max
                </motion.button>
            </div>

            <div className={styles.currentValue}>
                <NumberFlow
                    value={currentValue}
                    format={{ notation: "standard" }}
                    prefix={prefix}
                    suffix={suffix}
                    animated={shouldAnimate}
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

            <div
                className={styles.wheelContainer}
                role="slider"
                aria-label="Value selector"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={currentValue}
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
            >
                {CenterIndicator}

                <motion.div
                    className={styles.ticksContainer}
                    style={{ x }}
                    drag={disabled ? false : "x"}
                    dragControls={dragControls}
                    dragListener={false}
                    dragConstraints={dragConstraints}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                >
                    {ticks.map((tickValue) => (
                        <div key={tickValue} className={styles.tick}>
                            <span className={styles.tickNumber}>
                                {tickValue}
                            </span>
                            <span className={styles.tickMark} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

Wheel.propTypes = {
    value: PropTypes.number,
    defaultValue: PropTypes.number,
    onChange: PropTypes.func,
    max: PropTypes.number,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    disabled: PropTypes.bool,
    enableHaptic: PropTypes.bool,
    className: PropTypes.string,
}

export default Wheel
