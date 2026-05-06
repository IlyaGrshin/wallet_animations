import { useEffect } from "react"
import { clamp } from "../../utils/number"
import WebApp, { isTelegram } from "../../lib/twa"

const SMOOTH = 0.15
const MAX_DEG = 45
const MAX_RAD = (MAX_DEG * Math.PI) / 180
const IDLE_EPSILON = 5e-4

export default function useDeviceTilt(targetRef) {
    useEffect(() => {
        if (typeof window === "undefined") return undefined
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
            return undefined

        const target = { x: 0, y: 0 }
        const current = { x: 0, y: 0 }
        let raf = 0
        let lastX = ""
        let lastY = ""

        const tgOrient = WebApp?.DeviceOrientation
        const useTg =
            isTelegram() &&
            !!tgOrient &&
            typeof tgOrient.start === "function"

        const tick = () => {
            if (useTg) {
                target.x = clamp((tgOrient.gamma || 0) / MAX_RAD, -1, 1)
                target.y = clamp((tgOrient.beta || 0) / MAX_RAD, -1, 1)
            }
            const dx = target.x - current.x
            const dy = target.y - current.y
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
            if (!useTg && Math.abs(dx) < IDLE_EPSILON && Math.abs(dy) < IDLE_EPSILON) {
                raf = 0
                return
            }
            raf = requestAnimationFrame(tick)
        }
        const ensureLoop = () => {
            if (!raf) raf = requestAnimationFrame(tick)
        }
        ensureLoop()

        let cleanup = () => {}
        if (!useTg) cleanup = subscribeWeb(target, ensureLoop)

        return () => {
            cancelAnimationFrame(raf)
            cleanup()
        }
    }, [targetRef])
}

function subscribeWeb(target, onChange) {
    const onMouse = (e) => {
        const w = window.innerWidth || 1
        const h = window.innerHeight || 1
        target.x = clamp((e.clientX / w - 0.5) * 2, -1, 1)
        target.y = clamp((e.clientY / h - 0.5) * 2, -1, 1)
        onChange()
    }
    window.addEventListener("pointermove", onMouse)
    return () => {
        window.removeEventListener("pointermove", onMouse)
    }
}
