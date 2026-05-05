import { useEffect } from "react"
import { clamp } from "../../utils/number"

const SMOOTH = 0.15
const MAX_DEG = 45
const MAX_RAD = (MAX_DEG * Math.PI) / 180

export default function useDeviceTilt(targetRef) {
    useEffect(() => {
        if (typeof window === "undefined") return
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
            return

        const target = { x: 0, y: 0 }
        const current = { x: 0, y: 0 }
        let raf = 0
        let lastX = ""
        let lastY = ""

        const tg = window.Telegram?.WebApp
        const tgOrient = tg?.DeviceOrientation
        const useTg = !!(tgOrient && typeof tgOrient.start === "function")

        const tick = () => {
            if (useTg) {
                target.x = clamp((tgOrient.gamma || 0) / MAX_RAD, -1, 1)
                target.y = clamp((tgOrient.beta || 0) / MAX_RAD, -1, 1)
            }
            current.x += (target.x - current.x) * SMOOTH
            current.y += (target.y - current.y) * SMOOTH
            const xStr = current.x.toFixed(3)
            const yStr = current.y.toFixed(3)
            const el = targetRef.current
            if (el && (xStr !== lastX || yStr !== lastY)) {
                el.style.setProperty("--tilt-x", xStr)
                el.style.setProperty("--tilt-y", yStr)
                lastX = xStr
                lastY = yStr
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        let cleanup = () => {}
        if (!useTg) cleanup = subscribeWeb(target)

        return () => {
            cancelAnimationFrame(raf)
            cleanup()
        }
    }, [targetRef])
}

function subscribeWeb(target) {
    if (typeof window.DeviceOrientationEvent === "undefined") return () => {}

    const onOrientation = (e) => {
        target.x = clamp((e.gamma ?? 0) / MAX_DEG, -1, 1)
        target.y = clamp((e.beta ?? 0) / MAX_DEG, -1, 1)
    }
    const subscribe = () => {
        window.addEventListener("deviceorientation", onOrientation)
    }
    const unsubscribe = () => {
        window.removeEventListener("deviceorientation", onOrientation)
    }

    const reqPerm = window.DeviceOrientationEvent.requestPermission
    if (typeof reqPerm === "function") {
        const grant = async () => {
            try {
                const r = await reqPerm()
                if (r === "granted") subscribe()
            } catch {
                /* ignore */
            }
        }
        window.addEventListener("click", grant, { once: true })
        window.addEventListener("touchend", grant, { once: true })
        return () => {
            window.removeEventListener("click", grant)
            window.removeEventListener("touchend", grant)
            unsubscribe()
        }
    }

    subscribe()
    return unsubscribe
}
