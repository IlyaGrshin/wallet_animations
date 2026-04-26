import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, animate, useMotionValue } from "motion/react"

import raysSrc from "@icons/others/Rays.svg"
import WebApp from "@lib/twa"
import Slot from "./Slot"
import Chevron from "./Chevron"
import useReelController from "./useReelController"
import useVirtualWindow from "./useVirtualWindow"
import {
    SLOT_HEIGHT,
    VISIBLE_SLOT_BUFFER,
    targetYFor,
    indexAtY,
} from "./geometry"
import { forceGpuTransform } from "../../utils"
import { PHASE, PHASE_VALUES } from "../../mockData"
import * as styles from "./SpinReel.module.scss"

export { SLOT_HEIGHT } from "./geometry"

const PHASE_FADE = { duration: 0.35, ease: "linear" }
const WIN_PULSE_KEYFRAMES = [1, 1.08, 1]
const WIN_PULSE_OPTIONS = {
    duration: 0.5,
    times: [0, 0.32, 1],
    ease: "easeOut",
}

const SpinReel = forwardRef(function SpinReel(
    { items, idleIndex, focusedIndex, phase, centerOffset },
    ref
) {
    const y = useMotionValue(targetYFor(idleIndex, centerOffset))
    const phaseFade = useMotionValue(1)
    const winnerPulse = useMotionValue(1)
    const controller = useReelController({ y, idleIndex, centerOffset })
    const visibleRange = useVirtualWindow({
        motionValue: y,
        offset: centerOffset,
        step: SLOT_HEIGHT,
        count: items.length,
        buffer: VISIBLE_SLOT_BUFFER,
    })

    useImperativeHandle(ref, () => controller, [controller])

    useEffect(() => {
        const fadeControls = animate(
            phaseFade,
            phase === PHASE.RESULT ? 0 : 1,
            PHASE_FADE
        )
        let pulseControls
        if (phase === PHASE.RESULT) {
            pulseControls = animate(
                winnerPulse,
                WIN_PULSE_KEYFRAMES,
                WIN_PULSE_OPTIONS
            )
        } else {
            winnerPulse.set(1)
        }
        return () => {
            fadeControls.stop()
            pulseControls?.stop()
        }
    }, [phase, phaseFade, winnerPulse])

    useEffect(() => {
        if (phase !== PHASE.SPINNING) return undefined
        let lastIndex = indexAtY(y.get(), centerOffset)
        return y.on("change", (latest) => {
            const index = indexAtY(latest, centerOffset)
            if (index !== lastIndex) {
                lastIndex = index
                WebApp.HapticFeedback?.selectionChanged?.()
            }
        })
    }, [phase, y, centerOffset])

    const slots = useMemo(() => {
        const list = []
        for (let i = visibleRange.start; i < visibleRange.end; i += 1) {
            list.push(
                <Slot
                    key={i}
                    index={i}
                    item={items[i]}
                    y={y}
                    phaseFade={phaseFade}
                    winnerPulse={winnerPulse}
                    isWinner={i === focusedIndex}
                    slotHeight={SLOT_HEIGHT}
                    centerOffset={centerOffset}
                />
            )
        }
        return list
    }, [
        items,
        visibleRange,
        focusedIndex,
        centerOffset,
        y,
        phaseFade,
        winnerPulse,
    ])

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
                    {phase === PHASE.SPINNING && <Chevron side={side} />}
                </AnimatePresence>
            ))}
            <m.div
                className={styles.track}
                style={{ y }}
                transformTemplate={forceGpuTransform}
            >
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
