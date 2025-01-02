import React, { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

import "./index.css"
import WebApp from "@twa-dev/sdk"

import SegmentedControl from "../../Components/SegmentedControl"
import { ReactComponent as QRCodeIcon } from "../../Icons/28/QR Code.svg"
import { BackButton } from "@twa-dev/sdk/react"
import DefaultAvatar from "../../Icons/Avatars/IlyaG.png"
import TonSpaceSkeleton from "../TS Skeleton"

const Wallet = React.lazy(() => import("../../Pages/Wallet"))
const TONSpace = React.lazy(() => import("../../Pages/TS"))

const useAvatarUrl = () => {
    try {
        const initData = new URLSearchParams(WebApp.initData)
        const userData = initData.get("user")

        return initData ? JSON.parse(userData).photo_url : DefaultAvatar
    } catch (error) {
        // console.error('Error parsing initData or userData:', error);
        return DefaultAvatar
    }
}

const useSegmentNavigation = () => {
    const [activeSegment, setActiveSegment] = useState(0)
    const [view, setView] = useState("wallet")

    useEffect(() => {
        if (WebApp.initData) {
            WebApp.onEvent("backButtonClicked", () => {
                WebApp.setHeaderColor("secondary_bg_color")
                WebApp.setBackgroundColor("secondary_bg_color")
            })
        } else {
            document.body.style.backgroundColor =
                "var(--tg-theme-secondary-bg-color)"
        }
    })

    const handleSegmentChange = (index) => {
        if (index === 1) {
            setView("tonspace")
        } else if (index === 0) {
            setView("wallet")
        }

        WebApp.HapticFeedback.selectionChanged()
        setActiveSegment(index)
    }

    return { activeSegment, view, handleSegmentChange }
}

function NewNavigation() {
    const { activeSegment, view, handleSegmentChange } = useSegmentNavigation()
    const avatarUrl = useAvatarUrl()

    const content = useMemo(() => {
        switch (view) {
            case "wallet":
                return (
                    // <Suspense>
                    <Wallet />
                    // </Suspense>
                )
            case "tonspace":
                return (
                    // <Suspense fallback={<TonSpaceSkeleton />}>
                    <TONSpace />
                    // </Suspense>
                )
            default:
                return <Wallet />
        }
    }, [view])

    return (
        <>
            <BackButton />
            <div className="navPanel">
                <div className="bounds transparent">
                    <div
                        className="avatar"
                        style={{ backgroundImage: `url(${avatarUrl})` }}
                    ></div>
                </div>
                <SegmentedControl
                    segments={["Wallet", "TON Space"]}
                    onChange={handleSegmentChange}
                    colorScheme={activeSegment === 1 ? "dark" : "light"}
                    type="mainPage"
                    style={{ width: "200px" }}
                />
                <div
                    className="bounds"
                    data-color-scheme={activeSegment === 1 ? "dark" : "light"}
                >
                    <QRCodeIcon />
                </div>
            </div>
            <AnimatePresence mode="popLayout" initial={false} custom={view}>
                <motion.div
                    initial={{ opacity: 0, scale: 1.006 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    key={view}
                    transition={{
                        duration: 0.2,
                        ease: "easeOut",
                    }}
                    className="pageView"
                >
                    {content}
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default NewNavigation
