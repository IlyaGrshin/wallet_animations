import { memo, useMemo } from "react"

import { formatPercentage } from "../../utils/number"

import * as styles from "./CryptoHeatmap.module.scss"

const MAX_DELTA = 12

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getColorFromChange = (change) => {
    const safeValue = Number.isFinite(change) ? change : 0
    const clamped = clamp(safeValue, -MAX_DELTA, MAX_DELTA) / MAX_DELTA

    if (clamped >= 0) {
        const intensity = clamped
        const hue = 140 - intensity * 45
        const saturation = 60 + intensity * 25
        const lightness = 48 - intensity * 18

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    const intensity = Math.abs(clamped)
    const hue = 4 + intensity * 10
    const saturation = 72 + intensity * 20
    const lightness = 50 - intensity * 16

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const formatCompactValue = (value) => {
    if (!Number.isFinite(value)) {
        return "-"
    }

    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)
}

const normaliseWeights = (assets) => {
    const MIN_WEIGHT = 1
    const weights = assets.map((asset) => ({
        ...asset,
        weight: Math.max(asset.total_volume ?? 0, MIN_WEIGHT),
    }))

    const total = weights.reduce((sum, asset) => sum + asset.weight, 0) || 1

    return weights.map((asset) => ({
        ...asset,
        area: (asset.weight / total) * 100 * 100,
    }))
}

const worstAspectRatio = (row, w) => {
    if (w === 0) {
        return Number.POSITIVE_INFINITY
    }
    if (!row.length) {
        return Number.POSITIVE_INFINITY
    }

    const sum = row.reduce((acc, item) => acc + item.area, 0)
    const minArea = Math.min(...row.map((item) => item.area))
    const maxArea = Math.max(...row.map((item) => item.area))

    const w2 = w * w

    return Math.max((w2 * maxArea) / (sum * sum), (sum * sum) / (w2 * minArea))
}

const layoutRow = (row, rect, output) => {
    const { x, y, width, height } = rect
    const totalArea = row.reduce((sum, item) => sum + item.area, 0)

    if (width === 0 || height === 0 || totalArea === 0) {
        row.forEach((item) => {
            output.push({
                ...item,
                x,
                y,
                width: 0,
                height: 0,
            })
        })

        return rect
    }

    if (width >= height) {
        const rowHeight = totalArea / width
        let offsetX = x

        row.forEach((item) => {
            const itemWidth = rowHeight === 0 ? 0 : item.area / rowHeight
            output.push({
                ...item,
                x: offsetX,
                y,
                width: itemWidth,
                height: rowHeight,
            })
            offsetX += itemWidth
        })

        return {
            x,
            y: y + rowHeight,
            width,
            height: Math.max(height - rowHeight, 0),
        }
    }

    const columnWidth = totalArea / height
    let offsetY = y

    row.forEach((item) => {
        const itemHeight = columnWidth === 0 ? 0 : item.area / columnWidth
        output.push({
            ...item,
            x,
            y: offsetY,
            width: columnWidth,
            height: itemHeight,
        })
        offsetY += itemHeight
    })

    return {
        x: x + columnWidth,
        y,
        width: Math.max(width - columnWidth, 0),
        height,
    }
}

const calculateTreemap = (assets) => {
    if (!assets?.length) {
        return []
    }

    const nodes = normaliseWeights(assets).sort((a, b) => b.area - a.area)
    const output = []

    let remaining = [...nodes]
    let currentRow = []
    let rect = { x: 0, y: 0, width: 100, height: 100 }

    while (remaining.length > 0) {
        const node = remaining[0]
        const newRow = [...currentRow, node]
        const w = Math.min(rect.width, rect.height)

        if (!currentRow.length || worstAspectRatio(currentRow, w) >= worstAspectRatio(newRow, w)) {
            currentRow = newRow
            remaining = remaining.slice(1)
        } else {
            rect = layoutRow(currentRow, rect, output)
            currentRow = []
        }
    }

    if (currentRow.length) {
        layoutRow(currentRow, rect, output)
    }

    return output.map((item) => ({
        id: item.id,
        name: item.name,
        symbol: item.symbol,
        change: item.price_change_percentage_24h,
        volume: item.total_volume,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        color: getColorFromChange(item.price_change_percentage_24h),
    }))
}

const CryptoHeatmap = ({ assets = [] }) => {
    const cells = useMemo(() => calculateTreemap(assets), [assets])

    if (!cells.length) {
        return null
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.heatmap}>
                {cells.map((cell) => {
                    const showChange = cell.width > 10 && cell.height > 10
                    const showVolume = cell.width > 18 && cell.height > 14
                    const changeValue = Number.isFinite(cell.change) ? cell.change : 0
                    const isPositive = changeValue >= 0
                    const sign = changeValue > 0 ? "+" : changeValue < 0 ? "-" : ""
                    const formattedChange = `${sign}${formatPercentage(Math.abs(changeValue))}`
                    const formattedVolume = formatCompactValue(cell.volume)
                    const displayVolume =
                        formattedVolume === "-" ? formattedVolume : `$${formattedVolume}`
                    const title = `${cell.name} • ${formattedChange} • Vol. ${displayVolume}`

                    return (
                        <div
                            className={styles.cell}
                            key={cell.id}
                            style={{
                                left: `${cell.x}%`,
                                top: `${cell.y}%`,
                                width: `${cell.width}%`,
                                height: `${cell.height}%`,
                                backgroundColor: cell.color,
                            }}
                            title={title}
                        >
                            <div className={styles.content}>
                                <span className={styles.symbol}>
                                    {cell.symbol?.toUpperCase?.() || cell.symbol || cell.name}
                                </span>
                                {showChange && (
                                    <span
                                        className={
                                            isPositive
                                                ? `${styles.metric} ${styles.positive}`
                                                : `${styles.metric} ${styles.negative}`
                                        }
                                    >
                                        {formattedChange}
                                    </span>
                                )}
                                {showVolume && (
                                    <span className={`${styles.metric} ${styles.volume}`}>
                                        Vol. ${displayVolume}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className={styles.legend}>
                <span>Top assets by 24h volume</span>
                <span>Color shows 24h price change</span>
            </div>
        </div>
    )
}

export default memo(CryptoHeatmap)
