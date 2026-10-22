import {
    useState,
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useRef,
} from "react"
import PropTypes from "prop-types"
import * as styles from "./Picker.module.scss"

import WebApp from "../../lib/twa"
import { drumTransform } from "../../utils/drum"

const Picker = ({ items, onPickerIndex }) => {
    const pickerRef = useRef(null)
    const baselineRef = useRef(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const selectIndex = useEffectEvent((index) => {
        if (index === selectedIndex) return
        setSelectedIndex(index)
        onPickerIndex?.(index)
    })

    useLayoutEffect(() => {
        const list = pickerRef.current
        const rows = [...list.children]
        if (!rows.length) return undefined

        const itemHeight = rows[0].offsetHeight
        const radius = list.clientHeight / 2
        baselineRef.current ??= list.scrollTop
        const baseline = baselineRef.current
        let frame = 0

        const paint = () => {
            frame = 0
            const scrollTop = list.scrollTop
            rows.forEach((row, index) => {
                const transform = drumTransform(
                    baseline - scrollTop + index * itemHeight,
                    radius
                )
                row.style.transform = transform ?? ""
                row.style.visibility = transform ? "" : "hidden"
            })
            selectIndex(
                Math.min(
                    rows.length - 1,
                    Math.max(0, Math.round(scrollTop / itemHeight) - 1)
                )
            )
        }

        const handleScroll = () => {
            if (!frame) frame = requestAnimationFrame(paint)
        }

        paint()
        list.addEventListener("scroll", handleScroll, { passive: true })
        return () => {
            list.removeEventListener("scroll", handleScroll)
            cancelAnimationFrame(frame)
        }
    }, [items.length])

    useEffect(() => {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            WebApp.HapticFeedback.selectionChanged()
        }
    }, [selectedIndex, items.length])

    return (
        <div className={styles.root}>
            <div className={styles.selected}></div>
            <ul ref={pickerRef}>
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    )
}

Picker.propTypes = {
    items: PropTypes.array.isRequired,
    onPickerIndex: PropTypes.func,
}
export default Picker
