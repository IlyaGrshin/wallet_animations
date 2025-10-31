import {
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
} from "react"
import PropTypes from "prop-types"
import { createPortal } from "react-dom"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import { SPRING } from "../../utils/animations"
import Text from "../Text"
import { GlassContainer } from "../GlassEffect"

import * as styles from "./DropdownMenu.module.scss"

const DROPDOWN_WIDTH = 250
const DROPDOWN_OFFSET = 24
const GAP = 1

const DROPDOWN_VARIANTS = {
    hidden: {
        scale: 0,
        opacity: 0,
    },
    visible: {
        scale: 1,
        opacity: 1,
        transition: SPRING.DROPDOWN,
    },
    exit: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.25 },
    },
}

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

const useDropdownPosition = (isOpen, buttonRef, dropdownRef) => {
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

const useClickOutside = (isOpen, refs, onClose) => {
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

const MenuItem = ({ item, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
    >
        <Text
            apple={{ variant: "body" }}
            material={{ variant: "body1" }}
            style={{ padding: "2px 0" }}
        >
            {item}
        </Text>
    </div>
)

MenuItem.propTypes = {
    item: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
}

const DropdownMenu = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(items[0])
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const animatedDropdownRef = useRef(null)

    const { position, isPositioned, resetPosition } = useDropdownPosition(
        isOpen,
        buttonRef,
        dropdownRef
    )

    const closeDropdown = () => {
        setIsOpen(false)
        resetPosition()
    }

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev)
        resetPosition()
    }

    const handleSelectItem = (item) => {
        setSelectedItem(item)
        setIsOpen(false)
        resetPosition()
    }

    useClickOutside(
        isOpen,
        [buttonRef, dropdownRef, animatedDropdownRef],
        closeDropdown
    )

    const transformOrigin = position.openUpwards ? "100% 100%" : "100% 0%"

    return (
        <div className={styles.container}>
            <div
                className={styles.selected}
                onClick={toggleDropdown}
                ref={buttonRef}
            >
                {selectedItem}
            </div>
            {createPortal(
                <>
                    {isOpen && !isPositioned && (
                        <div
                            ref={dropdownRef}
                            className={styles.root}
                            style={{
                                position: "absolute",
                                top: position.top,
                                left: position.left,
                                visibility: "hidden",
                                pointerEvents: "none",
                            }}
                        >
                            {items.map((item, index) => (
                                <MenuItem
                                    key={index}
                                    item={item}
                                    isSelected={false}
                                />
                            ))}
                        </div>
                    )}
                    <AnimatePresence>
                        {isOpen && isPositioned && (
                            <m.div
                                ref={animatedDropdownRef}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={DROPDOWN_VARIANTS}
                                style={{
                                    position: "absolute",
                                    top: position.top,
                                    left: position.left,
                                    transformOrigin, // todo: fixed that, still works incorrectly
                                }}
                            >
                                <GlassContainer className={styles.root}>
                                    {items.map((item, index) => (
                                        <MenuItem
                                            key={index}
                                            item={item}
                                            isSelected={item === selectedItem}
                                            onClick={() =>
                                                handleSelectItem(item)
                                            }
                                        />
                                    ))}
                                </GlassContainer>
                            </m.div>
                        )}
                    </AnimatePresence>
                </>,
                document.body
            )}
        </div>
    )
}

DropdownMenu.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
}
export default DropdownMenu
