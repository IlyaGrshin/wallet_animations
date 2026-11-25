import { useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import WebApp, { isTelegram } from "../../../../lib/twa"
import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import Text from "../../../../components/Text"
import Tappable from "../../../../components/Tappable"
import ImageAvatar from "../../../../components/ImageAvatar"
import { Delta } from "./Badges"
import { safeWebUrl } from "./pages"

import * as styles from "./Sections.module.scss"

// Native Telegram alert (Figma "Alert View"); a plain alert in the browser.
const explain = (title, message) => {
    if (WebApp.isVersionAtLeast?.("6.2")) {
        WebApp.showPopup({
            title,
            message,
            buttons: [{ type: "default", text: "Got it" }],
        })
    } else {
        window.alert(`${title}\n\n${message}`)
    }
}

const openLink = (value) => {
    const url = safeWebUrl(value)
    if (!url) return
    if (!isTelegram()) window.open(url.href, "_blank", "noopener")
    else if (url.hostname === "t.me") WebApp.openTelegramLink(url.href)
    else WebApp.openLink(url.href)
}

export function About({ about }) {
    const [expanded, setExpanded] = useState(!about.clamp)

    return (
        <SectionList.Item header="About">
            <div className={styles.about}>
                <div
                    className={cx(
                        styles.aboutText,
                        !expanded && styles.clamped
                    )}
                >
                    <Text
                        apple={{ variant: "callout", weight: "regular" }}
                        material={{ variant: "body", weight: "regular" }}
                    >
                        {about.text}
                    </Text>
                    {!expanded && (
                        <Tappable
                            as="button"
                            type="button"
                            mode="opacity"
                            className={styles.more}
                            onClick={() => setExpanded(true)}
                        >
                            <Text
                                apple={{
                                    variant: "callout",
                                    weight: "regular",
                                }}
                                material={{
                                    variant: "body",
                                    weight: "regular",
                                }}
                            >
                                More
                            </Text>
                        </Tappable>
                    )}
                </div>
                {about.bullets?.map((bullet) => (
                    <div key={bullet} className={styles.bullet}>
                        <span className={styles.dot} aria-hidden="true" />
                        <Text
                            apple={{
                                variant: "subheadline1",
                                weight: "regular",
                            }}
                            material={{
                                variant: "subheadline1",
                                weight: "regular",
                            }}
                        >
                            {bullet}
                        </Text>
                    </div>
                ))}
            </div>
        </SectionList.Item>
    )
}

About.propTypes = {
    about: PropTypes.shape({
        text: PropTypes.string.isRequired,
        bullets: PropTypes.arrayOf(PropTypes.string),
        // Show four lines behind a "More" link.
        clamp: PropTypes.bool,
    }).isRequired,
}

// Market figures; each row explains itself in an alert.
export function Overview({ rows, footnote }) {
    return (
        <SectionList.Item header="Overview" description={footnote}>
            {rows.map((row) => (
                <Cell
                    key={row.label}
                    onClick={() => explain(row.label, row.info)}
                    end={
                        <span className={styles.figure}>
                            <Text
                                variant="body"
                                weight="regular"
                                skeleton={row.value ? undefined : 6}
                            >
                                {row.value}
                            </Text>
                            {row.delta != null && (
                                <Text variant="body" weight="regular">
                                    <Delta value={row.delta} />
                                </Text>
                            )}
                        </span>
                    }
                >
                    <Cell.Text title={row.label} />
                </Cell>
            ))}
        </SectionList.Item>
    )
}

Overview.propTypes = {
    rows: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            // Missing while the figures load.
            value: PropTypes.string,
            delta: PropTypes.number,
            info: PropTypes.string,
        })
    ).isRequired,
    footnote: PropTypes.string,
}

export function Links({ links }) {
    return (
        <SectionList.Item header="Links">
            {links.map((link) => (
                <Cell
                    key={link.url}
                    onClick={() => openLink(link.url)}
                    start={
                        link.icon ? (
                            <ImageAvatar src={link.icon} size={40} />
                        ) : (
                            <span className={cx(styles.glyph, styles.webGlyph)}>
                                <Text
                                    apple={{
                                        variant: "title3",
                                        weight: "semibold",
                                    }}
                                    material={{
                                        variant: "title3",
                                        weight: "medium",
                                    }}
                                >
                                    {link.glyph}
                                </Text>
                            </span>
                        )
                    }
                    end={<Cell.Part type="Chevron" />}
                >
                    <Cell.Text
                        title={link.title}
                        description={link.subtitle}
                        bold
                    />
                </Cell>
            ))}
        </SectionList.Item>
    )
}

Links.propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            subtitle: PropTypes.string,
            url: PropTypes.string.isRequired,
            icon: PropTypes.string,
            glyph: PropTypes.string,
        })
    ).isRequired,
}
