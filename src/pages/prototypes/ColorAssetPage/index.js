import PropTypes from "prop-types"
import { BackButton } from "../../../lib/twa"

import Page from "../../../components/Page"

import ImageAvatar from "../../../components/ImageAvatar"
import Text from "../../../components/Text"
import Skeleton from "../../../components/Skeleton"
import { RegularButton, MultilineButton } from "../../../components/Button"

import useAssets from "../../../hooks/useAssets"
import { useAccentColorLazy } from "../../../hooks/useAccentColor"

import ArrowUpCircleFill from "../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowDownCircleFill from "../../../icons/28/Arrow Down Circle Fill.svg?react"
import PlusCircleFill from "../../../icons/28/Plus Circle Fill.svg?react"
import ArrowLeftAndRightCircleFill from "../../../icons/28/Arrow Left & Right Circle Fill.svg?react"

import * as styles from "./ColorAssetPage.module.scss"

// Placeholder cards rendered while the fetch is in flight; each reveals on
// its own once its data and accent color are ready.
const SKELETON_COUNT = 3

// Mock values give the skeleton bars realistic, varied widths while loading.
const PLACEHOLDER = { name: "Ethereum", current_price: "3,180", symbol: "eth" }

function Banner({ name }) {
    const BannerText = `Currently, ${name} can only be purchased, held and sold within Crypto Wallet. It is not possible to transfer, receive or withdraw ${name} externally.`
    return (
        <div className={styles.bannerContainer}>
            <div className={styles.banner}>
                <Text variant="subheadline2">{BannerText}</Text>
            </div>
        </div>
    )
}

Banner.propTypes = {
    name: PropTypes.string,
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

ActionButtons.propTypes = {
    mode: PropTypes.string,
}

function AssetSection({ mode, asset }) {
    const { hex: accentColor, ref } = useAccentColorLazy(asset?.image, 10, {
        rootMargin: "100px",
    })

    // Reveal only once the data AND its accent color are both ready: the card
    // waves as a neutral skeleton, then pops into color with its content, so
    // the text never flashes over a colorless background.
    const revealed = Boolean(asset) && Boolean(accentColor)
    const data = asset ?? PLACEHOLDER

    return (
        <section
            ref={ref}
            className={styles.root}
            style={{
                backgroundColor: accentColor
                    ? `oklch(from ${accentColor} calc(l * .9) c h)`
                    : undefined,
            }}
        >
            {revealed && mode === "trade" ? <Banner name={data.name} /> : null}
            <Skeleton active={!revealed}>
                <div className={styles.body}>
                    <ImageAvatar size={72} src={asset?.image} />
                    <div className={styles.data}>
                        <Text variant="title3" weight="semibold">
                            {data.name}
                        </Text>
                        <Text
                            apple={{ variant: "title2", weight: "semibold" }}
                            material={{ variant: "title3" }}
                        >
                            ${data.current_price}
                        </Text>
                        <Text
                            apple={{ variant: "subheadline1", weight: "regular" }}
                            material={{ variant: "title3" }}
                        >
                            {data.symbol?.toUpperCase()}
                        </Text>
                    </div>
                </div>
            </Skeleton>
            {revealed ? <ActionButtons mode={mode} /> : null}
        </section>
    )
}

AssetSection.propTypes = {
    mode: PropTypes.string,
    asset: PropTypes.shape({
        image: PropTypes.string,
        name: PropTypes.string,
        current_price: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        symbol: PropTypes.string,
    }),
}

function ColorAssetPage() {
    const { assets } = useAssets()

    // Index keys keep the placeholder cards and the real cards on the same
    // elements, so the first cards reveal in place rather than remounting.
    const rows = assets ?? Array.from({ length: SKELETON_COUNT }, () => null)

    return (
        <>
            <BackButton />
            <Page>
                <div className={styles.list}>
                    {rows.map((asset, index) => (
                        <AssetSection mode="trade" asset={asset} key={index} />
                    ))}
                </div>
            </Page>
        </>
    )
}

export default ColorAssetPage
