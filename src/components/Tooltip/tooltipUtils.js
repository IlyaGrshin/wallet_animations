import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

import { calculatePosition, samePosition } from "./tooltipPosition"

export { useClickOutside } from "../../hooks/useClickOutside"

const INITIAL_POSITION = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    placement: "bottom",
    shape: "full",
    tailOffsetX: 0,
    tailOffsetY: 0,
    tailProtrusion: 0,
    originX: "50%",
    originY: "0%",
}

export const useTooltipPosition = (
    isOpen,
    triggerRef,
    tooltipRef,
    tailVBreadth,
    tailHBreadth,
    tailProtrusion,
    preferredPlacement
) => {
    const [position, setPosition] = useState(INITIAL_POSITION)
    const [isPositioned, setIsPositioned] = useState(false)
    const bodySizeRef = useRef(null)

    const resetPosition = useCallback(() => {
        setIsPositioned(false)
        bodySizeRef.current = null
    }, [])

    useLayoutEffect(() => {
        if (!isOpen || isPositioned) return
        if (!triggerRef.current || !tooltipRef.current) return

        const triggerRect = triggerRef.current.getBoundingClientRect()
        const { width, height } = tooltipRef.current.getBoundingClientRect()
        bodySizeRef.current = { width, height }
        setPosition(
            calculatePosition(
                triggerRect,
                { width, height },
                tailVBreadth,
                tailHBreadth,
                tailProtrusion,
                preferredPlacement
            )
        )
        setIsPositioned(true)
    }, [
        isOpen,
        isPositioned,
        triggerRef,
        tooltipRef,
        tailVBreadth,
        tailHBreadth,
        tailProtrusion,
        preferredPlacement,
    ])

    useEffect(() => {
        if (!isOpen || !isPositioned) return

        let frame = null
        const reposition = () => {
            frame = null
            if (!triggerRef.current || !bodySizeRef.current) return
            const rect = triggerRef.current.getBoundingClientRect()
            const next = calculatePosition(
                rect,
                bodySizeRef.current,
                tailVBreadth,
                tailHBreadth,
                tailProtrusion,
                preferredPlacement
            )
            setPosition((prev) => (samePosition(prev, next) ? prev : next))
        }
        const schedule = () => {
            if (frame !== null) return
            frame = requestAnimationFrame(reposition)
        }

        window.addEventListener("scroll", schedule, true)
        window.addEventListener("resize", schedule)
        return () => {
            if (frame !== null) cancelAnimationFrame(frame)
            window.removeEventListener("scroll", schedule, true)
            window.removeEventListener("resize", schedule)
        }
    }, [
        isOpen,
        isPositioned,
        triggerRef,
        tailVBreadth,
        tailHBreadth,
        tailProtrusion,
        preferredPlacement,
    ])

    return { position, isPositioned, resetPosition }
}
