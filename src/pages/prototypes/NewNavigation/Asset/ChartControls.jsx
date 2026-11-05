import PropTypes from "prop-types"
import cx from "clsx"

import SegmentedControl from "../../../../components/SegmentedControl"
import Tappable from "../../../../components/Tappable"

import CandlesIcon from "../../../../icons/24/Candles.svg?react"

import * as styles from "./Hero.module.scss"

/**
 * Under the chart (Figma Walt 2030, 491:34190): the periods of the current
 * view and the candles toggle. The line picks a range (1D…All), candles
 * pick their size (1M…12H), so flipping the view swaps the period set too.
 */
export default function ChartControls({
    periods,
    period,
    onPeriodChange,
    candles,
    onCandlesChange,
}) {
    return (
        <div className={styles.controls}>
            <div className={styles.periods}>
                {/* Remounts per view: each set keeps its own selection. */}
                <SegmentedControl
                    key={periods.join()}
                    segments={periods}
                    defaultIndex={periods.indexOf(period)}
                    onChange={(index) => onPeriodChange(periods[index])}
                />
            </div>
            <Tappable
                as="button"
                type="button"
                className={cx(styles.candlesToggle, candles && styles.on)}
                aria-pressed={candles}
                aria-label="Candlestick chart"
                onClick={() => onCandlesChange(!candles)}
            >
                <span className={styles.knob} aria-hidden="true" />
                <CandlesIcon
                    className={styles.candlesIcon}
                    aria-hidden="true"
                />
            </Tappable>
        </div>
    )
}

ChartControls.propTypes = {
    periods: PropTypes.arrayOf(PropTypes.string).isRequired,
    period: PropTypes.string.isRequired,
    onPeriodChange: PropTypes.func.isRequired,
    candles: PropTypes.bool.isRequired,
    onCandlesChange: PropTypes.func.isRequired,
}
