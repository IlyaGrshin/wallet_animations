import { useEffect, useRef, useState } from "react"

import WebApp, { haptic } from "../../lib/twa"
import { useLongPress } from "../../hooks/useLongPress"
import { startAutoScroll } from "./autoScroll"

const blockScroll = (event) => {
    if (event.cancelable) event.preventDefault()
}

export const useReorderLift = ({ controls, groupRef, longPress, onLift }) => {
    const [lifted, setLifted] = useState(false)
    const downRef = useRef(null)
    const releaseRef = useRef(null)
    const dragStartRef = useRef(null)

    const lift = (event) => {
        if (releaseRef.current) return
        haptic.impact("medium")
        setLifted(true)

        const { pointerId } = event
        const swipesWereEnabled = WebApp.isVerticalSwipesEnabled
        if (swipesWereEnabled) WebApp.disableVerticalSwipes?.()
        let stopAutoScroll = null

        dragStartRef.current = (dragEvent) => {
            stopAutoScroll ??= startAutoScroll(
                groupRef.current,
                dragEvent.clientY,
                pointerId
            )
        }

        const drop = (endEvent) => {
            if (endEvent.pointerId !== pointerId) return
            releaseRef.current?.()
            haptic.impact("light")
        }

        document.addEventListener("touchmove", blockScroll, { passive: false })
        window.addEventListener("pointerup", drop, true)
        window.addEventListener("pointercancel", drop, true)

        releaseRef.current = () => {
            releaseRef.current = null
            dragStartRef.current = null
            setLifted(false)
            stopAutoScroll?.()
            document.removeEventListener("touchmove", blockScroll)
            window.removeEventListener("pointerup", drop, true)
            window.removeEventListener("pointercancel", drop, true)
            if (swipesWereEnabled) WebApp.enableVerticalSwipes?.()
        }

        controls.start(event)
        onLift()
    }

    useEffect(() => () => releaseRef.current?.(), [])

    const press = useLongPress({
        disabled: !longPress,
        onLongPress: (_, source) => {
            if (source === "hold" && downRef.current) lift(downRef.current)
        },
    })

    const rowHandlers = longPress
        ? {
              ...press,
              onPointerDown: (event) => {
                  downRef.current = event.nativeEvent
                  press.onPointerDown(event)
              },
              onPointerUp: (event) => {
                  downRef.current = null
                  press.onPointerUp(event)
              },
              onPointerCancel: (event) => {
                  downRef.current = null
                  press.onPointerCancel(event)
              },
              onContextMenu: (event) => {
                  const pointerType = downRef.current?.pointerType
                  if (!pointerType || pointerType === "mouse") return
                  press.onContextMenu(event)
              },
          }
        : {}

    const onDragStart = (event) => dragStartRef.current?.(event)

    return { lifted, lift, onDragStart, rowHandlers }
}
