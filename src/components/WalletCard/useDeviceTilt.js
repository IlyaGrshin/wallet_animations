import { useEffect } from "react"

import {
    TILT_IDLE_EPSILON,
    TILT_SMOOTH,
    startTiltSource,
} from "./tiltSource"

export default function useDeviceTilt(targetRef) {
    useEffect(() => {
        if (typeof window === "undefined") return undefined
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
            return undefined

        const current = { x: 0, y: 0 }
        let raf = 0
        let lastX = ""
        let lastY = ""

        const ensureLoop = () => {
            if (!raf) raf = requestAnimationFrame(tick)
        }
        const source = startTiltSource(ensureLoop)

        function tick() {
            source.poll()
            const dx = source.target.x - current.x
            const dy = source.target.y - current.y
            current.x += dx * TILT_SMOOTH
            current.y += dy * TILT_SMOOTH
            const el = targetRef.current
            if (el) {
                const xStr = current.x.toFixed(3)
                const yStr = current.y.toFixed(3)
                if (xStr !== lastX || yStr !== lastY) {
                    el.style.setProperty("--tilt-x", xStr)
                    el.style.setProperty("--tilt-y", yStr)
                    lastX = xStr
                    lastY = yStr
                }
            }
            // Web mode: park rAF once eased to target. Re-armed by pointermove.
            if (
                !source.live &&
                Math.abs(dx) < TILT_IDLE_EPSILON &&
                Math.abs(dy) < TILT_IDLE_EPSILON
            ) {
                raf = 0
                return
            }
            raf = requestAnimationFrame(tick)
        }

        ensureLoop()

        return () => {
            cancelAnimationFrame(raf)
            source.stop()
        }
    }, [targetRef])
}
