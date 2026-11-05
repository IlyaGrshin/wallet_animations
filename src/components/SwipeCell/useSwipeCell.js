import { useEffect, useRef, useState } from "react"
import {
    animate,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "motion/react"

import { haptic } from "../../lib/twa"
import { useSkin } from "../../hooks/DeviceProvider"
import { EASING, SPRING } from "../../utils/animations"
import {
    armThreshold,
    HYSTERESIS,
    openOffset,
    rawPull,
    rubberBand,
} from "./geometry"

const FLING_VELOCITY = 400
const COMMIT_TRANSITION = { duration: 0.25, ease: EASING.QUINT_OUT }
const INSTANT = { duration: 0 }

// Drag state for a row with trailing actions: rest closed, rest open on the
// action strip, or armed for the full swipe that runs the trailing action.
export const useSwipeCell = ({ rootRef, sizeRef, width, count, onCommit }) => {
    const reduceMotion = useReducedMotion()
    const { isApple } = useSkin()
    // `pull` is the finger (drag writes it via _dragX); `x` is what the
    // content shows after rubber-banding. Animations target `pull`.
    const pull = useMotionValue(0)
    const x = useTransform(
        () => -rubberBand(-pull.get(), count, sizeRef.current.width)
    )
    const arm = useMotionValue(0)
    const revealed = useTransform(x, (v) => Math.max(0, -v))
    const [isOpen, setIsOpen] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const armedRef = useRef(false)
    const draggedRef = useRef(false)
    const committingRef = useRef(false)
    const [isCommitting, setIsCommitting] = useState(false)
    const thresholdRef = useRef(0)

    const platformSpring = isApple ? SPRING.APPLE : SPRING.MATERIAL
    const spring = reduceMotion ? INSTANT : platformSpring

    const setArmed = (next) => {
        if (armedRef.current === next) return
        armedRef.current = next
        haptic.impact(next ? "medium" : "light")
        animate(arm, next ? 1 : 0, spring)
    }

    const toPull = (shown) => -rawPull(shown, count, sizeRef.current.width)

    // Settles with the finger's release velocity, so a flick carries on.
    const settle = (open, velocity = 0) => {
        setIsOpen(open)
        setArmed(false)
        const target = open ? openOffset(count, sizeRef.current.width) : 0
        animate(pull, toPull(target), { ...spring, velocity })
    }

    // Runs the trailing action with the row swiped fully out. `onCommit`
    // resolves true when the row is being removed (the parent collapses it);
    // otherwise, or if the action throws, the row springs back closed.
    // `keepOpen` (a keyboard press): when the row survives, it settles open
    // so the focused action stays visible.
    const commit = async ({ keepOpen = false } = {}) => {
        if (committingRef.current) return
        committingRef.current = true
        setIsCommitting(true)
        // Out of the open state, so an outside touch can't drag it back in.
        setIsOpen(false)
        const transition = reduceMotion ? INSTANT : COMMIT_TRANSITION
        animate(arm, 1, transition)
        await animate(pull, toPull(sizeRef.current.width), transition)
        let removed = false
        try {
            removed = await onCommit()
        } catch (error) {
            // A failed action keeps the row; report it without an unhandled
            // rejection from the fire-and-forget callers.
            console.error(error)
        } finally {
            committingRef.current = false
            setIsCommitting(false)
            // Reset silently: this is not a disarm the user dragged back from.
            armedRef.current = false
            if (!removed) {
                animate(arm, 0, spring)
                // Reopen only if the action still has focus: the user may
                // have tabbed away while an async action was running.
                const focused = rootRef.current?.contains(
                    document.activeElement
                )
                if (keepOpen && focused) settle(true)
                else animate(pull, 0, spring)
            }
        }
    }

    const onDragStart = () => {
        draggedRef.current = true
        setIsDragging(true)
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
        setIsDragging(false)
        if (armedRef.current) {
            commit()
            return
        }
        const pulled = revealed.get()
        const open =
            velocity.x < -FLING_VELOCITY ||
            (velocity.x < FLING_VELOCITY &&
                pulled > openOffset(count, sizeRef.current.width) / 2)
        settle(open, velocity.x)
    }

    // A drag or a tap on the open row's content only closes it — it must not
    // reach the cell's own onClick.
    // While a full swipe commits, the row takes no new drag or click: the
    // capture-phase stop keeps the pointer from reaching motion's drag.
    const onPointerDownCapture = (event) => {
        if (committingRef.current) {
            event.stopPropagation()
            return
        }
        draggedRef.current = false
    }
    const onClickCapture = (event) => {
        if (committingRef.current) {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (!draggedRef.current && !isOpen) return
        // One gesture swallows one click; a later keyboard click (no pointer
        // down to reset it) must go through.
        draggedRef.current = false
        event.preventDefault()
        event.stopPropagation()
        if (isOpen) settle(false)
    }

    // The raw pull belongs to the old bands: when the row resizes or its
    // action set changes, an open (or half-dragged) row closes rather than
    // rendering off its new geometry.
    useEffect(() => {
        if (pull.get() === 0 || committingRef.current) return
        settle(false)
    }, [width, count])

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
        pull,
        arm,
        revealed,
        isOpen,
        isDragging,
        isCommitting,
        commit,
        close: () => settle(false),
        open: () => settle(true),
        contentHandlers: {
            onDragStart,
            onDrag,
            onDragEnd,
            onPointerDownCapture,
            onClickCapture,
        },
    }
}
