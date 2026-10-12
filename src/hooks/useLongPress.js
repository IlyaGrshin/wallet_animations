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
    const stopExpiryRef = useRef(null)

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

    // The release after a hold yields one click, and it may land elsewhere
    // (an overlay that consumes it) and never reach onClickCapture below.
    // Drop the marker once that click has been dispatched, wherever it went,
    // or right away if the touch is cancelled and no click comes.
    const expireAfterRelease = () => {
        stopExpiryRef.current?.()
        const onClick = () => {
            stop()
            setTimeout(() => {
                firedRef.current = false
            })
        }
        const onCancel = () => {
            stop()
            firedRef.current = false
        }
        const stop = () => {
            window.removeEventListener("click", onClick, true)
            window.removeEventListener("pointercancel", onCancel, true)
            stopExpiryRef.current = null
        }
        window.addEventListener("click", onClick, true)
        window.addEventListener("pointercancel", onCancel, true)
        stopExpiryRef.current = stop
    }

    // `source` tells a held finger ("hold", still down) from a one-shot
    // right-click or Menu key ("contextmenu").
    const fire = (point, source) => {
        clearTimers()
        pressedRef.current = false
        // Only a held press is followed by a click to swallow; a right-click
        // emits none, and a stale marker would eat the next keyboard click.
        firedRef.current = source === "hold"
        if (firedRef.current) expireAfterRelease()
        onLongPress(point, source)
    }

    useEffect(
        () => () => {
            clearTimers()
            stopExpiryRef.current?.()
        },
        []
    )

    // Turning disabled mid-hold cancels the gesture: the pending timers hold
    // the old callbacks and would still fire.
    useEffect(() => {
        if (disabled) cancel()
    }, [disabled])

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
            fireTimerRef.current = setTimeout(() => fire(point, "hold"), DELAY)
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
            fire({ x: event.clientX, y: event.clientY }, "contextmenu")
        },
        onClickCapture: (event) => {
            if (!firedRef.current) return
            firedRef.current = false
            event.preventDefault()
            event.stopPropagation()
        },
    }
}
