import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "motion/react"
import Text from "../Text"

import "./index.css"

const DropdownMenu = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
    })
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelectItem = (item) => {
        setSelectedItem(item)
        setIsOpen(false)
    }

    useEffect(() => {
        if (isOpen && buttonRef.current && dropdownRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            const dropdownRect = dropdownRef.current.getBoundingClientRect()

            let top = buttonRect.bottom + 1
            let left = buttonRect.right - dropdownRect.width - 216

            setDropdownPosition({
                top,
                left,
            })
        }
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
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 32,
            },
        },
        exit: {
            scale: 0,
            opacity: 0,
            filter: "blur(5px)",
            transition: { duration: 0.3 },
        },
    }

    return (
        <AnimatePresence>
            <div className="DropdownContainer">
                <div
                    className="selected"
                    onClick={toggleDropdown}
                    ref={buttonRef}
                >
                    {selectedItem}
                </div>
                {isOpen &&
                    createPortal(
                        <motion.div
                            ref={dropdownRef}
                            className="DropdownMenu"
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
                                            ? "item selected"
                                            : "item"
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
                        </motion.div>,
                        document.body
                    )}
            </div>
        </AnimatePresence>
    )
}

export default DropdownMenu
