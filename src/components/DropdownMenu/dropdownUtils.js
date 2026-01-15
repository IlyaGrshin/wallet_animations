import { useEffect, useLayoutEffect, useState } from "react"

export const DROPDOWN_WIDTH = 250
export const DROPDOWN_OFFSET = 24
export const GAP = 1

const calculatePosition = (buttonRect, dropdownRect) => {
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top

    const openUpwards =
        spaceBelow < dropdownRect.height && spaceAbove > spaceBelow

    return {
        top: openUpwards
            ? buttonRect.top - dropdownRect.height - GAP
            : buttonRect.bottom + GAP,
        left: buttonRect.right - dropdownRect.width + DROPDOWN_OFFSET,
        openUpwards,
    }
}

export const useDropdownPosition = (isOpen, buttonRef, dropdownRef) => {
    const [position, setPosition] = useState({
        top: 0,
        left: 0,
        openUpwards: false,
    })
    const [isPositioned, setIsPositioned] = useState(false)

    useLayoutEffect(() => {
        if (!isOpen || !buttonRef.current || isPositioned) return

        const buttonRect = buttonRef.current.getBoundingClientRect()

        if (!dropdownRef.current) {
            setPosition({
                top: buttonRect.bottom + GAP,
                left: buttonRect.right - DROPDOWN_WIDTH,
                openUpwards: false,
            })
            return
        }

        const dropdownRect = dropdownRef.current.getBoundingClientRect()
        setPosition(calculatePosition(buttonRect, dropdownRect))
        setIsPositioned(true)
    }, [isOpen, isPositioned, buttonRef, dropdownRef])

    return {
        position,
        isPositioned,
        resetPosition: () => setIsPositioned(false),
    }
}

export const useClickOutside = (isOpen, refs, onClose) => {
    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event) => {
            const isOutside = refs.every(
                (ref) => ref.current && !ref.current.contains(event.target)
            )

            if (isOutside) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, refs, onClose])
}
