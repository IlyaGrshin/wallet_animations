import { useEffect, useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import { motion } from "motion/react"
import { useApple } from "../../hooks/DeviceProvider"
import { GlassBorder } from "../GlassEffect"
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
    const { overlayRef, animate, transition, handlers } = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        spring: { type: "spring", stiffness: 800, damping: 50 },
        onSnapToSame,
        onSnapToNew: onChange,
    })

    return (
        <motion.div
            className={styles.clipPathContainer}
            ref={overlayRef}
            {...handlers}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, ...animate }}
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
                    playKey={playKey}
                    data-overlay
                    {...tab}
                />
            ))}
        </motion.div>
    )
}

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const [replayNonce, setReplayNonce] = useState(0)

    useEffect(() => {
        setActiveIndex(defaultIndex)
    }, [defaultIndex])

    useEffect(() => {
        setActiveIndex((prev) => Math.min(prev, tabs.length - 1))
    }, [tabs.length])

    const handleSegmentClick = (index) => {
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    const playKey = `${activeIndex}:${replayNonce}`

    const rootRef = useRef(null)

    const [rootWidth, setRootWidth] = useState(0)

    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setRootWidth(entry.contentRect.width)
            }
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

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
            <div
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
                        playKey={playKey}
                        {...tab}
                    />
                ))}
            </div>
            <TabBarOverlay
                tabs={tabs}
                activeIndex={activeIndex}
                onChange={handleSegmentClick}
                onSnapToSame={() => setReplayNonce((n) => n + 1)}
                playKey={playKey}
            />

            <Activity mode={useApple ? "visible" : "hidden"}>
                <GlassBorder />
                <GradientMask
                    width={rootWidth}
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
