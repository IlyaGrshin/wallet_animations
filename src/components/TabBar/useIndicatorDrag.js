import { useEffect, useRef, useState } from "react"

import { clamp } from "../../utils/number"

export function useIndicatorDrag({
    tabsLength,
    activeIndex,
    onSnapToSame,
    onSnapToNew,
    spring,
}) {
    const overlayRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragLeftPercent, setDragLeftPercent] = useState(null)
    const [pressedIndex, setPressedIndex] = useState(null)
    const activePointerIdRef = useRef(null)
    const isPointerDownRef = useRef(false)
    const pointerDownIdRef = useRef(null)
    const startXRef = useRef(0)
    const DRAG_THRESHOLD_PX = 6

    const segmentPercent = 100 / tabsLength

    const indicatorWidth = `calc(${segmentPercent}% + 7.33px - 4px)`
    const indicatorIndex = pressedIndex ?? activeIndex
    const indicatorLeft = `calc(${segmentPercent * indicatorIndex}% - ${3.67 * indicatorIndex}px)`

    const clipLeft = indicatorLeft
    const clipRight = `calc(100% - (${indicatorLeft} + ${indicatorWidth}) - 2.33px * ${indicatorIndex})`

    const animateClipPath =
        isDragging && dragLeftPercent != null
            ? `inset(0 ${100 - (dragLeftPercent + segmentPercent)}% 0 ${dragLeftPercent}% round 100px)`
            : `inset(0 ${clipRight} 0 ${clipLeft} round 100px)`

    const transition = isDragging
        ? { clipPath: { duration: 0 } }
        : { clipPath: spring }

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
        const left = clamp(
            centerPercent - segmentPercent / 2,
            0,
            100 - segmentPercent
        )
        setDragLeftPercent(left)
    }

    const onPointerDown = (e) => {
        if (isPointerDownRef.current || e.button !== 0) return
        isPointerDownRef.current = true
        pointerDownIdRef.current = e.pointerId
        startXRef.current = e.clientX
        setPressedIndex(indexFromClientX(e.clientX))
        // Не начинаем drag сразу — ждём порога движения
    }

    const onPointerMove = (e) => {
        // Игнорируем чужие указатели
        if (
            pointerDownIdRef.current != null &&
            e.pointerId !== pointerDownIdRef.current
        )
            return

        if (!isDragging) {
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
                setIsDragging(true)
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
        let nextIndex = indexFromClientX(clientX) ?? activeIndex
        if (typeof clientX !== "number" && dragLeftPercent != null) {
            const seg = 100 / tabsLength
            nextIndex = clamp(
                Math.round(dragLeftPercent / seg),
                0,
                tabsLength - 1
            )
        }

        commitIndex(nextIndex)
        resetDrag()
    }

    const resetDrag = () => {
        setIsDragging(false)
        setDragLeftPercent(null)
        setPressedIndex(null)
        activePointerIdRef.current = null
    }

    const isForeignPointer = (e) =>
        pointerDownIdRef.current != null &&
        e.pointerId !== pointerDownIdRef.current

    const onPointerUp = (e) => {
        if (isForeignPointer(e)) return
        // Сброс состояния pointerdown
        isPointerDownRef.current = false
        pointerDownIdRef.current = null

        if (!isDragging) {
            if (pressedIndex != null) commitIndex(pressedIndex)
            setPressedIndex(null)
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
        if (isForeignPointer(e)) return
        isPointerDownRef.current = false
        pointerDownIdRef.current = null
        resetDrag()
    }

    useEffect(() => {
        const cancel = () => {
            resetDrag()
            isPointerDownRef.current = false
            pointerDownIdRef.current = null
        }
        window.addEventListener("blur", cancel)
        return () => window.removeEventListener("blur", cancel)
    }, [])

    return {
        overlayRef,
        isDragging,
        animate: { clipPath: animateClipPath },
        transition,
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
