import { clamp } from "../../utils/number"
import WebApp, { isTelegram } from "../../lib/twa"

const MAX_DEG = 45
const MAX_RAD = (MAX_DEG * Math.PI) / 180

export const TILT_SMOOTH = 0.15
export const TILT_IDLE_EPSILON = 5e-4

// A -1..1 tilt target shared by the flat and the WebGL card. `live` marks the
// Telegram path, where gamma/beta have to be polled every frame; the web path
// pushes updates and calls `onChange` so a parked loop can re-arm.
export function startTiltSource(onChange) {
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
