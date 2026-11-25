import PropTypes from "prop-types"

import Page from "../../../../components/Page"
import Text from "../../../../components/Text"
import Tappable from "../../../../components/Tappable"
import ImageAvatar from "../../../../components/ImageAvatar"
import PressScale from "../../../../components/PressScale"
import { getAssetIcon } from "../../../../utils/AssetsMap"
import LimitedRibbon from "../components/LimitedRibbon"

import ChevronIcon from "../../../../icons/12/Chevron.svg?react"
import stickerUrl from "../../../../images/earn/Wallet Earn.svg"

import { HOLDINGS, PRODUCTS } from "./data"

import * as styles from "./Earn.module.scss"

// Sticker, title and the explainer link above everything else.
function Intro() {
    return (
        <div className={styles.intro}>
            <img src={stickerUrl} alt="" className={styles.sticker} />
            <Text
                apple={{ variant: "title3", weight: "semibold" }}
                material={{ variant: "title3", weight: "medium" }}
            >
                Wallet Earn
            </Text>
            <Text
                apple={{ variant: "subheadline1", weight: "regular" }}
                material={{ variant: "subheadline1", weight: "regular" }}
                className={styles.lead}
            >
                Get rewards for holding your crypto.
            </Text>
            <Tappable
                as="button"
                type="button"
                mode="opacity"
                className={styles.link}
            >
                <Text
                    apple={{
                        variant: "subheadline1",
                        weight: "regular",
                        chevron: true,
                    }}
                    material={{ variant: "subheadline1", weight: "medium" }}
                >
                    What is Wallet Earn
                </Text>
            </Tappable>
        </div>
    )
}

// What is staked across products and what it has earned so far.
function Holdings() {
    return (
        <Tappable
            as="button"
            type="button"
            className={styles.holdings}
            aria-label={`Holdings ${HOLDINGS.total}, ${HOLDINGS.earned} all time`}
        >
            <span className={styles.holdingsBody}>
                <Text
                    apple={{ variant: "footnote", weight: "regular" }}
                    material={{ variant: "footnote", weight: "regular" }}
                >
                    Holdings
                </Text>
                <Text
                    apple={{
                        variant: "title3",
                        weight: "semibold",
                        rounded: true,
                    }}
                    material={{ variant: "title3", weight: "medium" }}
                    className={styles.total}
                >
                    {HOLDINGS.total}
                </Text>
                <span className={styles.caption}>
                    <span className={styles.earned}>
                        <Text
                            apple={{ variant: "footnote", weight: "semibold" }}
                            material={{ variant: "footnote", weight: "medium" }}
                        >
                            {HOLDINGS.earned}
                        </Text>
                    </span>
                    <span className={styles.period}>
                        <Text
                            apple={{
                                variant: "subheadline2",
                                weight: "semibold",
                            }}
                            material={{
                                variant: "subheadline2",
                                weight: "medium",
                            }}
                        >
                            all time
                        </Text>
                    </span>
                </span>
            </span>
            <ChevronIcon className={styles.expand} aria-hidden="true" />
        </Tappable>
    )
}

// A product tile; sinks a little on press.
function ProductCard({ product }) {
    return (
        <PressScale className={styles.card}>
            <ImageAvatar src={getAssetIcon(product.ticker)} size={44} />
            <span className={styles.cardBody}>
                <Text
                    apple={{ variant: "body", weight: "semibold" }}
                    material={{ variant: "body", weight: "medium" }}
                >
                    {product.name}
                </Text>
                <Text
                    apple={{ variant: "subheadline1", weight: "regular" }}
                    material={{ variant: "subheadline1", weight: "regular" }}
                >
                    {product.apy}
                </Text>
            </span>
            {product.limited && <LimitedRibbon />}
        </PressScale>
    )
}

ProductCard.propTypes = {
    product: PropTypes.shape({
        ticker: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        apy: PropTypes.string.isRequired,
        limited: PropTypes.bool,
    }).isRequired,
}

// Earn tab: the intro, total holdings and a 2x2 grid of earn products.
export default function Earn() {
    return (
        <Page>
            <div className={styles.root}>
                <Intro />
                <Holdings />
                <div className={styles.grid}>
                    {PRODUCTS.map((product) => (
                        <ProductCard key={product.ticker} product={product} />
                    ))}
                </div>
            </div>
        </Page>
    )
}
