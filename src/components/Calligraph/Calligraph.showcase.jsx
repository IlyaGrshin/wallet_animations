import { useState } from "react"
import PropTypes from "prop-types"
import Calligraph from "."

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import SegmentedControl from "../SegmentedControl"
import Text from "../Text"

import { generateRandomBalance } from "../../utils/number"
import { BackButton } from "../../lib/twa"

import * as styles from "./Calligraph.showcase.module.scss"

const ANIMATIONS = ["smooth", "snappy", "bouncy"]

const PHRASES = [
    "Send",
    "Sending…",
    "Sent",
    "Receive",
    "Swap tokens",
    "Connected",
]

const Stage = ({ children }) => (
    <div className={styles.stage}>
        <Text variant="title1" apple={{ weight: "bold" }}>
            {children}
        </Text>
    </div>
)

Stage.propTypes = {
    children: PropTypes.node,
}

const Compare = ({ value }) => (
    <div className={styles.compare}>
        <div>
            <Text variant="title1" apple={{ weight: "bold" }}>
                <Calligraph
                    variant="number"
                    animation="smooth"
                    autoSize={false}
                >
                    {value}
                </Calligraph>
            </Text>
            <Text variant="caption1">Calligraph</Text>
        </div>
        <div>
            <Text variant="title1" apple={{ weight: "bold" }}>
                <Calligraph variant="number" simple>
                    {value}
                </Calligraph>
            </Text>
            <Text variant="caption1">simple</Text>
        </div>
    </div>
)

Compare.propTypes = {
    value: PropTypes.string.isRequired,
}

const CalligraphShowcase = () => {
    const [animIdx, setAnimIdx] = useState(0)
    const [phraseIdx, setPhraseIdx] = useState(0)
    const [balance, setBalance] = useState("1234.56")

    const animation = ANIMATIONS[animIdx]

    const step = (delta) =>
        setBalance((prev) => {
            const next = Math.max(0, parseFloat(prev) + delta)
            return next.toFixed(2)
        })

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item header="Text — shared characters slide, the rest fade">
                        <Stage>
                            <Calligraph
                                variant="text"
                                animation={animation}
                                trend={1}
                            >
                                {PHRASES[phraseIdx]}
                            </Calligraph>
                        </Stage>
                        <Cell
                            onClick={() =>
                                setPhraseIdx((i) => (i + 1) % PHRASES.length)
                            }
                        >
                            <Cell.Text type="Accent" title="Next phrase" />
                        </Cell>
                    </SectionList.Item>

                    <SectionList.Item header="Number — rolling vertical digits">
                        <Stage>
                            <Calligraph variant="number" animation={animation}>
                                {balance}
                            </Calligraph>
                        </Stage>
                        <Cell onClick={() => step(10)}>
                            <Cell.Text type="Accent" title="Increase" />
                        </Cell>
                        <Cell onClick={() => step(-10)}>
                            <Cell.Text type="Accent" title="Decrease" />
                        </Cell>
                        <Cell
                            onClick={() => setBalance(generateRandomBalance())}
                        >
                            <Cell.Text type="Accent" title="Randomize" />
                        </Cell>
                    </SectionList.Item>

                    <SectionList.Item header="Calligraph vs simple — same value">
                        <Compare value={balance} />
                        <Cell onClick={() => step((Math.random() - 0.5) * 0.5)}>
                            <Cell.Text type="Accent" title="Tick" />
                        </Cell>
                        <Cell onClick={() => step(10)}>
                            <Cell.Text type="Accent" title="Increase" />
                        </Cell>
                        <Cell onClick={() => step(-10)}>
                            <Cell.Text type="Accent" title="Decrease" />
                        </Cell>
                        <Cell
                            onClick={() => setBalance(generateRandomBalance())}
                        >
                            <Cell.Text type="Accent" title="Randomize" />
                        </Cell>
                    </SectionList.Item>

                    <SectionList.Item header="Slots — slot-machine digit spin">
                        <Stage>
                            <Calligraph variant="slots" animation={animation}>
                                {balance}
                            </Calligraph>
                        </Stage>
                    </SectionList.Item>

                    <SectionList.Item header="Animation preset">
                        <div className={styles.controls}>
                            <SegmentedControl
                                segments={ANIMATIONS}
                                defaultIndex={animIdx}
                                onChange={setAnimIdx}
                            />
                        </div>
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default CalligraphShowcase
