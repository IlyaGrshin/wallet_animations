import { useEffect, useRef, useState } from "react"

import WebApp, { haptic } from "../../lib/twa"
import { useLongPress } from "../../hooks/useLongPress"
import { startAutoScroll } from "./autoScroll"

const blockScroll = (event) => {
    if (event.cancelable) event.preventDefault()
}

export const useReorderLift = ({ controls, groupRef, longPress }) => {
    const [lifted, setLifted] = useState(false)
    const downRef = useRef(null)
    const releaseRef = useRef(null)

    const lift = (event) => {
        if (releaseRef.current) return
        haptic.impact("medium")
        setLifted(true)

        const swipesWereEnabled = WebApp.isVerticalSwipesEnabled
        if (swipesWereEnabled) WebApp.disableVerticalSwipes?.()
        const stopAutoScroll = startAutoScroll(groupRef.current, event.clientY)

        const drop = () => {
            releaseRef.current?.()
            haptic.impact("light")
        }

        document.addEventListener("touchmove", blockScroll, { passive: false })
        window.addEventListener("pointerup", drop)
        window.addEventListener("pointercancel", drop)

        releaseRef.current = () => {
            releaseRef.current = null
            setLifted(false)
            stopAutoScroll()
            document.removeEventListener("touchmove", blockScroll)
            window.removeEventListener("pointerup", drop)
            window.removeEventListener("pointercancel", drop)
            if (swipesWereEnabled) WebApp.enableVerticalSwipes?.()
        }

        controls.start(event)
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
              onContextMenu: (event) => {
                  if (downRef.current?.pointerType === "mouse") return
                  press.onContextMenu(event)
              },
          }
        : {}

    return { lifted, lift, rowHandlers }
}
