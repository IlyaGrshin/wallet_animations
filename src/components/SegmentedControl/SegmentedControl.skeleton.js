import PropTypes from "prop-types"

import Page from "../Page"
import SectionList from "../SectionList"
import Text from "../Text"
import Skeleton from "../Skeleton"

import * as styles from "./SegmentedControl.skeleton.module.scss"

// A single static segmented bar. Not the real SegmentedControl (that carries
// click handlers + selection state); this is an inert look-alike whose labels
// redact into shimmer bars under the Skeleton provider. First segment shows
// the resting indicator, matching the real control's default selection.
const SegmentBar = ({ segments, circled = false }) => (
    <div className={styles.group}>
        <Skeleton active>
            <div
                className={`${styles.track} ${circled ? styles.circled : ""}`}
            >
                {segments.map((label, index) => (
                    <div
                        key={index}
                        className={`${styles.segment} ${
                            index === 0 ? styles.active : ""
                        }`}
                    >
                        <Text
                            apple={{
                                variant: "footnote",
                                weight: "semibold",
                            }}
                            material={{
                                variant: "subheadline2",
                                weight: "medium",
                            }}
                        >
                            {label}
                        </Text>
                    </div>
                ))}
            </div>
        </Skeleton>
    </div>
)

SegmentBar.propTypes = {
    segments: PropTypes.arrayOf(PropTypes.string).isRequired,
    circled: PropTypes.bool,
}

// Suspense fallback for the Segmented Control showcase. Mirrors its four
// sections (2 / 3 / 4 segments + circled) so the lazy chunk swaps in without
// layout shift. Headers stay solid; only the segment labels redact.
const SegmentedControlSkeleton = () => (
    <Page>
        <SectionList>
            <SectionList.Item header="2 Segments">
                <SegmentBar segments={["First", "Second"]} />
            </SectionList.Item>

            <SectionList.Item header="3 Segments">
                <SegmentBar segments={["Wallet", "TON Space", "Browser"]} />
            </SectionList.Item>

            <SectionList.Item header="4 Segments">
                <SegmentBar segments={["One", "Two", "Three", "Four"]} />
            </SectionList.Item>

            <SectionList.Item header="Circled">
                <SegmentBar segments={["Day", "Week", "Month"]} circled />
            </SectionList.Item>
        </SectionList>
    </Page>
)

export default SegmentedControlSkeleton
