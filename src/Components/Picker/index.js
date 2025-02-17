import React, { useState, useEffect, useRef } from "react"
import * as styles from "./Picker.module.scss"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

const Picker = ({ items, onPickerIndex }) => {
    // TODO: Android Support
    const pickerRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [itemHeight, setItemHeight] = useState(34)
    const baseline = useRef(0)

    const handleScroll = () => {
        const index = Math.min(
            items.length,
            Math.max(
                0,
                Math.round(pickerRef.current.scrollTop / itemHeight) - 1
            )
        )

        if (pickerRef.current) {
            setItemHeight(pickerRef.current.children[0].offsetHeight)
            setScrollPosition(pickerRef.current.scrollTop)
            setSelectedIndex(index)
        }

        if (onPickerIndex) {
            onPickerIndex(index)
        }
    }

    useEffect(() => {
        if (WebApp.initData) {
            WebApp.onEvent("backButtonClicked", () => {
                WebApp.setHeaderColor("secondary_bg_color")
                WebApp.setBackgroundColor("secondary_bg_color")
            })
        } else {
            document.body.style.backgroundColor =
                "var(--tg-theme-secondary-bg-color)"
        }
    }, [])

    useEffect(() => {
        const container = pickerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [])

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            WebApp.HapticFeedback.selectionChanged()
        }
    }, [selectedIndex])

    useEffect(() => {
        baseline.current = pickerRef.current.scrollTop
    }, [])

    return (
        <>
            <BackButton />
            <div className={styles.root}>
                <div className={styles.selected}></div>
                <ul ref={pickerRef}>
                    {items.map((item, index) => {
                        const itemCoordinate =
                            -scrollPosition +
                            baseline.current +
                            index * itemHeight

                        const radius = itemHeight * 3

                        const itemDegree =
                            radius -
                            Math.sqrt(
                                Math.pow(radius, 2) -
                                    Math.pow(itemCoordinate, 2)
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
        </>
    )
}

export default Picker
