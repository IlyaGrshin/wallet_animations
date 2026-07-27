import { useEffect, useRef, useState, Activity } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useSkin } from "../../hooks/DeviceProvider"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import { GlassBorder } from "../GlassEffect"
import * as styles from "./TabBar.module.scss"
import Tab from "./components/Tab"
import { useIndicatorDrag } from "./useIndicatorDrag"
import { useScrollScale } from "./useScrollScale"
import GradientMask from "./components/GradientMask"

const TabBarOverlay = ({
    tabs,
    activeIndex,
    onChange,
    onSnapToSame,
    playKey,
    compact,
    maxWidth,
}) => {
    const { overlayRef, animate, transition, handlers } = useIndicatorDrag({
        tabsLength: tabs.length,
        activeIndex,
        compact,
        spring: { type: "spring", stiffness: 800, damping: 50 },
        onSnapToSame,
        onSnapToNew: onChange,
    })

    return (
        <m.div
            className={styles.clipPathContainer}
            ref={overlayRef}
            style={{ maxWidth }}
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
                    compact={compact}
                    data-overlay
                    {...tab}
                />
            ))}
        </m.div>
    )
}

const TabBar = ({
    tabs,
    onChange,
    defaultIndex = 0,
    variant = "default",
    collapseOnScroll = false,
}) => {
    const { isApple } = useSkin()
    const compact = variant === "compact"
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const [replayNonce, setReplayNonce] = useState(0)

    useEffect(() => {
        setActiveIndex(defaultIndex)
    }, [defaultIndex])

    useEffect(() => {
        setActiveIndex((prev) => Math.min(prev, tabs.length - 1))
    }, [tabs.length])

    const rootRef = useRef(null)
    const { scale, expand } = useScrollScale(rootRef, collapseOnScroll)

    const handleSegmentClick = (index) => {
        expand()
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    const playKey = `${activeIndex}:${replayNonce}`

    const [rootWidth, setRootWidth] = useState(0)
    const [rootHeight, setRootHeight] = useState(0)
    const [viewportWidth, setViewportWidth] = useState(0)

    useResizeObserver(rootRef, (entry) => {
        setRootWidth(entry.contentRect.width)
        setRootHeight(entry.contentRect.height)
        setViewportWidth(document.documentElement.clientWidth)
    })

    const isThreeTabs = tabs.length === 3
    const marginX = isThreeTabs ? 54 : 21
    const maxTabWidth = compact ? 90 : undefined
    const maxTabsWidth = maxTabWidth ? tabs.length * maxTabWidth : undefined
    const maxRootWidth = maxTabsWidth ? maxTabsWidth + 8 : undefined
    const rootStyle = {
        "--tabbar-scroll-scale": scale,
        ...(isApple
            ? {
                  left: marginX,
                  right: marginX,
                  width: `calc(100% - ${marginX * 2}px)`,
              }
            : {}),
        ...(compact
            ? { maxWidth: maxRootWidth, marginInline: "auto" }
            : {}),
    }

    const maskSideInset =
        rootWidth > 0 && viewportWidth > rootWidth
            ? (viewportWidth - rootWidth) / 2
            : marginX

    const maskInsets = {
        top: 21,
        bottom: 21,
        left: maskSideInset,
        right: maskSideInset,
    }

    return (
        <m.div
            ref={rootRef}
            className={styles.root}
            whileTap={compact ? undefined : { scale: 1.02 }}
            transition={{
                scale: { type: "spring", stiffness: 800, damping: 40 },
            }}
            style={rootStyle}
            layout
        >
            <div className={styles.surface}>
                <div className={styles.content} style={{ maxWidth: maxTabsWidth }}>
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            isActive={index === activeIndex}
                            onClick={() => handleSegmentClick(index)}
                            playKey={playKey}
                            compact={compact}
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
                    compact={compact}
                    maxWidth={maxTabsWidth}
                />

                <Activity mode={isApple ? "visible" : "hidden"}>
                    <GlassBorder />
                </Activity>
            </div>

            <Activity mode={isApple ? "visible" : "hidden"}>
                <GradientMask
                    width={rootWidth}
                    height={rootHeight}
                    insets={maskInsets}
                    innerHeight={rootHeight}
                />
            </Activity>
        </m.div>
    )
}

TabBar.propTypes = {
    tabs: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    defaultIndex: PropTypes.number,
    variant: PropTypes.oneOf(["default", "compact"]),
    collapseOnScroll: PropTypes.bool,
}

TabBarOverlay.propTypes = {
    tabs: PropTypes.array.isRequired,
    activeIndex: PropTypes.number,
    onChange: PropTypes.func,
    onSnapToSame: PropTypes.func,
    playKey: PropTypes.string,
    compact: PropTypes.bool,
    maxWidth: PropTypes.number,
}

export default TabBar
