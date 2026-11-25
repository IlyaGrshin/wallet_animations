import PropTypes from "prop-types"
import cx from "clsx"

import Text from "../../../../components/Text"
import Calligraph from "../../../../components/Calligraph"
import { useSkin } from "../../../../hooks/DeviceProvider"
import { MARKET_STATUS } from "./marketStatus"
import { formatPercent } from "./format"

import PercentIcon from "../../../../icons/18/Percent Circle Fill.svg?react"
import SunriseIcon from "../../../../icons/18/Sunrise.svg?react"
import MinusCircleIcon from "../../../../icons/18/Minus Circle.svg?react"

import * as styles from "./Asset.module.scss"
import * as tones from "./Sections.module.scss"

const TONE_COLOR = {
    up: "var(--text-confirm-color)",
    down: "var(--tg-theme-destructive-text-color)",
    muted: "var(--tg-theme-hint-color)",
}

// Green/red pill with an arrow: "↑ 4.55%". The figure rolls through
// Calligraph; `muted` greys it out while a newer one loads.
export function ChangeBadge({
    value,
    variant = "subheadline2",
    muted = false,
}) {
    const { isApple } = useSkin()
    const tone = value < 0 ? "down" : "up"
    return (
        <Text.Badge
            variant="tinted"
            className={styles.changeBadge}
            // Inline colour: Text's [variant] rule would otherwise make the
            // label inherit the row's black.
            style={{ color: muted ? TONE_COLOR.muted : TONE_COLOR[tone] }}
            apple={{ variant, weight: "semibold", arrow: { direction: tone } }}
            material={{ variant, weight: "medium" }}
        >
            {!isApple && (tone === "up" ? "↑" : "↓")}
            <Calligraph variant="number" simple>
                {formatPercent(value)}
            </Calligraph>
        </Text.Badge>
    )
}

ChangeBadge.propTypes = {
    value: PropTypes.number.isRequired,
    variant: PropTypes.string,
    muted: PropTypes.bool,
}

// Inline "↑0.88%" in the text's own type, toned up or down. The arrow sits
// outside the odometer so a sign flip swaps it instead of rolling it.
export function Delta({ value }) {
    return (
        <span className={value < 0 ? tones.down : tones.up}>
            {value < 0 ? "\u2193" : "\u2191"}
            <Calligraph variant="number" simple>
                {formatPercent(value)}
            </Calligraph>
        </span>
    )
}

Delta.propTypes = {
    value: PropTypes.number.isRequired,
}

const CHIPS = {
    earn: { icon: <PercentIcon />, tone: styles.chipEarn },
    [MARKET_STATUS.EXTENDED]: {
        icon: <SunriseIcon />,
        label: "Extended Hours",
        tone: styles.chipExtended,
    },
    [MARKET_STATUS.CLOSED]: {
        icon: <MinusCircleIcon />,
        label: "Market Closed",
        tone: styles.chipClosed,
    },
}

// Top-right status of the hero: earn rate or the stock market session.
export function Chip({ kind, label }) {
    const chip = CHIPS[kind]
    if (!chip) return null
    return (
        <span className={cx(styles.chip, chip.tone)}>
            <span className={styles.chipIcon} aria-hidden="true">
                {chip.icon}
            </span>
            <Text
                apple={{ variant: "subheadline2", weight: "medium" }}
                material={{ variant: "subheadline2", weight: "medium" }}
            >
                {label ?? chip.label}
            </Text>
        </span>
    )
}

Chip.propTypes = {
    kind: PropTypes.string,
    label: PropTypes.string,
}
