import React, { useState, useEffect, useCallback } from "react"

import Gallery from "../../components/Gallery"
import SectionHeader from "../../components/SectionHeader"
import StartView from "../../components/StartView"
import PageTransition from "../../components/PageTransition"
import { RegularButton } from "../../components/Button"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

import * as styles from "./Onboarding.module.scss"

const pages = [
    {
        imageClass: styles.coin,
        title: "Your TON Space",
        description:
            "Get access to all the features of TON blockchain directly in Telegram",
    },
    {
        imageClass: styles.disk,
        title: "Secure Ownership",
        description:
            "You have complete control of the Toncoin, collectibles, and jettons in your TON Space",
    },
    {
        imageClass: styles.planet,
        title: "Your Gateway to TON",
        description: "Access decentralized applications with your TON Space",
    },
]

const Page = ({ imageClass, title, description }) => (
    <div className={styles.root}>
        <div className={styles.cover}>
            <div className={`${styles.image} ${imageClass}`}></div>
        </div>
        <div className={styles.content}>
            <StartView title={title} description={description} />
        </div>
    </div>
)

const Onboarding = () => {
    const [, setCurrentPage] = useState(0)

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page)
    }, [])

    useEffect(() => {
        WebApp.setHeaderColor("#131314")
        WebApp.disableVerticalSwipes()
        const handleBackButton = () => {
            WebApp.setHeaderColor("secondary_bg_color")
            WebApp.enableVerticalSwipes()
        }

        WebApp.onEvent("backButtonClicked", handleBackButton)

        return () => {
            WebApp.offEvent("backButtonClicked", handleBackButton)
        }
    }, [])

    return (
        <PageTransition>
            <BackButton />
            <Gallery onPageChange={handlePageChange}>
                {pages.map(({ imageClass, title, description }, index) => (
                    <Page
                        key={index}
                        imageClass={imageClass}
                        title={title}
                        description={description}
                    />
                ))}
            </Gallery>
            <div className={styles.BottomButtons}>
                <RegularButton
                    variant="filled"
                    label="Start exploring TON"
                    isFill
                    isShine
                />
                <RegularButton
                    variant="tinted"
                    label="Add Existing Wallet"
                    isFill
                />
                <SectionHeader
                    type="Footer"
                    title="By continuing you agree to Terms of Service and User Agreement."
                    style={{ textAlign: "center" }}
                />
            </div>
        </PageTransition>
    )
}

export default React.memo(Onboarding)
