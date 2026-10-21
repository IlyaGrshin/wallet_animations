import { useEffect, useLayoutEffect, useRef } from "react"
import { animate } from "motion/react"

import { clamp } from "../../utils/number"

const DRAG_THRESHOLD_PX = 6
const SPRING = { type: "spring", stiffness: 800, damping: 50 }

// Drives the overlay clip-path imperatively on the overlay's own motion
// state: a drag moves it without re-rendering React, and settling runs as a
// regular (WAAPI-accelerated) spring.
export function useIndicatorDrag({
    tabsLength,
    activeIndex,
    onSnapToSame,
    onSnapToNew,
}) {
    const overlayRef = useRef(null)
    const isDraggingRef = useRef(false)
    const dragLeftPercentRef = useRef(null)
    const pressedIndexRef = useRef(null)
    const activePointerIdRef = useRef(null)
    const isPointerDownRef = useRef(false)
    const pointerDownIdRef = useRef(null)
    const startXRef = useRef(0)

    const segmentPercent = 100 / tabsLength

    const clipPathAt = (index) => {
        const indicatorWidth = `calc(${segmentPercent}% + 7.33px - 4px)`
        const indicatorLeft = `calc(${segmentPercent * index}% - ${3.67 * index}px)`
        const clipRight = `calc(100% - (${indicatorLeft} + ${indicatorWidth}) - 2.33px * ${index})`
        return `inset(0 ${clipRight} 0 ${indicatorLeft} round 100px)`
    }

    const settledClipPath = clipPathAt(activeIndex)

    const springTo = (clipPath) => {
        if (!overlayRef.current) return
        animate(overlayRef.current, { clipPath }, SPRING)
    }

    const settle = () => springTo(settledClipPath)

    const setDragClipPath = (left) => {
        dragLeftPercentRef.current = left
        animate(
            overlayRef.current,
            {
                clipPath: `inset(0 ${100 - (left + segmentPercent)}% 0 ${left}% round 100px)`,
            },
            { duration: 0 }
        )
    }

    // Spring to the active tab whenever it (or the tab count) changes.
    useLayoutEffect(() => {
        if (!overlayRef.current) return
        animate(overlayRef.current, { clipPath: settledClipPath }, SPRING)
    }, [settledClipPath])

    const indexFromClientX = (clientX) => {
        const el = overlayRef.current
        if (!el || typeof clientX !== "number") return null
        const rect = el.getBoundingClientRect()
        if (rect.width <= 0) return null
        const segWidth = rect.width / tabsLength
        return clamp(
            Math.round((clientX - rect.left) / segWidth - 0.5),
            0,
            tabsLength - 1
        )
    }

    const commitIndex = (nextIndex) => {
        if (nextIndex === activeIndex) {
            // The target did not change, so no effect will move the clip back.
            settle()
            onSnapToSame?.()
        } else {
            onSnapToNew?.(nextIndex)
        }
    }

    const updateDragFromClientX = (clientX) => {
        const el = overlayRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const xRel = clientX - rect.left
        const width = rect.width
        if (width <= 0) return
        const centerPercent = (xRel / width) * 100
        setDragClipPath(
            clamp(centerPercent - segmentPercent / 2, 0, 100 - segmentPercent)
        )
    }

    const resetDrag = () => {
        isDraggingRef.current = false
        dragLeftPercentRef.current = null
        pressedIndexRef.current = null
        activePointerIdRef.current = null
    }

    const onPointerDown = (e) => {
        if (isPointerDownRef.current || e.button !== 0) return
        isPointerDownRef.current = true
        pointerDownIdRef.current = e.pointerId
        startXRef.current = e.clientX
        const pressedIndex = indexFromClientX(e.clientX)
        pressedIndexRef.current = pressedIndex
        if (pressedIndex != null && pressedIndex !== activeIndex) {
            springTo(clipPathAt(pressedIndex))
        }
        // Не начинаем drag сразу — ждём порога движения
    }

    const onPointerMove = (e) => {
        // Игнорируем чужие указатели
        if (
            pointerDownIdRef.current != null &&
            e.pointerId !== pointerDownIdRef.current
        )
            return

        if (!isDraggingRef.current) {
            if (!isPointerDownRef.current) return
            const dx = Math.abs(e.clientX - startXRef.current)
            if (dx >= DRAG_THRESHOLD_PX) {
                // Активируем drag
                try {
                    e.currentTarget.setPointerCapture?.(e.pointerId)
                    activePointerIdRef.current = e.pointerId
                } catch {
                    // pointer capture is best-effort
                }
                isDraggingRef.current = true
                updateDragFromClientX(e.clientX)
                e.preventDefault()
            }
            return
        }

        // Активный drag
        if (
            activePointerIdRef.current != null &&
            e.pointerId !== activePointerIdRef.current
        ) {
            return
        }
        updateDragFromClientX(e.clientX)
        e.preventDefault()
    }

    const finishDrag = (clientX) => {
        // Snap to nearest tab by current pointer/drag position
        const dragLeftPercent = dragLeftPercentRef.current
        let nextIndex = indexFromClientX(clientX) ?? activeIndex
        if (typeof clientX !== "number" && dragLeftPercent != null) {
            nextIndex = clamp(
                Math.round(dragLeftPercent / segmentPercent),
                0,
                tabsLength - 1
            )
        }

        resetDrag()
        commitIndex(nextIndex)
    }

    const isForeignPointer = (e) =>
        pointerDownIdRef.current != null &&
        e.pointerId !== pointerDownIdRef.current

    const onPointerUp = (e) => {
        if (isForeignPointer(e)) return
        // Сброс состояния pointerdown
        isPointerDownRef.current = false
        pointerDownIdRef.current = null

        if (!isDraggingRef.current) {
            const pressedIndex = pressedIndexRef.current
            pressedIndexRef.current = null
            if (pressedIndex != null) commitIndex(pressedIndex)
            return
        }
        if (
            activePointerIdRef.current != null &&
            e.pointerId !== activePointerIdRef.current
        ) {
            return
        }
        try {
            e.currentTarget.releasePointerCapture?.(e.pointerId)
        } catch {
            // pointer capture is best-effort
        }
        finishDrag(e.clientX)
        e.preventDefault()
    }

    const cancelPress = () => {
        const moved = isDraggingRef.current || pressedIndexRef.current != null
        resetDrag()
        isPointerDownRef.current = false
        pointerDownIdRef.current = null
        if (moved) settle()
    }

    const onPointerCancel = (e) => {
        if (isForeignPointer(e)) return
        cancelPress()
    }

    useEffect(() => {
        window.addEventListener("blur", cancelPress)
        return () => window.removeEventListener("blur", cancelPress)
    })

    return {
        overlayRef,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
            onPointerLeave: onPointerCancel,
        },
    }
}

export default useIndicatorDrag
