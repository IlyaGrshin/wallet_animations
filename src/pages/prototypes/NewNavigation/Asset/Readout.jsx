import PropTypes from "prop-types"
import cx from "clsx"

import Text from "../../../../components/Text"
import Train from "../../../../components/Train"
import Calligraph from "../../../../components/Calligraph"
import { changeBaseline } from "../../../../components/PriceChart"
import { ChangeBadge } from "./Badges"
import { formatChange, formatPrice } from "./format"

import * as styles from "./Hero.module.scss"

const SCRUB_DATE = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
})

/**
 * Price, change and caption shown over the chart: the latest bar against the
 * range's first close (a line) or its own open (a candle), or the bar under
 * the finger. Null without bars.
 */
export const readout = (bars, { scrubbed, candles, caption }) => {
    if (!bars?.length) return null
    const current = scrubbed ?? bars.at(-1)
    const from = changeBaseline(bars, current, candles ? "candles" : "line")
    const change = current.close - from
    return {
        price: current.close,
        change,
        changePct: (change / from) * 100,
        caption: scrubbed ? SCRUB_DATE.format(scrubbed.time * 1000) : caption,
    }
}

/**
 * The hero's figures. Every number rolls through Calligraph, so a new range
 * or tick morphs the digits instead of swapping them. `pending` keeps the
 * last figures up, greyed, while the next range loads.
 */
export default function Readout({ data, pending = false }) {
    if (!data) {
        return (
            <>
                <div className={styles.price}>
                    <Text
                        apple={{ variant: "title1", weight: "bold" }}
                        material={{ variant: "title1", weight: "medium" }}
                        skeleton={6}
                    >
                        $0.000
                    </Text>
                </div>
                <Train className={styles.change}>
                    <Text
                        apple={{ variant: "subheadline2" }}
                        material={{ variant: "subheadline2" }}
                        skeleton={14}
                    />
                </Train>
            </>
        )
    }

    return (
        <div className={cx(styles.readout, pending && styles.pending)}>
            <div className={styles.price}>
                <Text
                    apple={{ variant: "title1", weight: "bold" }}
                    material={{ variant: "title1", weight: "medium" }}
                >
                    <Calligraph variant="number" simple>
                        {formatPrice(data.price)}
                    </Calligraph>
                </Text>
            </div>
            <Train className={styles.change}>
                <ChangeBadge value={data.changePct} muted={pending} />
                <span className={data.change < 0 ? styles.down : styles.up}>
                    <Text
                        apple={{ variant: "subheadline2", weight: "semibold" }}
                        material={{ variant: "subheadline2", weight: "medium" }}
                    >
                        <Calligraph variant="number" simple>
                            {formatChange(data.change)}
                        </Calligraph>
                    </Text>
                </span>
                <span className={styles.caption}>
                    <Text
                        apple={{ variant: "subheadline2", weight: "semibold" }}
                        material={{ variant: "subheadline2", weight: "medium" }}
                    >
                        {data.caption}
                    </Text>
                </span>
            </Train>
        </div>
    )
}

Readout.propTypes = {
    data: PropTypes.shape({
        price: PropTypes.number.isRequired,
        change: PropTypes.number.isRequired,
        changePct: PropTypes.number.isRequired,
        caption: PropTypes.string,
    }),
    pending: PropTypes.bool,
}
