import Page from "../Page"
import SectionList from "../SectionList"
import SegmentedControl from "../SegmentedControl"

import { BackButton } from "../../lib/twa"

const SegmentedControlShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <SectionList.Item header="2 Segments">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <SegmentedControl segments={["First", "Second"]} />
                    </div>
                </SectionList.Item>

                <SectionList.Item header="3 Segments">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <SegmentedControl
                            segments={["Wallet", "TON Space", "Browser"]}
                        />
                    </div>
                </SectionList.Item>

                <SectionList.Item header="4 Segments">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <SegmentedControl
                            segments={["One", "Two", "Three", "Four"]}
                        />
                    </div>
                </SectionList.Item>

                <SectionList.Item header="Circled">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <SegmentedControl
                            segments={["Day", "Week", "Month"]}
                            type="circled"
                        />
                    </div>
                </SectionList.Item>
            </SectionList>
        </Page>
    </>
)

export default SegmentedControlShowcase
