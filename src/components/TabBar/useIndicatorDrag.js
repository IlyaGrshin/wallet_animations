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
    const activePointerIdRef = useRef(null)
    const isPointerDownRef = useRef(false)
    const pointerDownIdRef = useRef(null)
    const startXRef = useRef(0)

    const segmentPercent = 100 / tabsLength

    const indicatorWidth = `calc(${segmentPercent}% + 7.33px - 4px)`
    const indicatorLeft = `calc(${segmentPercent * activeIndex}% - ${3.67 * activeIndex}px)`

    const clipLeft = indicatorLeft
    const clipRight = `calc(100% - (${indicatorLeft} + ${indicatorWidth}) - 2.33px * ${activeIndex})`
    const settledClipPath = `inset(0 ${clipRight} 0 ${clipLeft} round 100px)`

    const settle = () => {
        if (!overlayRef.current) return
        animate(overlayRef.current, { clipPath: settledClipPath }, SPRING)
    }

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
        activePointerIdRef.current = null
    }

    const onPointerDown = (e) => {
        isPointerDownRef.current = true
        pointerDownIdRef.current = e.pointerId
        startXRef.current = e.clientX
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
        const el = overlayRef.current
        const dragLeftPercent = dragLeftPercentRef.current
        let nextIndex = activeIndex
        if (el && typeof clientX === "number") {
            const rect = el.getBoundingClientRect()
            const xRel = clientX - rect.left
            const width = rect.width
            if (width > 0) {
                const segWidth = width / tabsLength
                nextIndex = clamp(
                    Math.round(xRel / segWidth - 0.5),
                    0,
                    tabsLength - 1
                )
            }
        } else if (dragLeftPercent != null) {
            const seg = 100 / tabsLength
            nextIndex = clamp(
                Math.round(dragLeftPercent / seg),
                0,
                tabsLength - 1
            )
        }

        resetDrag()

        if (nextIndex === activeIndex) {
            // The target did not change, so no effect will move the clip back.
            settle()
            onSnapToSame?.()
        } else {
            onSnapToNew?.(nextIndex)
        }
    }

    const onPointerUp = (e) => {
        // Сброс состояния pointerdown
        isPointerDownRef.current = false
        pointerDownIdRef.current = null

        if (!isDraggingRef.current) {
            // Это был тап — позволяем сгенерировать click
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

    const onPointerCancel = (e) => {
        isPointerDownRef.current = false
        pointerDownIdRef.current = null
        if (!isDraggingRef.current) return
        finishDrag(e?.clientX)
        e.preventDefault?.()
    }

    const onPointerLeave = (e) => {
        if (!isDraggingRef.current) return
        finishDrag(e?.clientX)
    }

    useEffect(() => {
        const cancel = () => {
            const wasDragging = isDraggingRef.current
            resetDrag()
            isPointerDownRef.current = false
            pointerDownIdRef.current = null
            if (wasDragging) settle()
        }
        window.addEventListener("blur", cancel)
        return () => window.removeEventListener("blur", cancel)
    })

    return {
        overlayRef,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
            onPointerLeave,
        },
    }
}

export default useIndicatorDrag
