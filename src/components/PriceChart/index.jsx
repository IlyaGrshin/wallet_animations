import { useRef, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import Text from "../Text"
import { useColorScheme } from "../../hooks/useColorScheme"
import useChart, { GRID_LINES } from "./useChart"

import * as styles from "./PriceChart.module.scss"

// A scale label this close to the price badge (px) hides behind it.
const BADGE_CLEARANCE = 14

/**
 * What a change is measured from: the range's first close on a line, the
 * candle's own open on candles. Shared with the readout over the chart so
 * both agree on which way the price moved.
 */
export const changeBaseline = (bars, bar, type) =>
    type === "candles" ? bar.open : bars[0].close

/**
 * Price history plot (TradingView lightweight-charts) with the wallet's
 * right-hand scale: four grid lines and the prices they sit at. A curved
 * line is fitted to its history and marks the latest value with a dot;
 * candles pan through theirs at a fixed pitch, with a price line and badge.
 * @param {Array<{time:number,open:number,high:number,low:number,close:number}>|null} props.bars
 * Oldest first; null renders the empty grid while loading.
 * @param {"line"|"candles"} [props.type="line"]
 * @param {boolean} [props.pending] The bars are stale while newer ones load:
 * the plot dims instead of emptying.
 * @param {(price: number) => string} props.formatPrice Scale label format.
 * @param {(bar: object|null) => void} [props.onScrub] Bar under the finger,
 * null once released.
 * @example
 * <PriceChart bars={bars} type="candles" onScrub={setScrubbed} />
 */
export default function PriceChart({
    bars,
    type = "line",
    pending = false,
    formatPrice,
    onScrub,
    className,
}) {
    const plotRef = useRef(null)
    const colorScheme = useColorScheme()
    const [layout, setLayout] = useState(null)

    const ready = Boolean(bars?.length)
    const candles = type === "candles"
    const last = ready ? bars.at(-1) : null
    const trend =
        ready && last.close < changeBaseline(bars, last, type) ? "down" : "up"

    useChart({
        containerRef: plotRef,
        // Bars carry `value` alongside OHLC: both series take them as is.
        data: ready ? bars : null,
        type,
        trend,
        colorScheme,
        onScrub: (index) => onScrub?.(index === null ? null : bars[index]),
        onLayout: setLayout,
    })

    const shown = ready && layout
    const lastY = shown ? layout.lastY : null
    const hiddenBehindBadge = (i) =>
        candles &&
        lastY !== null &&
        Math.abs((layout.height * i) / (GRID_LINES - 1) - lastY) <
            BADGE_CLEARANCE

    return (
        <div
            className={cx(
                styles.root,
                candles && styles.candles,
                pending && styles.pending,
                className
            )}
        >
            <div className={styles.plotArea}>
                {Array.from({ length: GRID_LINES }, (_, i) => (
                    <span key={i} className={styles.gridLine} />
                ))}
                <div ref={plotRef} className={styles.plot} />
                {shown && lastY !== null && !candles && (
                    <span
                        className={cx(
                            styles.dot,
                            trend === "down" && styles.down
                        )}
                        style={{ transform: `translateY(${lastY}px)` }}
                        aria-hidden="true"
                    />
                )}
            </div>
            <div className={styles.scale} aria-hidden="true">
                {/* Placeholders hold the column's width while loading, so
                    the plot doesn't narrow under the first fit. */}
                {(shown ? layout.labels : Array(GRID_LINES).fill(null)).map(
                    (price, i) => (
                        <span
                            key={i}
                            className={cx(
                                hiddenBehindBadge(i) && styles.covered
                            )}
                        >
                            <Text
                                apple={{
                                    variant: "caption2",
                                    weight: "regular",
                                }}
                                material={{
                                    variant: "caption2",
                                    weight: "regular",
                                }}
                                skeleton={price === null ? 5 : undefined}
                            >
                                {price === null ? null : formatPrice(price)}
                            </Text>
                        </span>
                    )
                )}
                {shown && candles && lastY !== null && (
                    <span
                        className={styles.priceBadge}
                        style={{ transform: `translateY(${lastY}px)` }}
                    >
                        <Text.Badge
                            variant="tinted"
                            compact
                            style={{
                                color:
                                    trend === "down"
                                        ? "var(--tg-theme-destructive-text-color)"
                                        : "var(--text-confirm-color)",
                            }}
                            apple={{ variant: "caption2", weight: "medium" }}
                            material={{ variant: "caption2", weight: "medium" }}
                        >
                            {formatPrice(last.close)}
                        </Text.Badge>
                    </span>
                )}
            </div>
        </div>
    )
}

PriceChart.propTypes = {
    bars: PropTypes.arrayOf(
        PropTypes.shape({
            time: PropTypes.number.isRequired,
            open: PropTypes.number,
            high: PropTypes.number,
            low: PropTypes.number,
            close: PropTypes.number.isRequired,
        })
    ),
    type: PropTypes.oneOf(["line", "candles"]),
    pending: PropTypes.bool,
    formatPrice: PropTypes.func.isRequired,
    onScrub: PropTypes.func,
    className: PropTypes.string,
}
