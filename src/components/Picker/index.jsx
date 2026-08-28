import { useState, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import * as styles from "./Picker.module.scss"

import WebApp from "../../lib/twa"
import { drumTransform } from "../../utils/drum"

const Picker = ({ items, onPickerIndex }) => {
    const pickerRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [itemHeight, setItemHeight] = useState(34)
    const [radius, setRadius] = useState(100)
    const [baseline, setBaseline] = useState(0)
    const ticking = useRef(false)

    useEffect(() => {
        if (pickerRef.current?.children.length > 0) {
            setItemHeight(pickerRef.current.children[0].offsetHeight)
            setRadius(pickerRef.current.clientHeight / 2)
            setBaseline(pickerRef.current.scrollTop)
        }
    }, [])

    useEffect(() => {
        const handleScroll = () => {
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
        }

        const container = pickerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [itemHeight, items.length, selectedIndex, onPickerIndex])

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

                    const transform = drumTransform(itemCoordinate, radius)

                    return (
                        <li
                            key={index}
                            style={{
                                transform: transform ?? undefined,
                                visibility: transform ? undefined : "hidden",
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

Picker.propTypes = {
    items: PropTypes.array.isRequired,
    onPickerIndex: PropTypes.func,
}
export default Picker
