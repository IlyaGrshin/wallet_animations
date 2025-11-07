import { useEffect, useState } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import { TRANSITIONS } from "../../../utils/animations"

import TabBar from "../../../components/TabBar"

import * as styles from "./TabBarPage.module.scss"

import { useApple } from "../../../hooks/DeviceProvider"

import Wallet from "../Wallet"
import Trading from "../Trading"
import History from "../History"

import WalletIcon from "../../../icons/tabbar/Wallet.svg?react"
import TradeIcon from "../../../icons/tabbar/Chartline.svg?react"
import HistoryIcon from "../../../icons/tabbar/Clock.svg?react"

import lottieIconWallet from ".././../../icons/lottie/wallet.json"
import lottieIconTrade from ".././../../icons/lottie/trade.json"
import lottieIconEarn from ".././../../icons/lottie/earn.json"
import lottieIconHistory from ".././../../icons/lottie/history.json"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

const tabs = [
    {
        label: "Crypto Wallet",
        path: "/tabbar/",
        icon: <WalletIcon />,
        view: <Wallet />,
        lottieIcon: lottieIconWallet,
    },
    {
        label: "Trade",
        path: "/tabbar/tab2",
        icon: <TradeIcon />,
        view: <Trading />,
        lottieIcon: lottieIconTrade,
    },
    {
        label: "Earn",
        path: "/tabbar/tab3",
        // icon: <TradeIcon />,
        view: <Trading />,
        lottieIcon: lottieIconEarn,
    },
    {
        label: "History",
        path: "/tabbar/tab4",
        icon: <HistoryIcon />,
        view: <History />,
        lottieIcon: lottieIconHistory,
    },
]

const useTabNavigation = () => {
    const [activeIndex, setActiveTab] = useState(0)
    const [view, setView] = useState(tabs[0].path)
    const [previousIndex, setPreviousIndex] = useState(0)

    const handleTabChange = (index) => {
        setPreviousIndex(activeIndex)
        setView(tabs[index].path)
        setActiveTab(index)
    }
    return { activeIndex, previousIndex, view, handleTabChange }
}

const TabBarPage = () => {
    const { activeIndex, previousIndex, view, handleTabChange } =
        useTabNavigation()

    const direction = () => {
        return previousIndex < activeIndex ? 1 : -1
    }

    const animationConfigs = {
        apple: {
            initial: {
                opacity: 0,
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
            },
            animate: {
                opacity: 1,
                scale: 1,
            },
            exit: {
                opacity: 0,
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
            },
            transition: {
                scale: {
                    duration: 0.15,
                    ease: [0.38, 0.7, 0.125, 1.0],
                },
                opacity: {
                    duration: 0.1,
                    ease: "easeInOut",
                },
            },
        },
        material: {
            initial: {
                opacity: 0,
                x: `${3 * direction()}%`,
            },
            animate: {
                opacity: 1,
                x: 0,
            },
            exit: {
                opacity: 0,
                x: `${3 * direction()}%`,
            },
            transition: TRANSITIONS.MATERIAL_STANDARD,
        },
    }

    const getAnimationConfig = () => {
        const platform = useApple ? "apple" : "material"
        return animationConfigs[platform]
    }

    const animationConfig = getAnimationConfig()

    const content = tabs[activeIndex]?.view || null

    useEffect(() => {
        WebApp.disableVerticalSwipes()
        document.body.style.overflow = "hidden"
    }, [])

    return (
        <>
            <BackButton />
            <div className={styles.container}>
                <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={view}
                    inherit={false}
                >
                    <m.div
                        initial={animationConfig.initial}
                        animate={animationConfig.animate}
                        exit={animationConfig.exit}
                        key={view}
                        transition={animationConfig.transition}
                        className={styles.view}
                    >
                        {content}
                    </m.div>
                </AnimatePresence>
            </div>
            <TabBar tabs={tabs} onChange={handleTabChange} />
        </>
    )
}

export default TabBarPage
