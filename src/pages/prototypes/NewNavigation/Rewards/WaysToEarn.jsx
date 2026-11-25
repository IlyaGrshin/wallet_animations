import PropTypes from "prop-types"

import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import Text from "../../../../components/Text"

import DiamondIcon from "../../../../icons/16/Diamond Highlight.svg?react"
import GramIcon from "../../../../icons/16/Diamond Gram.svg?react"

import Countdown from "./Countdown"
import { WAYS_TO_EARN } from "./data"

import * as styles from "./WaysToEarn.module.scss"

// Label colour per tone: white on the filled accent badge, the tone itself on
// the tinted ones.
const BADGE_COLORS = {
    accent: "var(--tg-theme-button-text-color)",
    destructive: "var(--tg-theme-destructive-text-color)",
}

// "+50" with the points diamond after it.
function Points({ value, gram, className }) {
    const Icon = gram ? GramIcon : DiamondIcon

    return (
        <span className={className}>
            <Text
                apple={{ variant: "subheadline2", weight: "semibold" }}
                material={{ variant: "subheadline2", weight: "medium" }}
            >
                {value}
            </Text>
            <Icon />
        </span>
    )
}

Points.propTypes = {
    value: PropTypes.string.isRequired,
    gram: PropTypes.bool,
    className: PropTypes.string,
}

function WayCell({ way }) {
    return (
        <Cell
            onClick={() => {}}
            start={
                <span className={styles.wayIcon} style={{ "--tint": way.tint }}>
                    <img src={way.icon} alt="" />
                </span>
            }
            end={<Cell.Part type="Chevron" />}
        >
            <span className={styles.wayTitle}>
                <Cell.Text title={way.title} bold />
                {way.badge && (
                    <Text.Badge
                        variant={
                            way.badge.tone === "accent" ? "filled" : "tinted"
                        }
                        compact
                        // Inline colour: Text's [variant] rule would otherwise
                        // make the label inherit the row's black.
                        style={{ color: BADGE_COLORS[way.badge.tone] }}
                        apple={{ variant: "caption2", weight: "medium" }}
                        material={{ variant: "caption2", weight: "medium" }}
                    >
                        {way.badge.endsAt ? (
                            <>
                                <Countdown endsAt={way.badge.endsAt} />
                                &nbsp;LEFT
                            </>
                        ) : (
                            way.badge.label
                        )}
                    </Text.Badge>
                )}
            </span>
            <span className={styles.wayRate}>
                <Points
                    value={way.reward}
                    gram={way.gram}
                    className={styles.reward}
                />
                {way.was && <Points value={way.was} className={styles.was} />}
                <span className={styles.rateText}>
                    <Text
                        apple={{ variant: "subheadline2", weight: "regular" }}
                        material={{
                            variant: "subheadline2",
                            weight: "regular",
                        }}
                    >
                        {way.rate}
                    </Text>
                </span>
            </span>
        </Cell>
    )
}

WayCell.propTypes = {
    way: PropTypes.shape({
        title: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        tint: PropTypes.string.isRequired,
        badge: PropTypes.shape({
            // Either a fixed label or a deadline counting down.
            label: PropTypes.string,
            endsAt: PropTypes.number,
            tone: PropTypes.oneOf(Object.keys(BADGE_COLORS)).isRequired,
        }),
        reward: PropTypes.string.isRequired,
        was: PropTypes.string,
        gram: PropTypes.bool,
        rate: PropTypes.string.isRequired,
    }).isRequired,
}

export default function WaysToEarn() {
    return (
        <SectionList.Item header="How to Earn">
            {WAYS_TO_EARN.map((way) => (
                <WayCell key={way.id} way={way} />
            ))}
        </SectionList.Item>
    )
}
