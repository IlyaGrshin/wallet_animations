import { useEffect, useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useSkin } from "../../hooks/DeviceProvider"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import { GlassBorder } from "../GlassEffect"
import * as styles from "./TabBar.module.scss"
import Tab from "./components/Tab"
import { useIndicatorDrag } from "./useIndicatorDrag"
import { EDGE_INSET, barWidth } from "./metrics"
import GradientMask from "./components/GradientMask"

const TabBarOverlay = ({
    tabs,
    activeIndex,
    onTabClick,
    playKey,
    layoutDependency,
    overlayRef,
}) => {
    return (
        <m.div
            className={styles.clipPathContainer}
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    isActive={index === activeIndex}
                    onClick={(e) => onTabClick(e, index)}
                    playKey={playKey}
                    layoutDependency={layoutDependency}
                    data-overlay
                    {...tab}
                />
            ))}
        </m.div>
    )
}

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const { isApple } = useSkin()
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const [replayNonce, setReplayNonce] = useState(0)

    // Sync with props during render instead of in effects: no extra commit
    // with a stale index.
    const [prevDefaultIndex, setPrevDefaultIndex] = useState(defaultIndex)
    if (defaultIndex !== prevDefaultIndex) {
        setPrevDefaultIndex(defaultIndex)
        setActiveIndex(defaultIndex)
    }
    const [prevTabsLength, setPrevTabsLength] = useState(tabs.length)
    if (tabs.length !== prevTabsLength) {
        setPrevTabsLength(tabs.length)
        setActiveIndex((prev) => Math.min(prev, tabs.length - 1))
    }

    const handleSegmentClick = (index) => {
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    const playKey = `${activeIndex}:${replayNonce}`

    const handleTabClick = (e, index) => {
        if (e.detail === 0) handleSegmentClick(index)
    }

    const indicator = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        onSnapToSame: () => setReplayNonce((n) => n + 1),
        onSnapToNew: handleSegmentClick,
    })

    const rootRef = useRef(null)
    const containerRef = useRef(null)

    const [rootWidth, setRootWidth] = useState(0)
    const [marginX, setMarginX] = useState(EDGE_INSET)

    const measureMargin = () => {
        if (rootRef.current) setMarginX(rootRef.current.offsetLeft)
    }

    useEffect(() => {
        containerRef.current = rootRef.current?.offsetParent ?? null
    }, [])

    useResizeObserver(rootRef, (entry) => {
        setRootWidth(entry.contentRect.width)
        measureMargin()
    })

    useResizeObserver(containerRef, measureMargin)

    const rootStyle = isApple
        ? {
              left: 0,
              right: 0,
              marginInline: "auto",
              width: barWidth(tabs),
          }
        : {}

    // Geometry only changes with the tab count or skin; motion skips layout
    // measurement on every other re-render (e.g. each tab switch).
    const layoutDependency = `${tabs.length}:${isApple}`

    const maskInsets = {
        top: EDGE_INSET,
        bottom: EDGE_INSET,
        left: marginX,
        right: marginX,
    }

    return (
        <m.div
            ref={rootRef}
            className={styles.root}
            whileTap={{ scale: 1.02 }}
            transition={{
                scale: { type: "spring", stiffness: 800, damping: 40 },
            }}
            style={rootStyle}
            layout
            layoutDependency={layoutDependency}
            {...indicator.handlers}
        >
            <div className={styles.content}>
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        isActive={index === activeIndex}
                        onClick={(e) => handleTabClick(e, index)}
                        playKey={playKey}
                        layoutDependency={layoutDependency}
                        {...tab}
                    />
                ))}
            </div>
            <TabBarOverlay
                tabs={tabs}
                activeIndex={activeIndex}
                onTabClick={handleTabClick}
                playKey={playKey}
                layoutDependency={layoutDependency}
                overlayRef={indicator.overlayRef}
            />

            <Activity mode={isApple ? "visible" : "hidden"}>
                <GlassBorder />
                <GradientMask
                    width={rootWidth}
                    height={64}
                    insets={maskInsets}
                />
            </Activity>
        </m.div>
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
    onTabClick: PropTypes.func.isRequired,
    playKey: PropTypes.string,
    layoutDependency: PropTypes.string,
    overlayRef: PropTypes.object,
}

export default TabBar
