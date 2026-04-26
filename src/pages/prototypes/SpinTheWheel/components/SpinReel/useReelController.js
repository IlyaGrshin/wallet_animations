import { useEffect, useMemo, useRef } from "react"
import { animate, useReducedMotion } from "motion/react"

import { targetYFor } from "./geometry"
import { pickCruiseProfile } from "./cruiseProfiles"
import runSegments from "./runSegments"

const SPIN_EASE = [0.42, 0, 0.58, 1]
const ACCEL_EASE = [0, 0, 0.3, 1]
const ADVANCE_SPRING = { type: "spring", stiffness: 220, damping: 22 }
const MIN_DURATION_MS = 180

// Императивный контроллер барабана. Хранит активный handle (от
// motion.animate или от runSegments) и время старта текущего tween-а
// (нужно для accelerate). centerOffset хранится в ref внутри хука и
// синхронизируется с пропом, чтобы targetY всегда видел свежее значение
// без stale-closure.
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
        // Если ничего не анимируется — подвинем барабан под новый
        // centerOffset, иначе контроль над позицией пусть остаётся за
        // активным tween-ом (иначе resize посреди спина дёргал бы ленту).
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
