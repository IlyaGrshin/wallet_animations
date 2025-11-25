import { useEffect, useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import { motion, AnimatePresence } from "motion/react"
import { useApple } from "../../hooks/DeviceProvider"
import { GlassContainer } from "../GlassEffect"
import * as styles from "./TabBar.module.scss"
import Tab from "./components/Tab"
import { useIndicatorDrag } from "./useIndicatorDrag"
import GradientMask from "./components/GradientMask"

const TabBarOverlay = ({
    tabs,
    activeIndex,
    onChange,
    onSnapToSame,
    playKey,
}) => {
    const spring = { type: "spring", stiffness: 800, damping: 50 }
    const { overlayRef, animate, transition, handlers } = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        spring,
        onSnapToSame,
        onSnapToNew: onChange,
    })

    const animateProps = { opacity: 1, ...animate }

    return (
        <motion.div
            className={styles.clipPathContainer}
            ref={overlayRef}
            {...handlers}
            initial={{ opacity: 0 }}
            animate={animateProps}
            exit={{ opacity: 0 }}
            transition={{
                default: { duration: 0.2 },
                clipPath: transition.clipPath,
            }}
        >
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    isActive={index === activeIndex}
                    onClick={() => onChange(index)}
                    label={tab.label}
                    icon={tab.icon}
                    lottieIcon={tab.lottieIcon}
                    playKey={playKey}
                    data-overlay
                />
            ))}
        </motion.div>
    )
}

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const userInteractedRef = useRef(false)
    const [replayNonce, setReplayNonce] = useState(0)

    useEffect(() => {
        setActiveIndex(defaultIndex)
    }, [defaultIndex])

    const handleSegmentClick = (index) => {
        userInteractedRef.current = true
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    const playKey = `${activeIndex}:${replayNonce}`

    const rootRef = useRef(null)

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 0
    )

    useEffect(() => {
        const update = () => {
            setWindowWidth(window.innerWidth)
        }
        window.addEventListener("resize", update)
        update()
        return () => window.removeEventListener("resize", update)
    }, [])

    const tabsKey = tabs.map((t) => t.label).join("-")

    const isThreeTabs = tabs.length === 3
    const marginX = isThreeTabs ? 54 : 21
    const rootStyle = useApple
        ? {
              left: marginX,
              right: marginX,
              width: `calc(100% - ${marginX * 2}px)`,
          }
        : {}

    const maskInsets = {
        top: 21,
        bottom: 21,
        left: marginX,
        right: marginX,
    }

    return (
        <motion.div
            ref={rootRef}
            className={styles.root}
            whileTap={{ scale: 1.02 }}
            transition={{
                scale: { type: "spring", stiffness: 800, damping: 40 },
            }}
            style={rootStyle}
            layout
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={tabsKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        display: "flex",
                        width: "100%",
                        position: "relative",
                        zIndex: 1,
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
                </motion.div>
            </AnimatePresence>

            <Activity mode={useApple ? "visible" : "hidden"}>
                <AnimatePresence mode="wait" initial={false}>
                    <TabBarOverlay
                        key={tabsKey}
                        tabs={tabs}
                        activeIndex={activeIndex}
                        onChange={onChange}
                        onSnapToSame={() => setReplayNonce((n) => n + 1)}
                        playKey={playKey}
                    />
                </AnimatePresence>

                <GlassContainer />
                <GradientMask
                    width={windowWidth - (maskInsets.left + maskInsets.right)}
                    height={64}
                    insets={maskInsets}
                />
            </Activity>
        </motion.div>
    )
}

TabBar.propTypes = {
    tabs: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    defaultIndex: PropTypes.number,
}

TabBarOverlay.propTypes = {
    tabs: PropTypes.array.isRequired,
    activeIndex: PropTypes.number,
    onChange: PropTypes.func,
    onSnapToSame: PropTypes.func,
    playKey: PropTypes.string,
}

export default TabBar
