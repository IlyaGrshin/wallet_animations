import PropTypes from "prop-types"
import { Calligraph } from "calligraph"

import Text from "../../../../../components/Text"
import FitText from "../../../../../components/FitText"
import SectionHeader from "../../../../../components/SectionHeader"
import Skeleton from "../../../../../components/Skeleton"

import useAssets from "../../../../../hooks/useAssets"

import { squarify } from "./treemap"

import * as styles from "./AssetHeatmap.module.scss"

const cx = (...classes) => classes.filter(Boolean).join(" ")

const MAP_ASPECT = 1074 / 743
const TOP_COUNT = 30

// Area compression exponent. BTC and ETH out-trade the tail by ~500x and
// would swallow the map raw; 0.5 still hands them a third of it, while 0.3
// flattens the hierarchy into near-equal tiles. 0.4 keeps the dominance
// readable without crushing the tail.
const AREA_EXPONENT = 0.4

// Tiles shorter or narrower than these fractions of the map drop the
// percent line: the ticker alone gets the room and stays legible.
const MIN_CHANGE_HEIGHT = 13
const MIN_CHANGE_WIDTH = 9

// Pegged assets sit at ~0% by construction, yet dominate turnover (USDT is
// the single biggest volume), so they would fill the map with meaningless
// near-flat tiles — same reasoning as excluding money-market funds from a
// stock heatmap. The screener tags them, no hand-made ticker list needed.
const isStablecoin = (asset) => asset.categories.includes("stablecoins")

// useAssets rows -> heatmap rows, largest first.
const selectHeatmapAssets = (assets) =>
    assets
        .filter(
            (asset) =>
                !isStablecoin(asset) &&
                asset.price_change_percentage_24h !== null &&
                asset.total_volume > 0
        )
        .sort((a, b) => b.total_volume - a.total_volume)
        .slice(0, TOP_COUNT)
        .map((asset) => ({
            symbol: asset.symbol.toUpperCase(),
            change: asset.price_change_percentage_24h,
            volume: asset.total_volume,
        }))

// The squarify aspect-ratio decisions must see the rendered proportions, so
// lay out in map units and convert the vertical axis back to percentages.
const layoutAssets = (rows) => {
    const height = 100 / MAP_ASPECT
    return squarify(
        rows.map((row) => row.volume ** AREA_EXPONENT),
        100,
        height
    ).map((rect) => ({
        x: rect.x,
        y: (rect.y / height) * 100,
        w: rect.w,
        h: (rect.h / height) * 100,
    }))
}

// Absolute value with trimmed trailing zeros; the tile color carries the sign.
const formatChange = (change) => `${Math.abs(Number(change.toFixed(2)))}%`

const formatUpdatedAt = (date) =>
    `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    })}`

const toneClass = (change) => {
    const strength = Math.abs(change) >= 3 ? 3 : Math.abs(change) >= 1 ? 2 : 1
    return styles[`${change < 0 ? "loss" : "gain"}${strength}`]
}

const HeatmapTile = ({ asset, rect }) => (
    <div
        className={cx(styles.tile, toneClass(asset.change))}
        style={{
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
        }}
    >
        <FitText fitHeight fill={0.75} minScale={0.35} className={styles.fit}>
            <span className={styles.labels}>
                <Text
                    apple={{ variant: "subheadline2", weight: "semibold" }}
                    material={{ variant: "subheadline2", weight: "medium" }}
                >
                    {asset.symbol}
                </Text>
                {rect.h >= MIN_CHANGE_HEIGHT && rect.w >= MIN_CHANGE_WIDTH && (
                    <Text
                        apple={{ variant: "subheadline2" }}
                        material={{ variant: "subheadline2" }}
                    >
                        {/* autoSize animates the wrapper width, which
                            fights FitText's ResizeObserver-driven scale
                            (fonts visibly jump on mount) — size statically */}
                        <Calligraph
                            variant="number"
                            animation="smooth"
                            autoSize={false}
                        >
                            {formatChange(asset.change)}
                        </Calligraph>
                    </Text>
                )}
            </span>
        </FitText>
    </div>
)

HeatmapTile.propTypes = {
    asset: PropTypes.shape({
        symbol: PropTypes.string.isRequired,
        change: PropTypes.number.isRequired,
        volume: PropTypes.number.isRequired,
    }).isRequired,
    rect: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        w: PropTypes.number,
        h: PropTypes.number,
    }).isRequired,
}

const AssetHeatmap = () => {
    const { assets, updatedAt, error } = useAssets()
    const loading = !assets && !error

    const rows = assets ? selectHeatmapAssets(assets) : []
    const rects = layoutAssets(rows)

    return (
        <section className={styles.root}>
            <SectionHeader title="Market heatmap" />
            <Skeleton active={loading}>
                <div className={cx(styles.map, !assets && styles.pending)}>
                    <div className={styles.tiles}>
                        {rows.map((asset, index) => (
                            <HeatmapTile
                                key={asset.symbol}
                                asset={asset}
                                rect={rects[index]}
                            />
                        ))}
                    </div>
                </div>
                <SectionHeader
                    type="Footer"
                    title={
                        updatedAt ? formatUpdatedAt(updatedAt) : "Today at 00:00"
                    }
                />
            </Skeleton>
        </section>
    )
}

export default AssetHeatmap
