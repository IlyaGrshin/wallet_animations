import PropTypes from "prop-types"

import SectionHeader from "../../../../components/SectionHeader"
import Text from "../../../../components/Text"
import PressScale from "../../../../components/PressScale"
import LimitedRibbon from "../components/LimitedRibbon"

import DiamondIcon from "../../../../icons/16/Diamond Highlight.svg?react"

import { GIFTS } from "./data"

import * as styles from "./SpendPoints.module.scss"

// A gift box card; the whole card is the buy button and sinks on press.
function GiftCard({ gift }) {
    return (
        <PressScale
            className={styles.gift}
            aria-label={`Buy ${gift.name} for ${gift.price} points`}
        >
            <img src={gift.image} alt="" className={styles.giftImage} />
            <span className={styles.giftBody}>
                <Text
                    apple={{ variant: "footnote", weight: "semibold" }}
                    material={{ variant: "footnote", weight: "medium" }}
                >
                    {gift.name}
                </Text>
                <span className={styles.price}>
                    <DiamondIcon />
                    <Text
                        apple={{ variant: "footnote", weight: "semibold" }}
                        material={{ variant: "footnote", weight: "medium" }}
                    >
                        {gift.price}
                    </Text>
                </span>
            </span>
            <LimitedRibbon />
        </PressScale>
    )
}

GiftCard.propTypes = {
    gift: PropTypes.shape({
        name: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
    }).isRequired,
}

// Gift boxes to buy with points: three cards in a row, each with its price
// pill and a "limited" ribbon across the corner.
export default function SpendPoints() {
    return (
        // Marked like SectionList.Item so the list spaces it the same way.
        <section data-header="" data-footer="">
            <SectionHeader title="Spend Your Points" />
            <div className={styles.gifts}>
                {GIFTS.map((gift) => (
                    <GiftCard key={gift.id} gift={gift} />
                ))}
            </div>
            <SectionHeader
                type="Footer"
                title="Spending points doesn't affect your score in the leaderboard."
            />
        </section>
    )
}
