import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Text from "../Text"
import Picker from "../Picker"

import { BackButton } from "../../lib/twa"

const VARIANTS = [
    "title1",
    "title2",
    "title3",
    "headline",
    "body",
    "callout",
    "subheadline1",
    "subheadline2",
    "footnote",
    "caption1",
    "caption2",
]

const DEFAULT_VARIANT = VARIANTS.indexOf("body")

const WEIGHTS = ["regular", "medium", "semibold"]

const TextShowcase = () => {
    const [variantIdx, setVariantIdx] = useState(DEFAULT_VARIANT)
    const [weightIdx, setWeightIdx] = useState(0)
    const [caps, setCaps] = useState(false)
    const [chevron, setChevron] = useState(false)
    const [arrowDown, setArrowDown] = useState(false)
    const [arrowUp, setArrowUp] = useState(false)

    const variant = VARIANTS[variantIdx]
    const weight = WEIGHTS[weightIdx]

    const arrow = arrowDown
        ? { direction: "down" }
        : arrowUp
          ? { direction: "up" }
          : undefined

    const appleProps = {
        variant,
        weight,
        ...(caps && { caps: true }),
        ...(chevron && { chevron: true }),
        ...(arrow && { arrow }),
    }

    const materialProps = {
        variant,
        weight,
        ...(caps && { caps: true }),
        ...(chevron && { chevron: true }),
        ...(arrow && { arrow }),
    }

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item header="Preview">
                        <div
                            style={{
                                padding: "0 var(--side-padding)",
                                height: 120,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text apple={appleProps} material={materialProps}>
                                The quick brown fox
                            </Text>
                        </div>
                    </SectionList.Item>

                    <SectionList.Item>
                        <Cell
                            end={<Cell.Part type="Picker">{variant}</Cell.Part>}
                        >
                            <Cell.Text title="Variant" />
                        </Cell>
                        <Picker
                            items={VARIANTS}
                            onPickerIndex={setVariantIdx}
                        />
                    </SectionList.Item>

                    <SectionList.Item>
                        <Cell
                            end={<Cell.Part type="Picker">{weight}</Cell.Part>}
                        >
                            <Cell.Text title="Weight" />
                        </Cell>
                        <Picker items={WEIGHTS} onPickerIndex={setWeightIdx} />
                    </SectionList.Item>

                    <SectionList.Item header="Features">
                        <Cell.Switch value={caps} onChange={setCaps}>
                            <Cell.Text title="Caps" />
                        </Cell.Switch>
                        <Cell.Switch value={chevron} onChange={setChevron}>
                            <Cell.Text title="Chevron" />
                        </Cell.Switch>
                        <Cell.Switch
                            value={arrowDown}
                            onChange={(v) => {
                                setArrowDown(v)
                                if (v) setArrowUp(false)
                            }}
                        >
                            <Cell.Text title="Arrow Down" />
                        </Cell.Switch>
                        <Cell.Switch
                            value={arrowUp}
                            onChange={(v) => {
                                setArrowUp(v)
                                if (v) setArrowDown(false)
                            }}
                        >
                            <Cell.Text title="Arrow Up" />
                        </Cell.Switch>
                    </SectionList.Item>

                    <SectionList.Item header="Badge">
                        <div
                            style={{
                                padding: "12px var(--side-padding)",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                            }}
                        >
                            <Text.Badge
                                variant="filled"
                                apple={{
                                    variant: "caption1",
                                    weight: "semibold",
                                }}
                                material={{ variant: "overline" }}
                                style={{
                                    backgroundColor:
                                        "var(--tg-theme-button-color)",
                                }}
                            >
                                Filled
                            </Text.Badge>
                            <Text.Badge
                                variant="tinted"
                                apple={{
                                    variant: "caption1",
                                    weight: "semibold",
                                }}
                                material={{ variant: "overline" }}
                                style={{
                                    color: "var(--tg-theme-button-color)",
                                }}
                            >
                                Tinted
                            </Text.Badge>
                            <Text.Badge
                                variant="gray"
                                apple={{
                                    variant: "caption1",
                                    weight: "semibold",
                                }}
                                material={{ variant: "overline" }}
                                style={{}}
                            >
                                Gray
                            </Text.Badge>
                            <Text.Badge
                                variant="outlined"
                                apple={{
                                    variant: "caption1",
                                    weight: "semibold",
                                }}
                                material={{ variant: "overline" }}
                                style={{}}
                            >
                                Outlined
                            </Text.Badge>
                        </div>
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default TextShowcase
