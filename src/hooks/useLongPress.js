import { useEffect, useRef } from "react"

// A plain tap is over well before PRESS_DELAY, so nothing about the row
// changes for it. Past that the hold is intentional and the row starts to
// grow; at DELAY (iOS ~0.5s) the menu fires. Any drift beyond the tolerance
// is a scroll or swipe and cancels.
export const PRESS_DELAY = 150
export const DELAY = 500
const MOVE_TOLERANCE = 10

/**
 * Long-press detection for any element: spread the returned handlers on it.
 * Right-click (contextmenu) is the desktop shortcut. `onPressStart` marks an
 * intentional hold, `onCancel` its abandonment, `onLongPress` the activation.
 * A plain tap passes through untouched; the click that follows an activation
 * is swallowed, so the element's own onClick does not fire for it.
 * @example
 * const longPress = useLongPress({ onLongPress: () => setEditing(true) })
 * <RegularButton {...longPress} label="Hold me" onClick={send} />
 */
export const useLongPress = ({
    onPressStart,
    onCancel,
    onLongPress,
    disabled,
}) => {
    const pressTimerRef = useRef()
    const fireTimerRef = useRef()
    const startRef = useRef(null)
    const pressedRef = useRef(false)
    const firedRef = useRef(false)

    const clearTimers = () => {
        clearTimeout(pressTimerRef.current)
        clearTimeout(fireTimerRef.current)
        startRef.current = null
    }

    const cancel = () => {
        clearTimers()
        if (!pressedRef.current) return
        pressedRef.current = false
        onCancel?.()
    }

    const fire = (point) => {
        clearTimers()
        pressedRef.current = false
        firedRef.current = true
        onLongPress(point)
    }

    useEffect(() => clearTimers, [])

    return {
        onPointerDown: (event) => {
            firedRef.current = false
            if (disabled || event.button !== 0 || !event.isPrimary) return
            const point = { x: event.clientX, y: event.clientY }
            startRef.current = point
            pressTimerRef.current = setTimeout(() => {
                pressedRef.current = true
                onPressStart?.(point)
            }, PRESS_DELAY)
            fireTimerRef.current = setTimeout(() => fire(point), DELAY)
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
    }
}
