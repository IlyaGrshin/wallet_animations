import { use } from "react"
import { BackButton } from "@twa-dev/sdk/react"

import Page from "../../../components/Page"
import NativePageTransition from "../../../components/NativePageTransition"

import ImageAvatar from "../../../components/ImageAvatar"
import Text from "../../../components/Text"
import { RegularButton, MultilineButton } from "../../../components/Button"

import { useAccentColor } from "../../../hooks/useAccentColor"

import ArrowUpCircleFill from "../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowDownCircleFill from "../../../icons/28/Arrow Down Circle Fill.svg?react"
import PlusCircleFill from "../../../icons/28/Plus Circle Fill.svg?react"
import ArrowLeftAndRightCircleFill from "../../../icons/28/Arrow Left & Right Circle Fill.svg?react"

import * as styles from "./ColorAssetPage.module.scss"

const fetchAssets = async () => {
    const response = await fetch("https://ilyagrshn.com/coingeckoApi/index.php")
    return response.json()
}

const assetsResource = fetchAssets()

function Banner({ name }) {
    const BannerText = `Currently, ${name} can only be purchased, held and sold within Wallet. It is not possible to transfer, receive or withdraw ${name} externally.`
    return (
        <div className={styles.bannerContainer}>
            <Text
                apple={{ variant: "subheadline2" }}
                material={{ variant: "subtitle2" }}
                className={styles.banner}
            >
                {BannerText}
            </Text>
        </div>
    )
}

function ActionButtons({ mode }) {
    const custodyButtons = [
        {
            icon: <ArrowUpCircleFill />,
            name: "Transfer",
        },
        {
            icon: <ArrowDownCircleFill />,
            name: "Deposit",
        },
        {
            icon: <PlusCircleFill />,
            name: "Withdraw",
        },
        {
            icon: <ArrowLeftAndRightCircleFill />,
            name: "Exchange",
        },
    ]

    const tradeButtons = [
        {
            icon: <PlusCircleFill />,
            name: "Buy",
        },
        {
            icon: <ArrowLeftAndRightCircleFill />,
            name: "Sell",
        },
    ]

    if (mode === "trade") {
        return (
            <div className={styles.buttons}>
                {tradeButtons.map((button, index) => (
                    <RegularButton
                        variant="tinted"
                        icon={button.icon}
                        label={button.name}
                        isFill={true}
                        key={index}
                        style={{
                            color: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.16)",
                        }}
                    />
                ))}
            </div>
        )
    }

    if (mode === "custody") {
        return (
            <div className={styles.buttons}>
                {custodyButtons.map((button, index) => (
                    <MultilineButton
                        variant="tinted"
                        icon={button.icon}
                        label={button.name}
                        key={index}
                        style={{
                            color: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.16)",
                        }}
                    />
                ))}
            </div>
        )
    }
}

function AssetSection({ mode, image, name, price, ticker }) {
    const accentColor = useAccentColor(image)

    return (
        <section
            className={styles.root}
            style={{
                backgroundColor: `oklch(from ${accentColor} calc(l * .9) c h)`,
            }}
        >
            {mode === "trade" ? <Banner name={name} /> : null}
            <div className={styles.body}>
                <ImageAvatar size={72} src={image} />
                {/* Add MaterialSize to ImageAvatar ?*/}
                <div className={styles.data}>
                    <Text
                        apple={{ variant: "title3", weight: "semibold" }}
                        material={{ variant: "headline7" }}
                    >
                        {name}
                    </Text>
                    <Text
                        apple={{ variant: "title2", weight: "semibold" }}
                        material={{ variant: "headline7" }}
                    >
                        ${price}
                    </Text>
                    <Text
                        apple={{ variant: "subheadline1", weight: "regular" }}
                        material={{ variant: "headline7" }}
                    >
                        {ticker}
                    </Text>
                </div>
            </div>
            <ActionButtons mode={mode} />
        </section>
    )
}

function ColorAssetPage() {
    const assets = use(assetsResource)

    return (
        <>
            <BackButton />
            <Page>
                <NativePageTransition>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        {assets.map((asset, index) => (
                            <AssetSection
                                mode="trade"
                                image={asset.image}
                                name={asset.name}
                                price={asset.current_price}
                                ticker={asset.symbol?.toUpperCase()}
                                key={index}
                            />
                        ))}
                    </div>
                </NativePageTransition>
            </Page>
        </>
    )
}

export default ColorAssetPage
