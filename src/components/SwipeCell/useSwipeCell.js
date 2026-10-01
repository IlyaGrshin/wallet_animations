import { useEffect, useRef, useState } from "react"
import {
    animate,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react"

import { haptic } from "../../lib/twa"
import { EASING, SPRING } from "../../utils/animations"
import { armThreshold, HYSTERESIS, restWidth } from "./geometry"

const FLING_VELOCITY = 400
const COMMIT_TRANSITION = { duration: 0.25, ease: EASING.QUINT_OUT }
const INSTANT = { duration: 0 }

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
    const thresholdRef = useRef(0)

    const spring = reduceMotion ? INSTANT : SPRING.APPLE

    const setArmed = (next) => {
        if (armedRef.current === next) return
        armedRef.current = next
        haptic.impact(next ? "medium" : "light")
        animate(arm, next ? 1 : 0, spring)
    }

    const settle = (open) => {
        setIsOpen(open)
        setArmed(false)
        animate(x, open ? -restWidth(count) : 0, spring)
    }

    // Runs the trailing action with the row swiped fully out. `onCommit`
    // resolves true when the row is being removed (the parent collapses it);
    // otherwise, or if the action throws, the row springs back closed.
    const commit = async () => {
        if (committingRef.current) return
        committingRef.current = true
        // Out of the open state, so an outside touch can't drag it back in.
        setIsOpen(false)
        const transition = reduceMotion ? INSTANT : COMMIT_TRANSITION
        animate(arm, 1, transition)
        await animate(x, -sizeRef.current.width, transition)
        let removed = false
        try {
            removed = await onCommit()
        } finally {
            committingRef.current = false
            // Reset silently: this is not a disarm the user dragged back from.
            armedRef.current = false
            if (!removed) {
                animate(arm, 0, spring)
                animate(x, 0, spring)
            }
        }
    }

    const onDragStart = () => {
        draggedRef.current = true
        thresholdRef.current = armThreshold(count, sizeRef.current.width)
    }

    const onDrag = () => {
        const threshold = thresholdRef.current
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
