import { memo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"

import Text from "@components/Text"
import Coin from "../Coin"
import { formatPrice } from "../../utils"
import * as styles from "./SpinReel.module.scss"

const MIN_SCALE = 0.667
const SCALE_RANGE = 1 - MIN_SCALE

function getPositionScale(yVal, centerY, slotHeight) {
    const dist = Math.abs(yVal - centerY)
    if (dist >= slotHeight) return MIN_SCALE
    return 1 - SCALE_RANGE * (dist / slotHeight)
}

function getPositionOpacity(yVal, centerY, slotHeight) {
    const dist = Math.abs(yVal - centerY)
    if (dist >= 3 * slotHeight) return 0
    if (dist <= slotHeight) return 1 - 0.5 * (dist / slotHeight)
    return 0.5 - 0.5 * ((dist - slotHeight) / (2 * slotHeight))
}

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

    const scale = useTransform(
        [y, winnerPulse],
        ([yVal, pulse]) =>
            getPositionScale(yVal, centerY, slotHeight) * (isWinner ? pulse : 1)
    )
    const opacity = useTransform(
        [y, phaseFade],
        ([yVal, fade]) =>
            getPositionOpacity(yVal, centerY, slotHeight) *
            (isWinner ? 1 : fade)
    )

    return (
        <m.div
            className={styles.slot}
            style={{ scale, opacity, top: index * slotHeight }}
        >
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

export default memo(Slot)
