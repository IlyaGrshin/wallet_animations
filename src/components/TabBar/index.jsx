import { useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useSkin } from "../../hooks/DeviceProvider"
import { useResizeObserver } from "../../hooks/useResizeObserver"
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
    layoutDependency,
}) => {
    const { overlayRef, handlers } = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        onSnapToSame,
        onSnapToNew: onChange,
    })

    return (
        <m.div
            className={styles.clipPathContainer}
            ref={overlayRef}
            {...handlers}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {tabs.map((tab, index) => (
                <Tab
                    key={index}
                    isActive={index === activeIndex}
                    onClick={() => onChange(index)}
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

    const rootRef = useRef(null)

    const [rootWidth, setRootWidth] = useState(0)

    useResizeObserver(rootRef, (entry) => {
        setRootWidth(entry.contentRect.width)
    })

    const isThreeTabs = tabs.length === 3
    const marginX = isThreeTabs ? 54 : 21
    const rootStyle = isApple
        ? {
              left: marginX,
              right: marginX,
              width: `calc(100% - ${marginX * 2}px)`,
          }
        : {}

    // Geometry only changes with the tab count or skin; motion skips layout
    // measurement on every other re-render (e.g. each tab switch).
    const layoutDependency = `${tabs.length}:${isApple}`

    const maskInsets = {
        top: 21,
        bottom: 21,
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
        >
            <div className={styles.content}>
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        isActive={index === activeIndex}
                        onClick={() => handleSegmentClick(index)}
                        playKey={playKey}
                        layoutDependency={layoutDependency}
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
                layoutDependency={layoutDependency}
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
    onChange: PropTypes.func,
    onSnapToSame: PropTypes.func,
    playKey: PropTypes.string,
    layoutDependency: PropTypes.string,
}

export default TabBar
