import { useState, useRef } from "react"
import { motion } from "motion/react"
import { useApple26 } from "../../hooks/DeviceProvider"
import * as styles from "./TabBar.module.scss"
import Tab from "./components/Tab"
import { useIndicatorDrag } from "./useIndicatorDrag"

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
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

    return (
        <motion.div
            className={styles.root}
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

            {useApple26 && (
                <>
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
                            />
                        ))}
                    </motion.div>
                    <div className={styles.gradient}></div>
                </>
            )}
        </motion.div>
    )
}

export default TabBar
