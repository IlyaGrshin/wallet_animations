import { useEffect, useRef, useState } from "react"

// iOS fires its context menu after ~0.5s of holding still; any drift beyond
// the tolerance is a scroll or swipe and cancels the press.
const DELAY = 500
const MOVE_TOLERANCE = 10

/**
 * Long-press detection on pointer events, with right-click (contextmenu) as
 * the desktop shortcut. `pressing` is true while the hold is in progress. The
 * click that follows a fired long press is swallowed.
 */
export const useLongPress = ({ onLongPress, disabled }) => {
    const [pressing, setPressing] = useState(false)
    const timerRef = useRef()
    const startRef = useRef(null)
    const firedRef = useRef(false)

    const cancel = () => {
        clearTimeout(timerRef.current)
        startRef.current = null
        setPressing(false)
    }

    const fire = (point) => {
        cancel()
        firedRef.current = true
        onLongPress(point)
    }

    useEffect(() => () => clearTimeout(timerRef.current), [])

    return {
        pressing,
        handlers: {
            onPointerDown: (event) => {
                firedRef.current = false
                if (disabled || event.button !== 0 || !event.isPrimary) return
                const point = { x: event.clientX, y: event.clientY }
                startRef.current = point
                setPressing(true)
                timerRef.current = setTimeout(() => fire(point), DELAY)
            },
            onPointerMove: (event) => {
                const start = startRef.current
                if (!start) return
                const dx = event.clientX - start.x
                const dy = event.clientY - start.y
                if (Math.hypot(dx, dy) > MOVE_TOLERANCE) cancel()
            },
            onPointerUp: cancel,
            onPointerCancel: cancel,
            onPointerLeave: cancel,
            onContextMenu: (event) => {
                event.preventDefault()
                if (disabled || firedRef.current) return
                fire({ x: event.clientX, y: event.clientY })
            },
            onClickCapture: (event) => {
                if (!firedRef.current) return
                firedRef.current = false
                event.preventDefault()
                event.stopPropagation()
            },
        },
    }
}
