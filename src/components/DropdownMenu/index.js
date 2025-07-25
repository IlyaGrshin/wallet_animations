import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import { SPRING } from "../../utils/animations"
import Text from "../Text"

import * as styles from "./DropdownMenu.module.scss"

const DropdownMenu = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
    })
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)

    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const handleSelectItem = useCallback((item) => {
        setSelectedItem(item)
        setIsOpen(false)
    }, [])

    useEffect(() => {
        if (isOpen && buttonRef.current && dropdownRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const dropdownRect = dropdownRef.current.getBoundingClientRect()

            const top = buttonRect.bottom + 1
            const left = buttonRect.right - dropdownRect.width - 216

            setDropdownPosition({ top, left })
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleClickOutside = (event) => {
            if (
                buttonRef.current &&
                dropdownRef.current &&
                !buttonRef.current.contains(event.target) &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const dropdownVariants = {
        hidden: {
            scale: 0,
            opacity: 0,
            filter: "blur(5px)",
        },
        visible: {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            transition: SPRING.DROPDOWN,
        },
        exit: {
            scale: 0,
            opacity: 0,
            filter: "blur(2px)",
            transition: { duration: 0.25 },
        },
    }

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
                <AnimatePresence>
                    {isOpen && (
                        <m.div
                            ref={dropdownRef}
                            className={styles.root}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dropdownVariants}
                            style={{
                                top: dropdownPosition.top,
                                left: dropdownPosition.left,
                            }}
                        >
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectItem(item)}
                                    className={
                                        item === selectedItem
                                            ? `${styles.item} ${styles.selected}`
                                            : `${styles.item}`
                                    }
                                >
                                    <Text
                                        apple={{
                                            variant: "body",
                                        }}
                                        material={{
                                            variant: "body1",
                                        }}
                                        style={{
                                            padding: "2px 0",
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </div>
                            ))}
                        </m.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}

export default DropdownMenu
