import { useEffect, useRef, useState } from "react"
import {
    animate,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react"

import WebApp from "../../lib/twa"
import { SPRING } from "../../utils/animations"
import { armThreshold, HYSTERESIS, restWidth } from "./geometry"

const FLING_VELOCITY = 400
const COMMIT_TRANSITION = { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
const INSTANT = { duration: 0 }

const haptic = (style) => {
    try {
        WebApp.HapticFeedback?.impactOccurred(style)
    } catch {
        // older clients may not support HapticFeedback
    }
}

// Drag state for a row with trailing actions: rest closed, rest open on the
// action strip, or armed for the full swipe that runs the trailing action.
export const useSwipeCell = ({ rootRef, sizeRef, count, onCommit }) => {
    const reduceMotion = useReducedMotion()
    const x = useMotionValue(0)
    const arm = useMotionValue(0)
    const revealed = useTransform(x, (v) => Math.max(0, -v))
    const [isOpen, setIsOpen] = useState(false)
    const armedRef = useRef(false)
    const draggedRef = useRef(false)
    const committingRef = useRef(false)

    const spring = reduceMotion ? INSTANT : SPRING.APPLE

    const setArmed = (next) => {
        if (armedRef.current === next) return
        armedRef.current = next
        haptic(next ? "medium" : "light")
        animate(arm, next ? 1 : 0, spring)
    }

    const settle = (open) => {
        setIsOpen(open)
        setArmed(false)
        animate(x, open ? -restWidth(count) : 0, spring)
    }

    const commit = async () => {
        if (committingRef.current) return
        committingRef.current = true
        armedRef.current = true
        const transition = reduceMotion ? INSTANT : COMMIT_TRANSITION
        animate(arm, 1, transition)
        await animate(x, -sizeRef.current.width, transition)
        const keep = await onCommit()
        committingRef.current = false
        if (keep) settle(false)
    }

    const onDragStart = () => {
        draggedRef.current = true
    }

    const onDrag = () => {
        const threshold = armThreshold(count, sizeRef.current.width)
        const pulled = revealed.get()
        if (!armedRef.current && pulled > threshold) setArmed(true)
        else if (armedRef.current && pulled < threshold - HYSTERESIS)
            setArmed(false)
    }

    const onDragEnd = (_, { velocity }) => {
        if (armedRef.current) {
            commit()
            return
        }
        const pulled = revealed.get()
        const open =
            velocity.x < -FLING_VELOCITY ||
            (velocity.x < FLING_VELOCITY && pulled > restWidth(count) / 2)
        settle(open)
    }

    // A drag or a tap on the open row's content only closes it — it must not
    // reach the cell's own onClick.
    const onPointerDownCapture = () => {
        draggedRef.current = false
    }
    const onClickCapture = (event) => {
        if (!draggedRef.current && !isOpen) return
        event.preventDefault()
        event.stopPropagation()
        if (isOpen) settle(false)
    }

    useEffect(() => {
        if (!isOpen) return
        const onPointerDown = (event) => {
            if (!rootRef.current?.contains(event.target)) settle(false)
        }
        document.addEventListener("pointerdown", onPointerDown)
        return () => document.removeEventListener("pointerdown", onPointerDown)
    }, [isOpen])

    return {
        x,
        arm,
        revealed,
        commit,
        close: () => settle(false),
        contentHandlers: {
            onDragStart,
            onDrag,
            onDragEnd,
            onPointerDownCapture,
            onClickCapture,
        },
    }
}
