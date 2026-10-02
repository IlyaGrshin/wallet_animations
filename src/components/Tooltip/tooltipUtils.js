import { useEffect, useState } from "react"

import {
    VIEWPORT_PADDING,
    calculatePosition,
    samePosition,
} from "./tooltipPosition"
import { useAnchoredPosition } from "../../hooks/useAnchoredPosition"

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
    preferredPlacement,
    getBounds,
    maxWidth
) => {
    const calculate = (triggerRect, contentSize) =>
        calculatePosition(
            triggerRect,
            contentSize,
            tailVBreadth,
            tailHBreadth,
            tailProtrusion,
            preferredPlacement,
            getBounds()
        )

    return useAnchoredPosition({
        isOpen,
        triggerRef,
        contentRef: tooltipRef,
        initialPosition: INITIAL_POSITION,
        calculate,
        equals: samePosition,
        measureKey: maxWidth,
    })
}

export const usePaneMaxWidth = (isOpen, getBounds) => {
    const [maxWidth, setMaxWidth] = useState(null)

    const fitToBounds = () => {
        const { left, right } = getBounds()
        setMaxWidth(right - left - VIEWPORT_PADDING * 2)
    }

    useEffect(() => {
        if (!isOpen) return
        window.addEventListener("resize", fitToBounds)
        return () => window.removeEventListener("resize", fitToBounds)
    }, [isOpen, fitToBounds])

    return [maxWidth, fitToBounds]
}
