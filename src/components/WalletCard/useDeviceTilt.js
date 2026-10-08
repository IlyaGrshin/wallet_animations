import { useEffect } from "react"

import { clamp } from "../../utils/number"
import WebApp, { isTelegram } from "../../lib/twa"
import { acquireDeviceOrientation } from "./deviceOrientation"

// A slightly underdamped spring (omega 16rad/s, zeta ~0.72) instead of a
// plain lerp: a fast pointer sweep or the return-to-rest overshoots by ~4%,
// which reads as the card having a little mass.
const STIFFNESS = 256
const DAMPING = 23
const MAX_DT = 0.032
const IDLE_EPSILON = 5e-4
const VEL_EPSILON = 5e-3
const MAX_DEG = 45
const MAX_RAD = (MAX_DEG * Math.PI) / 180
const NEUTRAL_FOLLOW = 0.01

// A -1..1 tilt target. `live` marks the Telegram path, where gamma/beta have to
// be polled every frame; the web path pushes updates and calls `onChange` so a
// parked loop can re-arm.
function startTiltSource(onChange) {
    const target = { x: 0, y: 0 }
    const orientation = WebApp?.DeviceOrientation
    const live =
        isTelegram() && !!orientation && typeof orientation.start === "function"

    if (live) {
        let neutralBeta = null
        const source = {
            target,
            live,
            poll: () => {
                const beta = orientation.beta
                target.x = clamp((orientation.gamma || 0) / MAX_RAD, -1, 1)
                if (typeof beta !== "number") return
                if (neutralBeta === null) neutralBeta = beta
                neutralBeta += (beta - neutralBeta) * NEUTRAL_FOLLOW
                target.y = clamp((beta - neutralBeta) / MAX_RAD, -1, 1)
            },
        }
        source.stop = acquireDeviceOrientation(orientation, () => {
            source.live = false
            target.x = 0
            target.y = 0
            onChange?.()
        })
        return source
    }

    const onPointerMove = (event) => {
        const width = window.innerWidth || 1
        const height = window.innerHeight || 1
        target.x = clamp((event.clientX / width - 0.5) * 2, -1, 1)
        target.y = clamp((event.clientY / height - 0.5) * 2, -1, 1)
        onChange?.()
    }

    const onPointerLeave = () => {
        target.x = 0
        target.y = 0
        onChange?.()
    }

    const root = document.documentElement
    window.addEventListener("pointermove", onPointerMove)
    root.addEventListener("pointerleave", onPointerLeave)
    return {
        target,
        live,
        poll: () => {},
        stop: () => {
            window.removeEventListener("pointermove", onPointerMove)
            root.removeEventListener("pointerleave", onPointerLeave)
        },
    }
}

// Writes the eased -1..1 tilt onto `targetRef` as --tilt-x/--tilt-y. Pass
// null to opt out (the element then inherits an ancestor's tilt vars). `damp`
// is an optional 0..1 MotionValue multiplied into the written values, so a
// page can flatten the card as it flies away.
export default function useDeviceTilt(targetRef, damp) {
    useEffect(() => {
        if (!targetRef) return undefined
        if (typeof window === "undefined") return undefined
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
            return undefined

        const current = { x: 0, y: 0 }
        const velocity = { x: 0, y: 0 }
        let raf = 0
        let lastTime = 0
        let lastX = ""
        let lastY = ""

        const ensureLoop = () => {
            if (!raf) raf = requestAnimationFrame(tick)
        }
        const source = startTiltSource(ensureLoop)
        const unsubscribeDamp = damp?.on("change", ensureLoop)

        function tick(now) {
            const dt = Math.min((now - (lastTime || now)) / 1000, MAX_DT)
            lastTime = now
            if (source.live) source.poll()
            const dx = source.target.x - current.x
            const dy = source.target.y - current.y
            velocity.x += (STIFFNESS * dx - DAMPING * velocity.x) * dt
            velocity.y += (STIFFNESS * dy - DAMPING * velocity.y) * dt
            current.x += velocity.x * dt
            current.y += velocity.y * dt
            const el = targetRef.current
            if (el) {
                const k = damp ? damp.get() : 1
                const xStr = (current.x * k).toFixed(3)
                const yStr = (current.y * k).toFixed(3)
                if (xStr !== lastX || yStr !== lastY) {
                    el.style.setProperty("--tilt-x", xStr)
                    el.style.setProperty("--tilt-y", yStr)
                    lastX = xStr
                    lastY = yStr
                }
            }
            // Web mode: park rAF once settled on target. Re-armed by
            // pointermove and by damp changes.
            if (
                !source.live &&
                Math.abs(dx) < IDLE_EPSILON &&
                Math.abs(dy) < IDLE_EPSILON &&
                Math.abs(velocity.x) < VEL_EPSILON &&
                Math.abs(velocity.y) < VEL_EPSILON
            ) {
                raf = 0
                lastTime = 0
                return
            }
            raf = requestAnimationFrame(tick)
        }

        ensureLoop()

        return () => {
            cancelAnimationFrame(raf)
            unsubscribeDamp?.()
            source.stop()
        }
    }, [targetRef, damp])
}
