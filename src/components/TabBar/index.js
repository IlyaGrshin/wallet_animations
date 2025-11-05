import { useEffect, useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import { motion } from "motion/react"
import { useApple } from "../../hooks/DeviceProvider"
import { GlassContainer } from "../GlassEffect"
import * as styles from "./TabBar.module.scss"
import Tab from "./components/Tab"
import { useIndicatorDrag } from "./useIndicatorDrag"
import GradientMask from "./components/GradientMask"

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const appearVariants = {
        hidden: { y: 16, opacity: 0, scale: 0.97 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 700, damping: 40 },
        },
    }

    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const userInteractedRef = useRef(false)
    const [replayNonce, setReplayNonce] = useState(0)

    const handleSegmentClick = (index) => {
        if (drag?.isDragging) return
        userInteractedRef.current = true
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    const playKey = `${activeIndex}:${replayNonce}`
    const spring = { type: "spring", stiffness: 800, damping: 50 }

    const drag = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        spring,
        onSnapToSame: () => setReplayNonce((n) => n + 1),
        onSnapToNew: (idx) => {
            setActiveIndex(idx)
            onChange?.(idx)
        },
    })

    const rootRef = useRef(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const update = () => {
            const r = el.getBoundingClientRect()
            setSize({
                width: Math.round(r.width),
                height: Math.round(r.height),
            })
        }
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    return (
        <motion.div
            ref={rootRef}
            className={styles.root}
            variants={appearVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.6 }}
            whileTap={{ scale: 1.02 }}
            transition={{
                scale: { type: "spring", stiffness: 800, damping: 40 },
            }}
        >
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    isActive={index === activeIndex}
                    onClick={() => handleSegmentClick(index)}
                    label={tab.label}
                    icon={tab.icon}
                    lottieIcon={tab.lottieIcon}
                    playKey={playKey}
                />
            ))}

            <Activity mode={useApple ? "visible" : "hidden"}>
                <motion.div
                    className={styles.clipPathContainer}
                    ref={drag.overlayRef}
                    {...drag.handlers}
                    animate={drag.animate}
                    transition={drag.transition}
                >
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            isActive={index === activeIndex}
                            onClick={() => handleSegmentClick(index)}
                            label={tab.label}
                            icon={tab.icon}
                            lottieIcon={tab.lottieIcon}
                            playKey={playKey}
                            data-overlay
                        />
                    ))}
                </motion.div>

                <GlassContainer />
                <GradientMask width={size.width} height={size.height} />
            </Activity>
        </motion.div>
    )
}

TabBar.propTypes = {
    tabs: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    defaultIndex: PropTypes.number,
}
export default TabBar
