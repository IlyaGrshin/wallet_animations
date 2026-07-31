import { useMemo } from "react"
import PropTypes from "prop-types"
import * as styles from "./WalletCard.module.scss"

// [x, y] — coordinates in 361×220 viewBox units (size derived per-star)
const RAW_STARS = [
    [15, 11],
    [75, 28],
    [135, 15],
    [202, 30],
    [266, 15],
    [24, 54],
    [129, 52],
    [228, 54],
    [281, 54],
    [239, 82],
    [60, 155],
    [118, 167],
    [168, 155],
    [202, 172],
    [168, 210],
    [202, 210],
]

const STAR_BASE = 3 // half-extent → 6×6 visual
const STAR_VARIANCE = 1 // up to +1 → 8×8 visual

function starSize(x, y) {
    const seed = ((x * 7.31 + y * 13.17) % 100) / 100
    return STAR_BASE + Math.abs(seed) * STAR_VARIANCE
}

const TWINKLE_BASE = 4.2
const TWINKLE_VARIANCE = 2.6

function inAnyZone(x, y, zones) {
    return zones.some(
        ([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2,
    )
}

function sparklePath(x, y, s) {
    const t = s * 0.18
    return [
        `M${x} ${y - s}`,
        `L${x + t} ${y - t}`,
        `L${x + s} ${y}`,
        `L${x + t} ${y + t}`,
        `L${x} ${y + s}`,
        `L${x - t} ${y + t}`,
        `L${x - s} ${y}`,
        `L${x - t} ${y - t}`,
        "Z",
    ].join(" ")
}

export default function StarField({ safeZones }) {
    const stars = useMemo(
        () =>
            RAW_STARS.filter(([x, y]) => !inAnyZone(x, y, safeZones)).map(
                ([x, y]) => [x, y, starSize(x, y)],
            ),
        [safeZones],
    )
    return (
        <svg
            className={styles.starsSvg}
            viewBox="0 0 361 220"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {stars.map(([x, y, s], i) => {
                const dur =
                    TWINKLE_BASE + ((i * 0.41) % 1) * TWINKLE_VARIANCE
                const delay = (i * 0.73) % dur
                return (
                    <path
                        key={`${x}-${y}`}
                        d={sparklePath(x, y, s)}
                        className={styles.starPath}
                        style={{
                            animationDuration: `${dur.toFixed(2)}s`,
                            animationDelay: `-${delay.toFixed(2)}s`,
                        }}
                    />
                )
            })}
        </svg>
    )
}

StarField.propTypes = {
    safeZones: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number).isRequired,
    ).isRequired,
}
