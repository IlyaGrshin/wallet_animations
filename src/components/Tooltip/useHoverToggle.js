import { useCallback, useEffect, useRef } from "react"

const OPEN_DELAY = 80
const CLOSE_DELAY = 120

export const useHoverToggle = ({ onOpen, onClose }) => {
    const openTimerRef = useRef(null)
    const closeTimerRef = useRef(null)

    const clearOpenTimer = useCallback(() => {
        if (openTimerRef.current) {
            clearTimeout(openTimerRef.current)
            openTimerRef.current = null
        }
    }, [])

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current)
            closeTimerRef.current = null
        }
    }, [])

    useEffect(
        () => () => {
            clearOpenTimer()
            clearCloseTimer()
        },
        [clearOpenTimer, clearCloseTimer]
    )

    const scheduleOpen = useCallback(() => {
        clearCloseTimer()
        if (openTimerRef.current) return
        openTimerRef.current = setTimeout(() => {
            openTimerRef.current = null
            onOpen()
        }, OPEN_DELAY)
    }, [clearCloseTimer, onOpen])

    const scheduleClose = useCallback(() => {
        clearOpenTimer()
        if (closeTimerRef.current) return
        closeTimerRef.current = setTimeout(() => {
            closeTimerRef.current = null
            onClose()
        }, CLOSE_DELAY)
    }, [clearOpenTimer, onClose])

    const onPointerEnter = useCallback(
        (e) => {
            if (e.pointerType === "touch") return
            scheduleOpen()
        },
        [scheduleOpen]
    )

    const onPointerLeave = useCallback(
        (e) => {
            if (e.pointerType === "touch") return
            scheduleClose()
        },
        [scheduleClose]
    )

    return { onPointerEnter, onPointerLeave, clearOpenTimer, clearCloseTimer }
}
