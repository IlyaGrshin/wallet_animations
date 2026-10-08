import { useState, useEffect } from "react"
import WebApp, { BackButton } from "../../../lib/twa"
import Page from "../../../components/Page"

import { useSegmentNavigation } from "./hooks/useSegmentNavigation"
import { useKeepAliveTabs } from "./hooks/useKeepAliveTabs"
import SearchHeader from "./components/SearchHeader"
import TabLayer from "./components/TabLayer"

import TabBar from "../../../components/TabBar"
import { useSkin } from "../../../hooks/DeviceProvider"
import { getTabsConfig } from "./navigationConfig"

import * as styles from "./NewNavigation.module.scss"

function NewNavigation() {
    const { isApple } = useSkin()
    const { activeSegment, handleSegmentChange } = useSegmentNavigation()
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

    const tabsConfig = getTabsConfig(openTonWallet)

    // Tab State
    const [tabIndices, setTabIndices] = useState({ wallet: 0, ton: 0 })
    const [prevIndices, setPrevIndices] = useState({ wallet: 0, ton: 0 })

    const activeTabs = activeSegment === 0 ? tabsConfig.wallet : tabsConfig.ton
    const activeIndex = activeSegment === 0 ? tabIndices.wallet : tabIndices.ton
    const previousIndex =
        activeSegment === 0 ? prevIndices.wallet : prevIndices.ton

    const currentKey = `${currentPrefix}-${activeIndex}`
    const { visited, statusOf, markExited } = useKeepAliveTabs(currentKey)
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
                {visited.map((key) => {
                    const [prefix, index] = key.split("-")
                    return (
                        <TabLayer
                            key={key}
                            status={statusOf(key)}
                            custom={animationCustom}
                            animateMount={key !== visited[0]}
                            onExited={() => markExited(key)}
                        >
                            {prefix === "wallet" && <SearchHeader />}
                            {tabsConfig[prefix][index]?.view}
                        </TabLayer>
                    )
                })}
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
