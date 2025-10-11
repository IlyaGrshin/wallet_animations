import { useState, useEffect, useRef, useCallback } from "react"
import * as styles from "./Picker.module.scss"

import WebApp from "@twa-dev/sdk"

const Picker = ({ items, onPickerIndex }) => {
    // TODO: Android Support
    const pickerRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [itemHeight, setItemHeight] = useState(34)
    const [baseline, setBaseline] = useState(0)
    const ticking = useRef(false)

    useEffect(() => {
        if (pickerRef.current?.children.length > 0) {
            setItemHeight(pickerRef.current.children[0].offsetHeight)
            setBaseline(pickerRef.current.scrollTop)
        }
    }, [])

    const handleScroll = useCallback(() => {
        if (ticking.current) return

        ticking.current = true
        requestAnimationFrame(() => {
            if (!pickerRef.current) {
                ticking.current = false
                return
            }

            const scrollTop = pickerRef.current.scrollTop
            const index = Math.min(
                items.length - 1,
                Math.max(0, Math.round(scrollTop / itemHeight) - 1)
            )

            setScrollPosition(scrollTop)

            if (selectedIndex !== index) {
                setSelectedIndex(index)
                onPickerIndex?.(index)
            }

            ticking.current = false
        })
    }, [itemHeight, items.length, selectedIndex, onPickerIndex])

    useEffect(() => {
        const container = pickerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [handleScroll])

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            WebApp.HapticFeedback.selectionChanged()
        }
    }, [selectedIndex, items.length])

    return (
        <div className={styles.root}>
            <div className={styles.selected}></div>
            <ul ref={pickerRef}>
                {items.map((item, index) => {
                    const itemCoordinate =
                        -scrollPosition + baseline + index * itemHeight

                    const radius = itemHeight * 3

                    const itemDegree = Math.min(
                        radius -
                            Math.sqrt(
                                Math.pow(radius, 2) -
                                    Math.pow(itemCoordinate, 2)
                            ),
                        90
                    )

                    return (
                        <li
                            key={index}
                            style={{
                                transform: `rotateX(${itemDegree}deg) translateZ(0px)`,
                                height: `${itemHeight}px`,
                            }}
                        >
                            {item}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Picker
