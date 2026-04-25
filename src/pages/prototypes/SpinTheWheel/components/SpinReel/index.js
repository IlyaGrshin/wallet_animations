import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import {
    AnimatePresence,
    animate,
    useMotionValue,
    useReducedMotion,
} from "motion/react"

import raysSrc from "@icons/others/Rays.svg"
import Slot from "./Slot"
import { PHASE, PHASE_VALUES } from "../../mockData"
import * as styles from "./SpinReel.module.scss"

export const SLOT_HEIGHT = 180
const SPIN_EASE = [0.42, 0, 0.58, 1]
const ACCEL_EASE = [0, 0, 0.3, 1]
const SETTLE_EASE = [0.34, 1, 0.64, 1]
const MIN_DURATION_MS = 180
const PHASE_FADE = { duration: 0.35, ease: "linear" }
const CRUISE_OVERSHOOT_PX = 14
const CRUISE_BOUNCE_RATIO = 0.18
const ADVANCE_SPRING = { type: "spring", stiffness: 220, damping: 22 }
const WIN_PULSE_KEYFRAMES = [1, 1.08, 1]
const WIN_PULSE_OPTIONS = {
    duration: 0.5,
    times: [0, 0.32, 1],
    ease: "easeOut",
}

const targetYFor = (index, centerOffset) => -index * SLOT_HEIGHT + centerOffset

function Chevron({ flip }) {
    return (
        <svg
            width="17"
            height="27"
            viewBox="0 0 17 27"
            fill="none"
            aria-hidden="true"
            style={flip ? { transform: "scaleX(-1)" } : undefined}
        >
            <path
                d="M15.6752 14.8889C16.5288 14.0975 16.5288 12.7471 15.6752 11.9557L3.35979 0.537348C2.07972 -0.649477 0 0.258365 0 2.00397V24.8406C0 26.5862 2.07972 27.4941 3.35979 26.3073L15.6752 14.8889Z"
                fill="#A3A1C3"
            />
        </svg>
    )
}

Chevron.propTypes = { flip: PropTypes.bool }

const arrowAnim = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
}

const SpinReel = forwardRef(function SpinReel(
    { items, idleIndex, focusedIndex, phase, centerOffset },
    ref
) {
    const y = useMotionValue(targetYFor(idleIndex, centerOffset))
    const phaseFade = useMotionValue(1)
    const winnerPulse = useMotionValue(1)
    const controlsRef = useRef(null)
    const targetIndexRef = useRef(idleIndex)
    const finishResolveRef = useRef(null)
    const startedAtRef = useRef(0)
    const durationRef = useRef(0)
    const centerOffsetRef = useRef(centerOffset)
    const reduceMotion = useReducedMotion()

    useEffect(() => {
        centerOffsetRef.current = centerOffset
        if (!controlsRef.current) {
            y.set(targetYFor(targetIndexRef.current, centerOffset))
        }
    }, [centerOffset, y])

    useEffect(() => {
        animate(phaseFade, phase === PHASE.RESULT ? 0 : 1, PHASE_FADE)
        if (phase === PHASE.RESULT) {
            animate(winnerPulse, WIN_PULSE_KEYFRAMES, WIN_PULSE_OPTIONS)
        } else {
            winnerPulse.set(1)
        }
    }, [phase, phaseFade, winnerPulse])

    useImperativeHandle(ref, () => {
        const settle = () => {
            const resolve = finishResolveRef.current
            finishResolveRef.current = null
            controlsRef.current = null
            resolve?.()
        }
        const startTween = (target, durationMs, ease, onDone = settle) => {
            startedAtRef.current = performance.now()
            durationRef.current = durationMs
            controlsRef.current?.stop()
            controlsRef.current = animate(y, target, {
                duration: durationMs / 1000,
                ease,
                onComplete: onDone,
            })
        }
        const targetY = (index) => targetYFor(index, centerOffsetRef.current)
        return {
            spinTo({ targetIndex, duration }) {
                targetIndexRef.current = targetIndex
                const target = targetY(targetIndex)
                if (reduceMotion) {
                    y.set(target)
                    return Promise.resolve()
                }
                return new Promise((resolve) => {
                    finishResolveRef.current = resolve
                    startTween(target, duration, SPIN_EASE)
                })
            },
            accelerate(factor) {
                if (reduceMotion) return
                const target = targetY(targetIndexRef.current)
                if (Math.abs(target - y.get()) < 0.5) return
                const elapsed = performance.now() - startedAtRef.current
                const remainingTime = Math.max(
                    durationRef.current - elapsed,
                    MIN_DURATION_MS
                )
                const newDuration = Math.max(
                    remainingTime * factor,
                    MIN_DURATION_MS
                )
                startTween(target, newDuration, ACCEL_EASE)
            },
            cruise(durationMs) {
                if (reduceMotion) return
                const target = targetY(targetIndexRef.current)
                const dist = target - y.get()
                if (Math.abs(dist) < 0.5) return
                const overshoot = target + Math.sign(dist) * CRUISE_OVERSHOOT_PX
                const cruiseMs = durationMs * (1 - CRUISE_BOUNCE_RATIO)
                const bounceMs = durationMs * CRUISE_BOUNCE_RATIO
                startTween(overshoot, cruiseMs, ACCEL_EASE, () => {
                    startTween(target, bounceMs, SETTLE_EASE)
                })
            },
            advanceTo(index) {
                if (reduceMotion || controlsRef.current) return
                targetIndexRef.current = index
                const myControls = animate(y, targetY(index), {
                    ...ADVANCE_SPRING,
                    onComplete: () => {
                        if (controlsRef.current === myControls) {
                            controlsRef.current = null
                        }
                    },
                })
                controlsRef.current = myControls
            },
            snapTo(index) {
                controlsRef.current?.stop()
                controlsRef.current = null
                targetIndexRef.current = index
                y.set(targetY(index))
                settle()
            },
        }
    }, [y, reduceMotion])

    const slots = useMemo(
        () =>
            items.map((item, index) => (
                <Slot
                    key={index}
                    index={index}
                    item={item}
                    y={y}
                    phaseFade={phaseFade}
                    winnerPulse={winnerPulse}
                    isWinner={index === focusedIndex}
                    slotHeight={SLOT_HEIGHT}
                    centerOffset={centerOffset}
                />
            )),
        [items, focusedIndex, centerOffset, y, phaseFade, winnerPulse]
    )

    return (
        <div className={styles.viewport}>
            <img
                src={raysSrc}
                className={styles.rays}
                alt=""
                aria-hidden="true"
            />
            {["left", "right"].map((side) => (
                <AnimatePresence key={side}>
                    {phase === PHASE.SPINNING && (
                        <m.span
                            key={side}
                            className={
                                side === "left"
                                    ? styles.arrowLeft
                                    : styles.arrowRight
                            }
                            {...arrowAnim}
                        >
                            <Chevron flip={side === "right"} />
                        </m.span>
                    )}
                </AnimatePresence>
            ))}
            <m.div className={styles.track} style={{ y }}>
                {slots}
            </m.div>
        </div>
    )
})

SpinReel.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            token: PropTypes.shape({
                ticker: PropTypes.string.isRequired,
                image: PropTypes.string.isRequired,
            }).isRequired,
            amount: PropTypes.number.isRequired,
        })
    ).isRequired,
    idleIndex: PropTypes.number.isRequired,
    focusedIndex: PropTypes.number.isRequired,
    phase: PropTypes.oneOf(PHASE_VALUES).isRequired,
    centerOffset: PropTypes.number.isRequired,
}

export default SpinReel
