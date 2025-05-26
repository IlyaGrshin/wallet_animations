import React, { useState, useMemo, useEffect } from "react"

import * as styles from "./NewNav.module.scss"
import WebApp from "@twa-dev/sdk"

import SegmentedControl from "../../../components/SegmentedControl"
import { ReactComponent as QRCodeIcon } from "../../../icons/28/QR Code.svg"
import { BackButton } from "@twa-dev/sdk/react"
import DefaultAvatar from "../../../icons/avatars/IlyaG.png"
import TonSpaceSkeleton from "../TS Skeleton"
import NativePageTransition from "../../../components/NativePageTransition"

import Wallet from "../Wallet"
import TONSpace from "../TS"

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
        const newView = index === 1 ? "tonspace" : "wallet"

        // Используем View Transition API если доступен
        if (document.startViewTransition && newView !== view) {
            document.startViewTransition(() => {
                setView(newView)
                setActiveSegment(index)
            })
        } else {
            setView(newView)
            setActiveSegment(index)
        }

        WebApp.HapticFeedback.selectionChanged()
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
            <NativePageTransition>
                <div className={styles.navPanel}>
                    <div className={`${styles.bounds} ${styles.transparent}`}>
                        <div
                            className={styles.avatar}
                            style={{ backgroundImage: `url(${avatarUrl})` }}
                        ></div>
                    </div>
                    <SegmentedControl
                        segments={["Wallet", "TON Space"]}
                        onChange={handleSegmentChange}
                        colorScheme={activeSegment === 1 ? "dark" : "light"}
                        type="circled"
                        style={{ width: "200px" }}
                    />
                    <div
                        className={styles.bounds}
                        data-color-scheme={
                            activeSegment === 1 ? "dark" : "light"
                        }
                    >
                        <QRCodeIcon />
                    </div>
                </div>
                <div
                    className={styles.pageView}
                    style={{ viewTransitionName: "page-content" }}
                >
                    {content}
                </div>
            </NativePageTransition>
        </>
    )
}

export default NewNavigation
