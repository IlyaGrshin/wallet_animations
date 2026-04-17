import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import ImageAvatar from "../ImageAvatar"
import Tabs from "./"

import { getAssetIcon } from "../../utils/AssetsMap"
import { BackButton } from "../../lib/twa"

import data from "./Tabs.showcase.data.json"
import * as styles from "./Tabs.showcase.module.scss"

const SLIDE_DISTANCE = 24

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
        x: direction > 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
        opacity: 0,
    }),
}

const TabContent = ({ activeIndex, children }) => {
    const reduceMotion = useReducedMotion()
    const [state, setState] = useState({ prev: activeIndex, direction: 0 })

    if (state.prev !== activeIndex) {
        setState({ prev: activeIndex, direction: activeIndex - state.prev })
    }
    const { direction } = state

    const innerRef = useRef(null)
    const [height, setHeight] = useState(null)

    useLayoutEffect(() => {
        const el = innerRef.current
        if (!el) return
        const update = () => setHeight(el.offsetHeight)
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const slideTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: [0.23, 1, 0.32, 1] }
    const heightTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.3, ease: [0.23, 1, 0.32, 1] }

    return (
        <motion.div
            style={{ overflow: "hidden" }}
            initial={false}
            animate={height == null ? undefined : { height }}
            transition={heightTransition}
        >
            <div ref={innerRef}>
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={direction}
                >
                    <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={slideTransition}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

TabContent.propTypes = {
    activeIndex: PropTypes.number.isRequired,
    children: PropTypes.node,
}

const TokenList = ({ rows }) => (
    <>
        {rows.map(({ ticker, name, subtitle, primary, secondary }) => (
            <Cell
                key={`${ticker}-${name}`}
                start={<ImageAvatar src={getAssetIcon(ticker)} />}
                end={<Cell.Text title={primary} description={secondary} />}
            >
                <Cell.Text title={name} description={subtitle} bold />
            </Cell>
        ))}
    </>
)

TokenList.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const TabsShowcase = () => {
    const [tradingIndex, setTradingIndex] = useState(0)
    const [categoryIndex, setCategoryIndex] = useState(0)
    const [rangeIndex, setRangeIndex] = useState(0)
    const [overviewIndex, setOverviewIndex] = useState(0)
    const [glassIndex, setGlassIndex] = useState(1)

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item header="Trading">
                        <Tabs
                            tabs={data.trading.tabs}
                            activeTabIndex={tradingIndex}
                            onChange={setTradingIndex}
                            scrollable
                        />
                        <TabContent activeIndex={tradingIndex}>
                            <TokenList rows={data.trading.data[tradingIndex]} />
                        </TabContent>
                    </SectionList.Item>

                    <SectionList.Item header="Scrollable">
                        <Tabs
                            tabs={data.category.tabs}
                            activeTabIndex={categoryIndex}
                            onChange={setCategoryIndex}
                            scrollable
                        />
                        <TabContent activeIndex={categoryIndex}>
                            <TokenList
                                rows={data.category.data[categoryIndex]}
                            />
                        </TabContent>
                    </SectionList.Item>

                    <SectionList.Item header="Compact">
                        <Tabs
                            tabs={data.range.tabs}
                            activeTabIndex={rangeIndex}
                            onChange={setRangeIndex}
                            variant="compact"
                            scrollable
                        />
                        <TabContent activeIndex={rangeIndex}>
                            <TokenList rows={data.range.data[rangeIndex]} />
                        </TabContent>
                    </SectionList.Item>

                    <SectionList.Item header="Few Tabs">
                        <Tabs
                            tabs={data.overview.tabs}
                            activeTabIndex={overviewIndex}
                            onChange={setOverviewIndex}
                        />
                        <TabContent activeIndex={overviewIndex}>
                            <TokenList
                                rows={data.overview.data[overviewIndex]}
                            />
                        </TabContent>
                    </SectionList.Item>

                    <section>
                        <div className={styles.glassHeader}>
                            <Tabs
                                tabs={data.glass.tabs}
                                activeTabIndex={glassIndex}
                                onChange={setGlassIndex}
                                variant="glass"
                                scrollable
                            />
                        </div>
                        <div className={styles.sectionContainer}>
                            <TabContent activeIndex={glassIndex}>
                                <TokenList rows={data.glass.data[glassIndex]} />
                            </TabContent>
                        </div>
                    </section>
                </SectionList>
            </Page>
        </>
    )
}

export default TabsShowcase
