import Page from "../Page"
import SectionList from "../SectionList"
import Text from "../Text"
import Train from "../Train"

import { BackButton } from "@twa-dev/sdk/react"

const TrainShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <SectionList.Item header="Space Divider">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <Train divider="space">
                            <Text
                                apple={{ variant: "body", weight: "regular" }}
                                material={{
                                    variant: "body1",
                                    weight: "regular",
                                }}
                            >
                                First
                            </Text>
                            <Text
                                apple={{ variant: "body", weight: "regular" }}
                                material={{
                                    variant: "body1",
                                    weight: "regular",
                                }}
                            >
                                Second
                            </Text>
                            <Text
                                apple={{ variant: "body", weight: "regular" }}
                                material={{
                                    variant: "body1",
                                    weight: "regular",
                                }}
                            >
                                Third
                            </Text>
                        </Train>
                    </div>
                </SectionList.Item>

                <SectionList.Item header="Dot Divider">
                    <div style={{ padding: "12px var(--side-padding)" }}>
                        <Train divider="dot">
                            <Text
                                apple={{
                                    variant: "subheadline2",
                                    weight: "regular",
                                }}
                                material={{
                                    variant: "subtitle2",
                                    weight: "regular",
                                }}
                            >
                                Label
                            </Text>
                            <Text
                                apple={{
                                    variant: "subheadline2",
                                    weight: "regular",
                                }}
                                material={{
                                    variant: "subtitle2",
                                    weight: "regular",
                                }}
                            >
                                Value
                            </Text>
                            <Text
                                apple={{
                                    variant: "subheadline2",
                                    weight: "regular",
                                }}
                                material={{
                                    variant: "subtitle2",
                                    weight: "regular",
                                }}
                            >
                                Extra
                            </Text>
                        </Train>
                    </div>
                </SectionList.Item>
            </SectionList>
        </Page>
    </>
)

export default TrainShowcase
