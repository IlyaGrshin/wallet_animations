import PropTypes from "prop-types"
import cx from "clsx"

import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import Text from "../../../../components/Text"
import Train from "../../../../components/Train"
import ImageAvatar from "../../../../components/ImageAvatar"
import { ChangeBadge } from "./Badges"
import { formatChange, formatMoney } from "./format"

import earnBagUrl from "../../../../images/assets/Earn Bag.svg"
import knockoutArrowUrl from "../../../../images/assets/Arrow Up Circle Knockout.svg"

import * as styles from "./Sections.module.scss"

const toneOf = (value) => (value < 0 ? styles.down : styles.up)

// Card head: total, then its 24h change. Dollars titles it "Balance" and
// sets the total larger.
function Summary({ holdings, labelled }) {
    return (
        <div className={styles.summary}>
            {labelled && (
                <Text
                    apple={{ variant: "subheadline1", weight: "regular" }}
                    material={{ variant: "subheadline1", weight: "regular" }}
                >
                    Balance
                </Text>
            )}
            <Text
                apple={
                    labelled
                        ? { variant: "title1", weight: "bold" }
                        : { variant: "title2", weight: "semibold" }
                }
                material={{ variant: "title2", weight: "medium" }}
                className={styles.total}
            >
                {formatMoney(holdings.total)}
            </Text>
            {/* A flat day (a stablecoin) says nothing: no change line. */}
            {holdings.total > 0 && holdings.changePct !== 0 && (
                <Train className={styles.summaryChange}>
                    <span className={toneOf(holdings.change)}>
                        <Text
                            apple={{ variant: "footnote", weight: "semibold" }}
                            material={{ variant: "footnote", weight: "medium" }}
                        >
                            {formatChange(holdings.change)}
                        </Text>
                    </span>
                    <ChangeBadge
                        value={holdings.changePct}
                        variant="footnote"
                    />
                    <span className={styles.hint}>
                        <Text
                            apple={{ variant: "footnote", weight: "semibold" }}
                            material={{ variant: "footnote", weight: "medium" }}
                        >
                            24h
                        </Text>
                    </span>
                </Train>
            )}
        </div>
    )
}

Summary.propTypes = {
    holdings: PropTypes.object.isRequired,
    labelled: PropTypes.bool,
}

function HoldingRow({ row, icon }) {
    const isEarn = row.kind === "earn"
    return (
        <Cell
            tappable
            start={
                isEarn ? (
                    <span className={cx(styles.glyph, styles.earnGlyph)}>
                        <img src={earnBagUrl} alt="" />
                    </span>
                ) : (
                    <ImageAvatar src={icon} size={40} />
                )
            }
            end={
                <Cell.Text
                    title={formatMoney(row.value)}
                    description={
                        row.delta ? (
                            <span className={toneOf(row.delta)}>
                                {formatChange(row.delta)}
                            </span>
                        ) : null
                    }
                />
            }
        >
            <Cell.Text
                title={
                    <span className={styles.titleRow}>
                        {isEarn ? "Earn" : "Main balance"}
                        {row.apy && (
                            <span className={styles.apy}>
                                <Text.Badge
                                    variant="tinted"
                                    compact
                                    style={{
                                        color: "var(--tg-theme-accent-text-color)",
                                    }}
                                    apple={{
                                        variant: "caption2",
                                        weight: "medium",
                                    }}
                                    material={{
                                        variant: "caption2",
                                        weight: "medium",
                                    }}
                                >
                                    {row.apy} APY
                                </Text.Badge>
                            </span>
                        )}
                    </span>
                }
                description={row.amount}
                bold
            />
        </Cell>
    )
}

HoldingRow.propTypes = {
    row: PropTypes.object.isRequired,
    icon: PropTypes.string,
}

export function Holdings({ title, holdings, icon, labelled = false }) {
    return (
        <SectionList.Item header={title}>
            <Summary holdings={holdings} labelled={labelled} />
            {holdings.rows.map((row) => (
                <HoldingRow key={row.kind} row={row} icon={icon} />
            ))}
        </SectionList.Item>
    )
}

Holdings.propTypes = {
    title: PropTypes.string.isRequired,
    // buildHoldings() output.
    holdings: PropTypes.shape({
        total: PropTypes.number.isRequired,
        rows: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
    icon: PropTypes.string,
    labelled: PropTypes.bool,
}

export function Transactions({ items }) {
    return (
        <SectionList.Item header="Transaction History">
            {items.map((tx) => (
                <Cell
                    key={tx.id}
                    tappable
                    start={
                        tx.avatar ? (
                            <ImageAvatar src={tx.avatar} size={40} />
                        ) : (
                            <span
                                className={cx(styles.glyph, styles.cardGlyph)}
                            >
                                <img src={knockoutArrowUrl} alt="" />
                            </span>
                        )
                    }
                    end={
                        <span
                            className={cx(
                                tx.status === "Received" && styles.received
                            )}
                        >
                            <Cell.Text
                                title={tx.amount}
                                description={tx.status}
                            />
                        </span>
                    }
                >
                    <Cell.Text title={tx.name} description={tx.date} bold />
                </Cell>
            ))}
            <Cell tappable end={<Cell.Part type="Chevron" />}>
                <Cell.Text title="Show All" />
            </Cell>
        </SectionList.Item>
    )
}

Transactions.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
}
