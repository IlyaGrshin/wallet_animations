import { useState } from "react"
import PropTypes from "prop-types"

import SectionList from "../../../../components/SectionList"
import Text from "../../../../components/Text"
import Tappable from "../../../../components/Tappable"

import XmarkIcon from "../../../../icons/24/Xmark.svg?react"
import CardIcon from "../../../../icons/28/Credit Card Fill.svg?react"
import TetherIcon from "../../../../icons/20/Tether Outline.svg?react"
import RoughlyEqualIcon from "../../../../icons/20/Roughly Equal Circle Outline.svg?react"
import TelegramIcon from "../../../../icons/20/Telegram Outline.svg?react"
import DollarIcon from "../../../../icons/20/Dollar Sign Circle Outline.svg?react"
import binanceUrl from "../../../../images/assets/Binance.png"
import applePayUrl from "../../../../images/assets/Apple Pay.png"
import okxUrl from "../../../../images/assets/OKX.png"
import revolutUrl from "../../../../images/assets/Revolut.svg"
import star1Url from "../../../../images/assets/banner/Star 1.svg"
import star2Url from "../../../../images/assets/banner/Star 2.svg"
import star3Url from "../../../../images/assets/banner/Star 3.svg"
import star4Url from "../../../../images/assets/banner/Star 4.svg"
import nineUrl from "../../../../images/assets/banner/Nine.svg"
import apyUrl from "../../../../images/assets/banner/APY.svg"
import percentUrl from "../../../../images/assets/banner/Percent.svg"

import * as styles from "./Dollars.module.scss"
import * as bannerStyles from "./EarnBanner.module.scss"

// Figma "Illustration": sparkles around a "9 %APY" lettering turned 15deg.
const SPARKLES = [
    { src: star1Url, className: bannerStyles.star1 },
    { src: star2Url, className: bannerStyles.star2 },
    { src: star3Url, className: bannerStyles.star3 },
    { src: star4Url, className: bannerStyles.star4 },
]
const LETTERING = [
    { src: nineUrl, className: bannerStyles.nine },
    { src: apyUrl, className: bannerStyles.apy },
    { src: percentUrl, className: bannerStyles.percent },
]

const PROVIDERS = [
    { name: "Binance", src: binanceUrl },
    { name: "Apple Pay", src: applePayUrl },
    { name: "OKX", src: okxUrl },
]

const FACTS = [
    { icon: <TetherIcon />, text: "Backed by the USDT (Tether) stablecoin." },
    {
        icon: <RoughlyEqualIcon />,
        text: "Price is roughly equal to the US dollar.",
    },
    {
        icon: <TelegramIcon />,
        text: "Send to friends instantly – without fees.",
    },
    { icon: <DollarIcon />, text: "Use it as a crypto alternative to USD." },
]

function DepositLink() {
    return (
        <Tappable
            as="button"
            type="button"
            mode="opacity"
            className={styles.link}
        >
            <Text
                apple={{ variant: "callout", weight: "regular", chevron: true }}
                material={{ variant: "body", weight: "medium" }}
            >
                Deposit
            </Text>
        </Tappable>
    )
}

// Promo to put Dollars into Earn; first of a carousel, dismissible.
export function EarnBanner({ apy }) {
    const [dismissed, setDismissed] = useState(false)
    if (dismissed) return null

    return (
        <div className={bannerStyles.bannerSlot}>
            <div className={bannerStyles.banner}>
                <div className={bannerStyles.art} aria-hidden="true">
                    {SPARKLES.map(({ src, className }) => (
                        <img key={src} src={src} alt="" className={className} />
                    ))}
                    <span className={bannerStyles.lettering}>
                        {LETTERING.map(({ src, className }) => (
                            <img
                                key={src}
                                src={src}
                                alt=""
                                className={className}
                            />
                        ))}
                    </span>
                </div>
                <div className={bannerStyles.bannerContent}>
                    <Text
                        apple={{ variant: "callout", weight: "semibold" }}
                        material={{ variant: "callout", weight: "medium" }}
                    >
                        Start earning {apy} APY on your Dollars
                    </Text>
                    <span className={bannerStyles.bannerAction}>
                        <Text
                            apple={{
                                variant: "subheadline2",
                                weight: "regular",
                                chevron: true,
                            }}
                            material={{
                                variant: "subheadline2",
                                weight: "regular",
                            }}
                        >
                            Deposit
                        </Text>
                    </span>
                </div>
                <Tappable
                    as="button"
                    type="button"
                    mode="opacity"
                    className={bannerStyles.dismiss}
                    aria-label="Hide"
                    onClick={() => setDismissed(true)}
                >
                    <XmarkIcon aria-hidden="true" />
                </Tappable>
                <span className={bannerStyles.pages} aria-hidden="true">
                    <span className={bannerStyles.pageActive} />
                    <span />
                    <span />
                    <span />
                </span>
            </div>
        </div>
    )
}

EarnBanner.propTypes = {
    apy: PropTypes.string.isRequired,
}

export function DepositCard() {
    return (
        <SectionList.Item header="Deposit Dollars">
            <div className={styles.deposit}>
                <div className={styles.providers} aria-hidden="true">
                    <span className={styles.cardProvider}>
                        <CardIcon />
                    </span>
                    {PROVIDERS.map(({ name, src }) => (
                        <img
                            key={name}
                            src={src}
                            alt=""
                            className={styles.provider}
                        />
                    ))}
                    <span className={styles.revolut}>
                        <img src={revolutUrl} alt="" />
                    </span>
                </div>
                <div className={styles.depositBody}>
                    <Text
                        apple={{ variant: "body", weight: "semibold" }}
                        material={{ variant: "body", weight: "medium" }}
                    >
                        Deposit Dollars Anytime
                    </Text>
                    <Text
                        apple={{ variant: "callout", weight: "regular" }}
                        material={{ variant: "body", weight: "regular" }}
                    >
                        Buy Dollars (USDT) using debit/credit cards, exchanges,
                        or supported banks.
                    </Text>
                    <DepositLink />
                </div>
            </div>
        </SectionList.Item>
    )
}

export function DollarsFacts() {
    return (
        <SectionList.Item header="What are Dollars?">
            <div className={styles.facts}>
                {FACTS.map(({ icon, text }) => (
                    <div key={text} className={styles.fact}>
                        <span className={styles.factIcon} aria-hidden="true">
                            {icon}
                        </span>
                        <Text
                            apple={{
                                variant: "subheadline1",
                                weight: "regular",
                            }}
                            material={{
                                variant: "subheadline1",
                                weight: "regular",
                            }}
                        >
                            {text}
                        </Text>
                    </div>
                ))}
            </div>
        </SectionList.Item>
    )
}
