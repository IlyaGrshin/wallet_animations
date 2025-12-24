import { useState, useEffect, useMemo } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"
import Page from "../../../components/Page"

import NavigationPanel from "./components/NavigationPanel"
import { useAvatarUrl } from "./hooks/useAvatarUrl"
import { useSegmentNavigation } from "./hooks/useSegmentNavigation"

import TabBar from "../../../components/TabBar"
import { useApple } from "../../../hooks/DeviceProvider"
import { TRANSITIONS } from "../../../utils/animations"

import Wallet from "../Wallet"
import TONWallet from "../TS"
import Trading from "../Trading"
import History from "../History"

import WalletIcon from "../../../icons/tabbar/Wallet.svg?react"
import TradeIcon from "../../../icons/tabbar/Chartline.svg?react"
import HistoryIcon from "../../../icons/tabbar/Clock.svg?react"

import lottieIconWallet from "../../../icons/lottie/wallet"
import lottieIconChartline from "../../../icons/lottie/chartline"
import lottieIconBag from "../../../icons/lottie/bag"
import lottieIconClock from "../../../icons/lottie/clock"

import * as styles from "./NewNavigation.module.scss"

// Tab configuration
const TABS_CONFIG = {
    wallet: [
        {
            label: "Wallet",
            icon: <WalletIcon />,
            view: <Wallet />,
            lottieIcon: lottieIconWallet,
            activeSegment: [0, 50],
        },
        {
            label: "Trade",
            icon: <TradeIcon />,
            view: <Trading />,
            lottieIcon: lottieIconChartline,
            activeSegment: [0, 50],
        },
        {
            label: "Earn",
            view: <Trading />,
            lottieIcon: lottieIconBag,
            activeSegment: [0, 45],
        },
        {
            label: "History",
            icon: <HistoryIcon />,
            view: <History />,
            lottieIcon: lottieIconClock,
            activeSegment: [0, 80],
        },
    ],
    ton: [
        {
            label: "TON Space",
            icon: <WalletIcon />,
            view: <TONWallet />,
            lottieIcon: lottieIconWallet,
        },
        {
            label: "Activity",
            icon: <HistoryIcon />,
            view: <History />,
            lottieIcon: lottieIconClock,
        },
        {
            label: "Browser",
            icon: <TradeIcon />,
            view: <Trading />,
            lottieIcon: lottieIconChartline,
        },
    ],
}

const variants = {
    initial: ({ isSegmentSwitch, direction, isApple }) => {
        if (isSegmentSwitch) return { opacity: 0, scale: 1.006, x: 0 }

        if (isApple) {
            return {
                opacity: 0,
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
                x: 0,
            }
        }
        return { opacity: 0, x: `${3 * direction}%`, scale: 1 }
    },
    animate: ({ isSegmentSwitch, isApple }) => {
        if (isSegmentSwitch) {
            return {
                opacity: 1,
                scale: 1,
                x: 0,
                transition: { duration: 0.2, ease: "easeOut" },
            }
        }

        if (isApple) {
            return {
                opacity: 1,
                scale: 1,
                x: 0,
                transition: {
                    scale: { duration: 0.15, ease: [0.38, 0.7, 0.125, 1.0] },
                    opacity: { duration: 0.1, ease: "easeInOut" },
                },
            }
        }
        return {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: TRANSITIONS.MATERIAL_STANDARD,
        }
    },
    exit: ({ isSegmentSwitch, direction, isApple }) => {
        if (isSegmentSwitch) {
            return {
                opacity: 0,
                scale: 1.01,
                x: 0,
                transition: { duration: 0.2, ease: "easeOut" },
            }
        }

        if (isApple) {
            return {
                opacity: 0,
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
                x: 0,
                transition: {
                    scale: { duration: 0.15, ease: [0.38, 0.7, 0.125, 1.0] },
                    opacity: { duration: 0.1, ease: "easeInOut" },
                },
            }
        }
        return {
            opacity: 0,
            x: `${3 * direction}%`,
            scale: 1,
            transition: TRANSITIONS.MATERIAL_STANDARD,
        }
    },
}

function NewNavigation() {
    const { activeSegment, handleSegmentChange: originalHandleSegmentChange } =
        useSegmentNavigation()
    const avatarUrl = useAvatarUrl()

    const currentPrefix = activeSegment === 0 ? "wallet" : "ton"
    const [prevPrefix, setPrevPrefix] = useState(currentPrefix)

    const handleSegmentChange = (index) => {
        setPrevPrefix(currentPrefix)
        originalHandleSegmentChange(index)
    }

    // Tab State
    const [tabIndices, setTabIndices] = useState({ wallet: 0, ton: 0 })
    const [prevIndices, setPrevIndices] = useState({ wallet: 0, ton: 0 })

    const activeTabs =
        activeSegment === 0 ? TABS_CONFIG.wallet : TABS_CONFIG.ton
    const activeIndex = activeSegment === 0 ? tabIndices.wallet : tabIndices.ton
    const previousIndex =
        activeSegment === 0 ? prevIndices.wallet : prevIndices.ton

    const currentView = activeTabs[activeIndex]?.view || null
    const currentKey = `${currentPrefix}-${activeIndex}`
    const isSegmentSwitch = prevPrefix !== currentPrefix
    const isFirstTab = activeIndex === 0
    const direction = previousIndex < activeIndex ? 1 : -1

    // Reset segment switch state after animation
    useEffect(() => {
        if (isSegmentSwitch) {
            const timer = setTimeout(() => setPrevPrefix(currentPrefix), 500)
            return () => clearTimeout(timer)
        }
    }, [currentPrefix, isSegmentSwitch])

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
        }
    }, [])

    const animationCustom = useMemo(
        () => ({
            isSegmentSwitch,
            direction,
            isApple: useApple,
        }),
        [isSegmentSwitch, direction]
    )

    return (
        <Page headerColor={WebApp.themeParams.section_bg_color?.slice(1)}>
            <BackButton />

            <div className={styles.container}>
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={animationCustom}
                    inherit={false}
                >
                    <m.div
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        custom={animationCustom}
                        key={currentKey}
                        className={styles.view}
                    >
                        <div
                            style={{ position: "relative", minHeight: "100%" }}
                        >
                            {isFirstTab && (
                                <div className={styles.navigationWrapper}>
                                    <NavigationPanel
                                        avatarUrl={avatarUrl}
                                        activeSegment={activeSegment}
                                        onSegmentChange={handleSegmentChange}
                                    />
                                </div>
                            )}
                            {currentView}
                        </div>
                    </m.div>
                </AnimatePresence>
            </div>

            <div className={styles.tabBarWrapper}>
                <div style={{ pointerEvents: "auto" }}>
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
