import { forwardRef, useImperativeHandle, useMemo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, useMotionValue } from "motion/react"

import raysSrc from "@icons/others/Rays.svg"
import Slot from "./Slot"
import Chevron from "./Chevron"
import useReelController from "./useReelController"
import useReelHaptics from "./useReelHaptics"
import usePhaseFade from "./usePhaseFade"
import useVirtualWindow from "./useVirtualWindow"
import { SLOT_HEIGHT, VISIBLE_SLOT_BUFFER, targetYFor } from "./geometry"
import { forceGpuTransform } from "../../utils"
import { PHASE, PHASE_VALUES } from "../../mockData"
import * as styles from "./SpinReel.module.scss"

export { SLOT_HEIGHT } from "./geometry"

const SpinReel = forwardRef(function SpinReel(
    { items, idleIndex, focusedIndex, phase, centerOffset },
    ref
) {
    const y = useMotionValue(targetYFor(idleIndex, centerOffset))
    const { phaseFade, winnerPulse } = usePhaseFade(phase)
    const controller = useReelController({ y, idleIndex, centerOffset })
    useReelHaptics({ y, phase, centerOffset })
    const visibleRange = useVirtualWindow({
        motionValue: y,
        offset: centerOffset,
        step: SLOT_HEIGHT,
        count: items.length,
        buffer: VISIBLE_SLOT_BUFFER,
    })

    useImperativeHandle(ref, () => controller, [controller])

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
