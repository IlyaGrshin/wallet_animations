import { useCallback, useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { createPortal } from "react-dom"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import { SPRING } from "../../utils/animations"
import Text from "../Text"
import { GlassBorder } from "../GlassEffect"
import { useClickOutside, useDropdownPosition } from "./dropdownUtils"

import * as styles from "./DropdownMenu.module.scss"

const DROPDOWN_VARIANTS = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: SPRING.DROPDOWN },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.25 } },
}

const MenuItem = ({ item, isSelected, onClick, onMouseEnter, itemRef }) => (
    <div
        ref={itemRef}
        role="menuitem"
        tabIndex={-1}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
    >
        <Text variant="body" style={{ padding: "2px 0" }}>
            {item}
        </Text>
    </div>
)

MenuItem.propTypes = {
    item: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    itemRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
}

const DropdownMenu = ({ items, trigger }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [activeIndex, setActiveIndex] = useState(-1)
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const animatedDropdownRef = useRef(null)
    const itemRefs = useRef([])
    const activeIndexRef = useRef(activeIndex)

    const { position, isPositioned, resetPosition } = useDropdownPosition(
        isOpen,
        buttonRef,
        dropdownRef
    )

    useEffect(() => {
        activeIndexRef.current = activeIndex
    }, [activeIndex])

    useEffect(() => {
        if (!items.includes(selectedItem)) setSelectedItem(items[0])
    }, [items, selectedItem])

    const closeDropdown = useCallback(() => {
        setIsOpen(false)
        resetPosition()
        setActiveIndex(-1)
    }, [resetPosition])

    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev)
        resetPosition()
        setActiveIndex(-1)
    }, [resetPosition])

    const handleSelectItem = useCallback(
        (item) => {
            setSelectedItem(item)
            setIsOpen(false)
            resetPosition()
            setActiveIndex(-1)
            buttonRef.current?.focus()
        },
        [resetPosition]
    )

    useClickOutside(
        isOpen,
        closeDropdown,
        buttonRef,
        dropdownRef,
        animatedDropdownRef
    )

    useEffect(() => {
        if (!isOpen || !isPositioned) return
        const idx = Math.max(0, items.indexOf(selectedItem))
        setActiveIndex(idx)
        itemRefs.current[idx]?.focus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, isPositioned])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault()
                closeDropdown()
                buttonRef.current?.focus()
                return
            }
            if (e.key === "ArrowDown") {
                e.preventDefault()
                setActiveIndex((prev) => {
                    const base = prev < 0 ? -1 : prev
                    const next = (base + 1 + items.length) % items.length
                    itemRefs.current[next]?.focus()
                    return next
                })
                return
            }
            if (e.key === "ArrowUp") {
                e.preventDefault()
                setActiveIndex((prev) => {
                    const base = prev < 0 ? 0 : prev
                    const next = (base - 1 + items.length) % items.length
                    itemRefs.current[next]?.focus()
                    return next
                })
                return
            }
            if (e.key === "Enter" || e.key === " ") {
                const current = activeIndexRef.current
                if (current < 0) return
                e.preventDefault()
                handleSelectItem(items[current])
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, items, closeDropdown, handleSelectItem])

    const handleButtonKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
            e.preventDefault()
            if (!isOpen) toggleDropdown()
        }
    }

    return (
        <div className={styles.container}>
            <div
                className={trigger ? styles.trigger : styles.selected}
                onClick={toggleDropdown}
                onKeyDown={handleButtonKeyDown}
                ref={buttonRef}
                role="button"
                tabIndex={0}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                {trigger ?? selectedItem}
            </div>
            {createPortal(
                <>
                    {isOpen && !isPositioned && (
                        <div
                            ref={dropdownRef}
                            className={styles.root}
                            style={{
                                position: "fixed",
                                top: position.top,
                                left: position.left,
                                visibility: "hidden",
                                pointerEvents: "none",
                                zIndex: 1000,
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
                                role="menu"
                                className={styles.root}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={DROPDOWN_VARIANTS}
                                style={{
                                    position: "fixed",
                                    top: position.top,
                                    left: position.left,
                                    transformOrigin: `${position.originX} ${position.originY}`,
                                    zIndex: 1000,
                                }}
                            >
                                <GlassBorder />
                                {items.map((item, index) => (
                                    <MenuItem
                                        key={index}
                                        item={item}
                                        isSelected={item === selectedItem}
                                        onClick={() => handleSelectItem(item)}
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                        itemRef={(el) => {
                                            itemRefs.current[index] = el
                                        }}
                                    />
                                ))}
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
    trigger: PropTypes.node,
}
export default DropdownMenu
