import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"

export const DROPDOWN_WIDTH = 250
export const DROPDOWN_OFFSET = 24
export const GAP = 1
export const VIEWPORT_PADDING = 8

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const calculatePosition = (buttonRect, dropdownSize) => {
    const { innerHeight, innerWidth } = window
    const spaceBelow = innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top

    const openUpwards =
        spaceBelow < dropdownSize.height && spaceAbove > spaceBelow

    const rawLeft = buttonRect.right - dropdownSize.width + DROPDOWN_OFFSET
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

    const buttonCenterX = buttonRect.left + buttonRect.width / 2
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

export const useClickOutside = (isOpen, onClose, ...refs) => {
    const onCloseRef = useRef(onClose)
    useEffect(() => {
        onCloseRef.current = onClose
    })

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event) => {
            const isOutside = refs.every(
                (ref) => !ref.current || !ref.current.contains(event.target)
            )
            if (isOutside) onCloseRef.current()
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ...refs])
}
