import { useCallback } from "react"

import { clamp } from "../../utils/number"
import { useAnchoredPosition } from "../../hooks/useAnchoredPosition"

export { useClickOutside } from "../../hooks/useClickOutside"

export const DROPDOWN_WIDTH = 250
export const GAP = 1
export const VIEWPORT_PADDING = 8

const INITIAL_POSITION = {
    top: 0,
    left: 0,
    openUpwards: false,
    originX: "100%",
    originY: "0%",
}

const calculatePosition = (buttonRect, dropdownSize) => {
    const { innerHeight, innerWidth } = window
    const spaceBelow = innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top

    const openUpwards =
        spaceBelow < dropdownSize.height && spaceAbove > spaceBelow

    const buttonCenterX = buttonRect.left + buttonRect.width / 2
    const rawLeft = buttonCenterX - dropdownSize.width / 2
    const left = clamp(
        rawLeft,
        VIEWPORT_PADDING,
        Math.max(
            VIEWPORT_PADDING,
            innerWidth - dropdownSize.width - VIEWPORT_PADDING
        )
    )

    const rawTop = openUpwards
        ? buttonRect.top - dropdownSize.height - GAP
        : buttonRect.bottom + GAP
    const top = clamp(
        rawTop,
        VIEWPORT_PADDING,
        Math.max(
            VIEWPORT_PADDING,
            innerHeight - dropdownSize.height - VIEWPORT_PADDING
        )
    )

    const originXPx = clamp(buttonCenterX - left, 0, dropdownSize.width)
    const originX = `${(originXPx / dropdownSize.width) * 100}%`
    const originY = openUpwards ? "100%" : "0%"

    return { top, left, openUpwards, originX, originY }
}

export const useDropdownPosition = (isOpen, buttonRef, dropdownRef) => {
    const calculate = useCallback(
        (triggerRect, contentSize) =>
            calculatePosition(triggerRect, contentSize),
        []
    )

    return useAnchoredPosition({
        isOpen,
        triggerRef: buttonRef,
        contentRef: dropdownRef,
        initialPosition: INITIAL_POSITION,
        calculate,
    })
}
