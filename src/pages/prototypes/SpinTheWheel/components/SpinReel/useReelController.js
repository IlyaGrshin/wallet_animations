import { useEffect, useMemo, useRef } from "react"
import { animate, useReducedMotion } from "motion/react"

import { targetYFor } from "./geometry"
import { pickCruiseProfile } from "./cruiseProfiles"
import runSegments from "./runSegments"

const SPIN_EASE = [0.42, 0, 0.58, 1]
const ACCEL_EASE = [0, 0, 0.3, 1]
const ADVANCE_SPRING = { type: "spring", stiffness: 220, damping: 22 }
const MIN_DURATION_MS = 180

// Imperative reel controller. Holds the active handle (from motion.animate
// or runSegments) and the start timestamp of the current tween (needed by
// accelerate). centerOffset lives in a hook-local ref synced from the
// prop, so targetY always reads the fresh value without stale-closure.
export default function useReelController({ y, idleIndex, centerOffset }) {
    const reduceMotion = useReducedMotion()
    const centerOffsetRef = useRef(centerOffset)
    const targetIndexRef = useRef(idleIndex)
    const controlsRef = useRef(null)
    const finishResolveRef = useRef(null)
    const startedAtRef = useRef(0)
    const durationRef = useRef(0)

    useEffect(() => {
        centerOffsetRef.current = centerOffset
        // If nothing is animating, slide the reel under the new
        // centerOffset; otherwise let the active tween keep authority over
        // y (a resize mid-spin would otherwise jerk the strip).
        if (!controlsRef.current) {
            y.set(targetYFor(targetIndexRef.current, centerOffset))
        }
    }, [centerOffset, y])

    return useMemo(() => {
        const settle = () => {
            const resolve = finishResolveRef.current
            finishResolveRef.current = null
            controlsRef.current = null
            resolve?.()
        }
        const targetY = (index) => targetYFor(index, centerOffsetRef.current)
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
                const target = targetY(targetIndexRef.current)
                const dist = target - y.get()
                if (Math.abs(dist) < 0.5) return
                const segments = pickCruiseProfile({
                    direction: Math.sign(dist) || 1,
                })
                controlsRef.current?.stop()
                controlsRef.current = runSegments({
                    y,
                    segments,
                    target,
                    totalMs: durationMs,
                    onDone: settle,
                    reduceMotion,
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
}
