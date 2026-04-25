import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"

import Text from "@components/Text"
import Coin from "../Coin"
import { formatPrice } from "../../utils"
import * as styles from "./SpinReel.module.scss"

function Slot({
    index,
    item,
    y,
    phaseFade,
    winnerPulse,
    isWinner,
    slotHeight,
    centerOffset,
}) {
    const centerY = -index * slotHeight + centerOffset

    const positionScale = useTransform(
        y,
        [
            centerY - 2 * slotHeight,
            centerY - slotHeight,
            centerY,
            centerY + slotHeight,
            centerY + 2 * slotHeight,
        ],
        [0.667, 0.667, 1, 0.667, 0.667]
    )
    const scale = useTransform(
        [positionScale, winnerPulse],
        ([base, pulse]) => base * (isWinner ? pulse : 1)
    )
    const positionOpacity = useTransform(
        y,
        [
            centerY - 3 * slotHeight,
            centerY - slotHeight,
            centerY,
            centerY + slotHeight,
            centerY + 3 * slotHeight,
        ],
        [0, 0.5, 1, 0.5, 0]
    )
    const opacity = useTransform(
        [positionOpacity, phaseFade],
        ([pos, fade]) => pos * (isWinner ? 1 : fade)
    )

    return (
        <m.div className={styles.slot} style={{ scale, opacity }}>
            <div className={styles.coinWrap}>
                <Coin
                    ticker={item.token.ticker}
                    image={item.token.image}
                    size="lg"
                />
                <div className={styles.priceChip}>
                    <Text
                        apple={{
                            variant: "title1",
                            weight: "semibold",
                            rounded: true,
                        }}
                        material={{
                            variant: "title1",
                            weight: "medium",
                            rounded: true,
                        }}
                    >
                        {formatPrice(item.amount)}
                    </Text>
                </div>
            </div>
        </m.div>
    )
}

Slot.propTypes = {
    index: PropTypes.number.isRequired,
    item: PropTypes.shape({
        id: PropTypes.number.isRequired,
        token: PropTypes.shape({
            ticker: PropTypes.string.isRequired,
            image: PropTypes.string.isRequired,
        }).isRequired,
        amount: PropTypes.number.isRequired,
    }).isRequired,
    y: PropTypes.object.isRequired,
    phaseFade: PropTypes.object.isRequired,
    winnerPulse: PropTypes.object.isRequired,
    isWinner: PropTypes.bool.isRequired,
    slotHeight: PropTypes.number.isRequired,
    centerOffset: PropTypes.number.isRequired,
}

export default Slot
