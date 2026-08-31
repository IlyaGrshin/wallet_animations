import { useState, useEffect } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import cx from "clsx"
import WebApp, { BackButton } from "../../../lib/twa"
import Page from "../../../components/Page"

import { useSegmentNavigation } from "./hooks/useSegmentNavigation"
import SearchHeader from "./components/SearchHeader"
import { useScrolled } from "../../../hooks/useScrolled"

import TabBar from "../../../components/TabBar"
import { useSkin } from "../../../hooks/DeviceProvider"
import { getTabsConfig, pageVariants } from "./navigationConfig"

import * as styles from "./NewNavigation.module.scss"

function NewNavigation() {
    const { isApple, skin } = useSkin()
    const { activeSegment, handleSegmentChange } = useSegmentNavigation()
    const [headerRef, headerScrolled] = useScrolled(activeSegment === 0)
    const currentPrefix = activeSegment === 0 ? "wallet" : "ton"
    const [prevPrefix, setPrevPrefix] = useState(currentPrefix)

    // The segment-switch animation reads prevPrefix; let it catch up once the
    // transition has played.
    useEffect(() => {
        const timer = setTimeout(() => setPrevPrefix(currentPrefix), 500)

        return () => clearTimeout(timer)
    }, [currentPrefix])

    // TON Wallet is a history entry, so browser back, swipe back and the
    // Telegram back button all return to the Wallet segment.
    const openTonWallet = () => {
        window.history.pushState({ tonWallet: true }, "")
        handleSegmentChange(1)
    }

    useEffect(() => {
        if (activeSegment !== 1) return

        const returnToWallet = () => handleSegmentChange(0)

        window.addEventListener("popstate", returnToWallet)

        return () => window.removeEventListener("popstate", returnToWallet)
    }, [activeSegment, handleSegmentChange])

    const tabsConfig = getTabsConfig(skin, openTonWallet)

    // Tab State
    const [tabIndices, setTabIndices] = useState({ wallet: 0, ton: 0 })
    const [prevIndices, setPrevIndices] = useState({ wallet: 0, ton: 0 })

    const activeTabs = activeSegment === 0 ? tabsConfig.wallet : tabsConfig.ton
    const activeIndex = activeSegment === 0 ? tabIndices.wallet : tabIndices.ton
    const previousIndex =
        activeSegment === 0 ? prevIndices.wallet : prevIndices.ton

    const currentView = activeTabs[activeIndex]?.view || null
    const currentKey = `${currentPrefix}-${activeIndex}`
    const isSegmentSwitch = prevPrefix !== currentPrefix
    const direction = previousIndex < activeIndex ? 1 : -1

    const handleTabChange = (index) => {
        const key = activeSegment === 0 ? "wallet" : "ton"
        setPrevIndices((prev) => ({ ...prev, [key]: tabIndices[key] }))
        setTabIndices((prev) => ({ ...prev, [key]: index }))
    }

    // Prevent vertical swipes
    useEffect(() => {
        WebApp.disableVerticalSwipes()
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
            // Restore swipes on unmount too: in split-view the prototype can be
            // left via the sidebar without ever hitting the BackButton.
            WebApp.enableVerticalSwipes()
        }
    }, [])

    const animationCustom = { isSegmentSwitch, direction, isApple }

    return (
        <Page headerColor={WebApp.themeParams.section_bg_color?.slice(1)}>
            <BackButton
                onClick={
                    activeSegment === 1
                        ? () => window.history.back()
                        : undefined
                }
            />

            <div className={styles.container}>
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={animationCustom}
                    inherit={false}
                >
                    <m.div
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        custom={animationCustom}
                        key={currentKey}
                        className={styles.view}
                    >
                        <div className={styles.viewBody}>
                            {activeSegment === 0 && (
                                <div
                                    ref={headerRef}
                                    className={cx(
                                        styles.searchHeader,
                                        headerScrolled && styles.scrolled
                                    )}
                                >
                                    <SearchHeader />
                                </div>
                            )}
                            {currentView}
                        </div>
                    </m.div>
                </AnimatePresence>
            </div>

            <div className={styles.tabBarWrapper}>
                <div className={styles.tabBarHit}>
                    <TabBar
                        tabs={activeTabs}
                        onChange={handleTabChange}
                        defaultIndex={activeIndex}
                    />
                </div>
            </div>
        </Page>
    )
}

export default NewNavigation
