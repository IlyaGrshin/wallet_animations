import { useState, useEffect, useCallback, memo } from "react"

import Page from "../../../components/Page"
import Gallery from "../../../components/Gallery"
import SectionHeader from "../../../components/SectionHeader"
import StartView from "../../../components/StartView"
import { RegularButton } from "../../../components/Button"
import NativePageTransition from "../../../components/NativePageTransition"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

import * as styles from "./Onboarding.module.scss"

const GalleryPages = [
    {
        imageClass: styles.coin,
        title: "Your TON Wallet",
        description:
            "Get access to all the features of TON blockchain directly in Telegram",
    },
    {
        imageClass: styles.disk,
        title: "Secure Ownership",
        description:
            "You have complete control of the Toncoin, collectibles, and jettons in your TON Wallet",
    },
    {
        imageClass: styles.planet,
        title: "Your Gateway to TON",
        description: "Access decentralized applications with your TON Wallet",
    },
]

const GalleryPage = ({ imageClass, title, description }) => (
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

    const handlePageChange = useCallback(
        (page) => {
            setCurrentPage(page)
        },
        [setCurrentPage]
    )

    useEffect(() => {
        WebApp.disableVerticalSwipes()
        const handleBackButton = () => {
            WebApp.enableVerticalSwipes()
        }

        WebApp.onEvent("backButtonClicked", handleBackButton)

        return () => {
            WebApp.offEvent("backButtonClicked", handleBackButton)
        }
    }, [])

    return (
        <NativePageTransition>
            <Page headerColor="131314">
                <BackButton />
                <Gallery onPageChange={handlePageChange}>
                    {GalleryPages.map(
                        ({ imageClass, title, description }, index) => (
                            <GalleryPage
                                key={index}
                                imageClass={imageClass}
                                title={title}
                                description={description}
                            />
                        )
                    )}
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
            </Page>
        </NativePageTransition>
    )
}

export default memo(Onboarding)
