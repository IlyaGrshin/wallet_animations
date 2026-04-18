import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

import { clamp } from "../../utils/number"

export { useClickOutside } from "../../hooks/useClickOutside"

export const DROPDOWN_WIDTH = 250
export const GAP = 1
export const VIEWPORT_PADDING = 8

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
    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        openUpwards: false,
        originX: "100%",
        originY: "0%",
    })
    const [isPositioned, setIsPositioned] = useState(false)
    const dropdownSizeRef = useRef(null)

    const resetPosition = useCallback(() => {
        setIsPositioned(false)
        dropdownSizeRef.current = null
    }, [])

    useLayoutEffect(() => {
        if (!isOpen || isPositioned) return
        if (!buttonRef.current || !dropdownRef.current) return

        const buttonRect = buttonRef.current.getBoundingClientRect()
        const { width, height } = dropdownRef.current.getBoundingClientRect()
        dropdownSizeRef.current = { width, height }
        setPosition(calculatePosition(buttonRect, { width, height }))
        setIsPositioned(true)
    }, [isOpen, isPositioned, buttonRef, dropdownRef])

    useEffect(() => {
        if (!isOpen || !isPositioned) return

        let frame = null
        const reposition = () => {
            frame = null
            if (!buttonRef.current || !dropdownSizeRef.current) return
            const rect = buttonRef.current.getBoundingClientRect()
            setPosition(calculatePosition(rect, dropdownSizeRef.current))
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
    }, [isOpen, isPositioned, buttonRef])

    return { position, isPositioned, resetPosition }
}
