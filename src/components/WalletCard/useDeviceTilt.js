import { useEffect } from "react"

import { clamp } from "../../utils/number"
import WebApp, { isTelegram } from "../../lib/twa"

const SMOOTH = 0.15
const IDLE_EPSILON = 5e-4
const MAX_DEG = 45
const MAX_RAD = (MAX_DEG * Math.PI) / 180

// A -1..1 tilt target. `live` marks the Telegram path, where gamma/beta have to
// be polled every frame; the web path pushes updates and calls `onChange` so a
// parked loop can re-arm.
function startTiltSource(onChange) {
    const target = { x: 0, y: 0 }
    const orientation = WebApp?.DeviceOrientation
    const live =
        isTelegram() && !!orientation && typeof orientation.start === "function"

    if (live) {
        return {
            target,
            live,
            poll: () => {
                target.x = clamp((orientation.gamma || 0) / MAX_RAD, -1, 1)
                target.y = clamp((orientation.beta || 0) / MAX_RAD, -1, 1)
            },
            stop: () => {},
        }
    }

    const onPointerMove = (event) => {
        const width = window.innerWidth || 1
        const height = window.innerHeight || 1
        target.x = clamp((event.clientX / width - 0.5) * 2, -1, 1)
        target.y = clamp((event.clientY / height - 0.5) * 2, -1, 1)
        onChange?.()
    }

    window.addEventListener("pointermove", onPointerMove)
    return {
        target,
        live,
        poll: () => {},
        stop: () => window.removeEventListener("pointermove", onPointerMove),
    }
}

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
            current.x += dx * SMOOTH
            current.y += dy * SMOOTH
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
                Math.abs(dx) < IDLE_EPSILON &&
                Math.abs(dy) < IDLE_EPSILON
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
