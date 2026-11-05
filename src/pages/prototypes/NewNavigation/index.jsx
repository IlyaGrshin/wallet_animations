import { useState, useEffect } from "react"
import { Route, Switch, useLocation } from "wouter"
import WebApp, { BackButton, lockVerticalSwipes } from "../../../lib/twa"
import { useFrozenLocation } from "../../../components/PageTransition/context"
import useRetainedState from "../../../hooks/useRetainedState"
import Page from "../../../components/Page"

import { useSegmentNavigation } from "./hooks/useSegmentNavigation"
import { useKeepAliveTabs } from "./hooks/useKeepAliveTabs"
import SearchHeader from "./components/SearchHeader"
import TabLayer from "./components/TabLayer"

import TabBar from "../../../components/TabBar"
import { useSkin } from "../../../hooks/DeviceProvider"
import { getTabsConfig } from "./navigationConfig"
import Asset from "./Asset"
import { ASSET_PATH, assetPath } from "./Asset/constants"

import * as styles from "./NewNavigation.module.scss"

function Tabs() {
    const { isApple } = useSkin()
    const [, navigate] = useLocation()
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

    const openAsset = (id) => navigate(assetPath(id))
    const tabsConfig = getTabsConfig(openTonWallet, openAsset)

    // Tab state outlives a trip to an asset page and back.
    const [tabIndices, setTabIndices] = useRetainedState("tabs", {
        wallet: 0,
        ton: 0,
    })
    const [prevIndices, setPrevIndices] = useState(tabIndices)

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
        const releaseSwipes = lockVerticalSwipes()
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
            // Restore swipes on unmount too: in split-view the prototype can be
            // left via the sidebar without ever hitting the BackButton.
            releaseSwipes()
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
                            retainKey={key}
                            status={statusOf(key)}
                            custom={animationCustom}
                            animateMount={key !== visited[0]}
                            onExited={() => markExited(key)}
                        >
                            {prefix === "wallet" && (
                                <SearchHeader
                                    heroColor={
                                        tabsConfig[prefix][index]?.heroColor
                                    }
                                />
                            )}
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

// Tabs, or an asset page pushed over them. Routes match the location this
// screen was mounted for, so an exiting screen keeps its content mid-fade.
function NewNavigation() {
    const [liveLocation] = useLocation()
    const location = useFrozenLocation() ?? liveLocation

    return (
        <Switch location={location}>
            <Route path={ASSET_PATH}>
                {(params) => <Asset id={params.id} />}
            </Route>
            <Route>
                <Tabs />
            </Route>
        </Switch>
    )
}

export default NewNavigation
