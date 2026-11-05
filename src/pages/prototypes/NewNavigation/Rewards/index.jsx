import Page from "../../../../components/Page"
import Gradient from "../../../../components/Gradient"
import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import Text from "../../../../components/Text"
import Tappable from "../../../../components/Tappable"
import ImageAvatar from "../../../../components/ImageAvatar"

import DiamondIcon from "../../../../images/rewards/Diamond.svg?react"
import LaurelIcon from "../../../../images/rewards/Laurel.svg?react"

import QualifyCard from "./QualifyCard"
import WaysToEarn from "./WaysToEarn"
import SpendPoints from "./SpendPoints"
import { POINTS, SQUAD, FAQ } from "./data"

import * as styles from "./Rewards.module.scss"

// Figma's hero is a linear #3886d9 -> #45b8ed ramp over 410px, fading into
// the page by 498px, measured from under its 62px status bar; the tab layer
// starts below that, so everything here is 62px higher. Gradient is radial,
// so a very wide ellipse centred above the screen turns it into an almost
// horizontally banded vertical ramp. Its solid core ends exactly at the top
// (0.449 of the 632px radius), so the first row matches the Telegram header.
export const HERO_COLOR = "#3886d9"

const HERO = {
    innerColor: HERO_COLOR,
    outerColor: "#45b8ed",
    center: { x: 201, y: -284 },
    radius: { x: 2400, y: 632 },
    fade: { start: 348, end: 436 },
}

function Balance() {
    return (
        <div className={styles.hero}>
            <Text
                apple={{ variant: "subheadline2", weight: "semibold" }}
                material={{ variant: "subheadline2", weight: "medium" }}
            >
                My Points
            </Text>
            <div className={styles.points}>
                <DiamondIcon aria-hidden="true" />
                <span>{POINTS}</span>
            </div>
            <Tappable
                as="button"
                type="button"
                mode="opacity"
                className={styles.howItWorks}
            >
                <Text
                    apple={{
                        variant: "subheadline2",
                        weight: "semibold",
                        chevron: true,
                    }}
                    material={{ variant: "subheadline2", weight: "medium" }}
                >
                    How it works
                </Text>
            </Tappable>
        </div>
    )
}

// The user's squad as a translucent pill over the hero, with its place.
function Squad() {
    return (
        <Tappable as="button" type="button" className={styles.squad}>
            <ImageAvatar src={SQUAD.avatar} size={40} />
            <span className={styles.squadName}>
                <Text
                    apple={{ variant: "body", weight: "semibold" }}
                    material={{ variant: "body", weight: "medium" }}
                >
                    {SQUAD.name}
                </Text>
                <span className={styles.squadCaption}>
                    <Text
                        apple={{ variant: "subheadline2", weight: "medium" }}
                        material={{ variant: "subheadline2", weight: "medium" }}
                    >
                        Your Squad
                    </Text>
                </span>
            </span>
            <span className={styles.place}>
                <LaurelIcon aria-hidden="true" />
                <Text
                    apple={{
                        variant: "body",
                        weight: "semibold",
                        rounded: true,
                    }}
                    material={{ variant: "body", weight: "medium" }}
                >
                    {SQUAD.place}
                </Text>
                <LaurelIcon aria-hidden="true" className={styles.laurelEnd} />
            </span>
        </Tappable>
    )
}

// Rewards tab: points balance over the blue hero, the squad and its
// challenge, ways to earn, gifts to spend points on and the FAQ.
export default function Rewards() {
    return (
        // SearchHeader paints the Telegram header to the hero colour.
        <Page deferHeader>
            <div className={styles.root}>
                <Gradient {...HERO} />
                <Balance />
                <div className={styles.content}>
                    <Squad />
                    <QualifyCard />
                    <SectionList>
                        <WaysToEarn />
                        <SpendPoints />
                        <SectionList.Item header="FAQ">
                            {FAQ.map((question) => (
                                <Cell
                                    key={question}
                                    onClick={() => {}}
                                    end={<Cell.Part type="Chevron" />}
                                >
                                    <Cell.Text title={question} />
                                </Cell>
                            ))}
                            <Cell onClick={() => {}}>
                                <Cell.Text type="Accent" title="Learn More" />
                            </Cell>
                        </SectionList.Item>
                    </SectionList>
                </div>
            </div>
        </Page>
    )
}
