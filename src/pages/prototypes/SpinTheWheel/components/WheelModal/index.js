import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import { Calligraph } from "calligraph"

import ModalView from "@components/ModalView"
import Text from "@components/Text"
import WebApp from "@lib/twa"

import SpinReel, { SLOT_HEIGHT } from "../SpinReel"
import Stars from "./Stars"
import Footer from "./Footer"
import {
    SPIN_DURATION_MS,
    SPEED_UP_FACTOR,
    MAX_SPEED_UPS,
    CRUISE_DURATION_MS,
    SPIN_TURNS,
    IDLE_INDEX,
    IDLE_NUDGE_INTERVAL_MS,
    REEL_HARD_CAP,
} from "./animationConfig"
import useStageLayout from "./useStageLayout"
import useReelItems from "./useReelItems"
import { preloadRewardImages } from "../../utils"
import { PHASE, POINTS_BALANCE, SPIN_COST } from "../../mockData"
import * as styles from "./WheelModal.module.scss"

function WheelModal({ isOpen, onClose }) {
    const [phase, setPhase] = useState(PHASE.IDLE)
    const [focusedIndex, setFocusedIndex] = useState(IDLE_INDEX)
    const [points, setPoints] = useState(POINTS_BALANCE)
    const [speedUps, setSpeedUps] = useState(0)
    const {
        items,
        reset: resetItems,
        growForSpin,
        growForIdle,
    } = useReelItems()
    const { stageRef, footerRef, navRef, layout, centerOffset } =
        useStageLayout()
    const reelRef = useRef(null)
    const spinTokenRef = useRef(0)
    const focusedIndexRef = useRef(focusedIndex)
    const itemsLenRef = useRef(items.length)
    const { footerH } = layout

    useEffect(() => {
        focusedIndexRef.current = focusedIndex
    }, [focusedIndex])

    useEffect(() => {
        itemsLenRef.current = items.length
    }, [items.length])

    const winner = items[focusedIndex]

    useEffect(() => {
        if (isOpen) preloadRewardImages()
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            spinTokenRef.current += 1
            resetItems()
            setFocusedIndex(IDLE_INDEX)
            setPhase(PHASE.IDLE)
            setSpeedUps(0)
            reelRef.current?.snapTo(IDLE_INDEX)
        }
    }, [isOpen, resetItems])

    useEffect(() => {
        if (!isOpen || phase !== PHASE.IDLE) return undefined
        const id = setInterval(() => {
            const next = focusedIndexRef.current + 1
            // Once the reel hits REEL_HARD_CAP, growForIdle can no longer
            // extend the strip. Freeze the nudge so focusedIndex can't drift
            // past items.length — otherwise growForSpin's slice clips and
            // the post-spin items[targetIdx] read returns undefined.
            const len = itemsLenRef.current
            if (len >= REEL_HARD_CAP && next + SPIN_TURNS >= len) return
            growForIdle(next)
            reelRef.current?.advanceTo(next)
            setFocusedIndex(next)
        }, IDLE_NUDGE_INTERVAL_MS)
        return () => clearInterval(id)
    }, [isOpen, phase, growForIdle])

    const startSpin = useCallback(async () => {
        const token = ++spinTokenRef.current
        const targetIdx = focusedIndex + SPIN_TURNS
        growForSpin(focusedIndex)
        setPoints((p) => Math.max(0, p - SPIN_COST))
        setSpeedUps(0)
        setPhase(PHASE.SPINNING)
        WebApp.HapticFeedback?.impactOccurred?.("medium")
        await new Promise((r) => requestAnimationFrame(r))
        await reelRef.current?.spinTo({
            targetIndex: targetIdx,
            duration: SPIN_DURATION_MS,
        })
        if (token !== spinTokenRef.current) return
        setFocusedIndex(targetIdx)
        setPhase(PHASE.RESULT)
        WebApp.HapticFeedback?.notificationOccurred?.("success")
    }, [focusedIndex, growForSpin])

    const speedUp = useCallback(() => {
        setSpeedUps((c) => {
            if (c >= MAX_SPEED_UPS) return c
            const next = c + 1
            if (next === MAX_SPEED_UPS) {
                reelRef.current?.cruise(CRUISE_DURATION_MS)
            } else {
                reelRef.current?.accelerate(SPEED_UP_FACTOR)
            }
            WebApp.HapticFeedback?.selectionChanged?.()
            return next
        })
    }, [])

    const canSpeedUp = phase === PHASE.SPINNING && speedUps < MAX_SPEED_UPS

    const rootStyle = useMemo(
        () => ({
            "--footer-height": `${footerH}px`,
            "--coin-center-y": `${centerOffset + SLOT_HEIGHT / 2}px`,
        }),
        [footerH, centerOffset]
    )

    return (
        <ModalView isOpen={isOpen} onClose={onClose}>
            <div className={styles.root} style={rootStyle} data-phase={phase}>
                <div className={styles.fadeTop} aria-hidden="true" />
                <div className={styles.fadeBottom} aria-hidden="true" />
                <div ref={navRef} className={styles.nav}>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                    <div
                        className={styles.points}
                        aria-label={`${points} points`}
                    >
                        <span className={styles.gem} aria-hidden="true" />
                        <Text
                            apple={{ variant: "body", weight: "semibold" }}
                            material={{ variant: "body", weight: "medium" }}
                        >
                            <Calligraph variant="number" animation="smooth">
                                {points}
                            </Calligraph>
                        </Text>
                    </div>
                </div>

                <div ref={stageRef} className={styles.stage}>
                    <SpinReel
                        ref={reelRef}
                        items={items}
                        idleIndex={IDLE_INDEX}
                        focusedIndex={focusedIndex}
                        phase={phase}
                        centerOffset={centerOffset}
                    />
                    <AnimatePresence>
                        {phase === PHASE.RESULT && (
                            <m.div
                                key="stars"
                                className={styles.starsLayer}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                        duration: 0.45,
                                        ease: [0.23, 1, 0.32, 1],
                                    },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.2 },
                                }}
                            >
                                <Stars />
                            </m.div>
                        )}
                    </AnimatePresence>
                </div>

                <Footer
                    ref={footerRef}
                    phase={phase}
                    winner={winner}
                    points={points}
                    canSpeedUp={canSpeedUp}
                    onSpin={startSpin}
                    onSpeedUp={speedUp}
                />
            </div>
        </ModalView>
    )
}

WheelModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default WheelModal
