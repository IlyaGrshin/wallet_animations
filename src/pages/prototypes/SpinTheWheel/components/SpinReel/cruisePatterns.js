import { animate } from "motion/react"

const ACCEL_EASE = [0, 0, 0.3, 1]
const PULL_EASE = [0.2, 0, 0.4, 1]

const rand = (min, max) => min + Math.random() * (max - min)

export function startCruise({
    durationMs,
    target,
    dist,
    y,
    startTween,
    settle,
    controlsRef,
}) {
    const direction = Math.sign(dist)
    const springTo = (config) => {
        controlsRef.current = animate(y, target, {
            type: "spring",
            ...config,
            onComplete: settle,
        })
    }
    const roll = Math.random()
    if (roll < 0.3) {
        const overshoot = target + direction * rand(70, 140)
        startTween(overshoot, durationMs * rand(0.45, 0.55), ACCEL_EASE, () => {
            startTween(target, durationMs * rand(0.22, 0.32), PULL_EASE)
        })
        return
    }
    if (roll < 0.45) {
        const overshoot = target + direction * rand(2, 10)
        startTween(overshoot, durationMs * rand(0.5, 0.7), ACCEL_EASE, () =>
            springTo({ damping: rand(22, 32), stiffness: rand(320, 440) })
        )
        return
    }
    if (roll < 0.65) {
        const undershoot = target - direction * rand(40, 90)
        const overshoot = target + direction * rand(6, 18)
        startTween(
            undershoot,
            durationMs * rand(0.45, 0.55),
            ACCEL_EASE,
            () => {
                startTween(
                    undershoot,
                    durationMs * rand(0.04, 0.08),
                    "linear",
                    () => {
                        startTween(
                            overshoot,
                            durationMs * rand(0.16, 0.24),
                            PULL_EASE,
                            () => springTo({ damping: 22, stiffness: 320 })
                        )
                    }
                )
            }
        )
        return
    }
    const overshoot = target + direction * rand(10, 50)
    startTween(overshoot, durationMs * rand(0.55, 0.7), ACCEL_EASE, () =>
        springTo({ damping: rand(14, 22), stiffness: rand(220, 360) })
    )
}
