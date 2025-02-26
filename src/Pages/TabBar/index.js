import React, { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"

import TabBar from "../../components/Tabbar"

import * as styles from "./TabBarPage.module.scss"

import Wallet from "../Wallet"
import TONSpace from "../TS"
import UI from "../UI"

import { ReactComponent as WalletIcon } from "../../icons/tabbar/Wallet.svg"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

const tabs = [
    {
        label: "Label",
        path: "/tabbar/",
        icon: <WalletIcon />,
        view: <Wallet />,
    },
    {
        label: "Label",
        path: "/tabbar/tab2",
        icon: <WalletIcon />,
        view: <TONSpace />,
    },
    {
        label: "Label",
        path: "/tabbar/tab3",
        icon: <WalletIcon />,
        view: <UI />,
    },
]

const useTabNavigation = () => {
    const [activeIndex, setActiveTab] = useState(0)
    const [view, setView] = useState("wallet")

    const handleTabChange = (index) => {
        setView(tabs[index].label || "wallet")
        setActiveTab(index)
    }
    return { activeIndex, view, handleTabChange }
}

const TabBarPage = () => {
    const { activeIndex, view, handleTabChange } = useTabNavigation()

    const content = useMemo(() => {
        return tabs[activeIndex]?.view || null
    }, [activeIndex])

    useEffect(() => {
        WebApp.disableVerticalSwipes()
        document.body.style.overflow = "hidden"
    }, [])

    return (
        <>
            <BackButton />
            <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={view}
                inherit={false}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale:
                            (window.innerHeight -
                                3.0 * window.devicePixelRatio) /
                            window.innerHeight, // targetScale
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    exit={{
                        scale:
                            (window.innerHeight -
                                3.0 * window.devicePixelRatio) /
                            window.innerHeight, // targetScale
                    }}
                    key={view}
                    transition={{
                        scale: {
                            duration: 0.15,
                            ease: [0.38, 0.7, 0.125, 1.0],
                        },
                        opacity: {
                            duration: 0.1,
                            ease: "easeInOut",
                        },
                    }}
                    className={styles.view}
                >
                    {content}
                </motion.div>
            </AnimatePresence>

            <TabBar tabs={tabs} onChange={handleTabChange} />
        </>
    )
}

export default React.memo(TabBarPage)
