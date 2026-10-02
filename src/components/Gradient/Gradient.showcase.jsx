import { useRef, useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import SegmentedControl from "../SegmentedControl"
import { BackButton } from "../../lib/twa"

import Gradient, {
    DEFAULT_INNER,
    DEFAULT_OUTER,
    DEFAULT_CENTER,
    DEFAULT_RADIUS,
    DEFAULT_FADE,
} from "./"
import { oklchPair, oklchDefaults } from "./color"
import GradientEditOverlay from "./GradientEditOverlay"
import * as styles from "./Gradient.showcase.module.scss"

// OKLCH input defaults, decomposed from the Figma pair so it starts exact.
const D = oklchDefaults(DEFAULT_INNER, DEFAULT_OUTER)

// The sRGB tab blends the ramp in sRGB; the OKLCH tab derives inner/outer from
// one base and blends perceptually in OKLCH.
const GradientShowcase = () => {
    const [inputMode, setInputMode] = useState(0) // 0 sRGB, 1 OKLCH
    const [innerColor, setInnerColor] = useState(DEFAULT_INNER)
    const [outerColor, setOuterColor] = useState(DEFAULT_OUTER)
    const [baseColor, setBaseColor] = useState(D.base)
    const [lSpread, setLSpread] = useState(D.lSpread)
    const [cSpread, setCSpread] = useState(D.cSpread)
    const [hSpread, setHSpread] = useState(D.hSpread)
    const [center, setCenter] = useState(DEFAULT_CENTER)
    const [radius, setRadius] = useState(DEFAULT_RADIUS)
    const [fade, setFade] = useState(DEFAULT_FADE)
    const [editMode, setEditMode] = useState(false)
    const frameRef = useRef(null)

    const reset = () => {
        setInnerColor(DEFAULT_INNER)
        setOuterColor(DEFAULT_OUTER)
        setBaseColor(D.base)
        setLSpread(D.lSpread)
        setCSpread(D.cSpread)
        setHSpread(D.hSpread)
        setCenter(DEFAULT_CENTER)
        setRadius(DEFAULT_RADIUS)
        setFade(DEFAULT_FADE)
    }

    const oklchInput = inputMode === 1
    const { inner, outer } = oklchInput
        ? oklchPair(baseColor, lSpread, cSpread, hSpread)
        : { inner: innerColor, outer: outerColor }

    const colorCell = (key, value, onChange) => (
        <Cell
            key={key}
            end={
                <Cell.Part
                    type="ColorPicker"
                    id={`grad-${key}`}
                    name={`grad-${key}`}
                    value={value}
                    onChange={onChange}
                />
            }
        >
            <Cell.Text title={key} />
        </Cell>
    )

    const sliders = [
        { key: "Lightness spread", value: lSpread, set: setLSpread, max: 0.4, step: 0.005, fmt: (v) => v.toFixed(3) },
        { key: "Chroma spread", value: cSpread, set: setCSpread, max: 0.2, step: 0.005, fmt: (v) => v.toFixed(3) },
        { key: "Hue spread", value: hSpread, set: setHSpread, max: 60, step: 1, fmt: (v) => `${Math.round(v)}°` },
    ]

    return (
        <>
            <BackButton />
            <Page deferHeader>
                <div className={styles.stage}>
                    <div className={styles.frame} ref={frameRef}>
                        <Gradient
                            innerColor={inner}
                            outerColor={outer}
                            center={center}
                            radius={radius}
                            fade={fade}
                            colorSpace={oklchInput ? "oklch" : "srgb"}
                            paintHeader
                        />
                        {editMode && (
                            <GradientEditOverlay
                                frameRef={frameRef}
                                center={center}
                                radius={radius}
                                fade={fade}
                                setCenter={setCenter}
                                setRadius={setRadius}
                                setFade={setFade}
                            />
                        )}
                    </div>
                    <div className={styles.readout}>
                        {inner} → {outer} · center {`{${center.x}, ${center.y}}`}{" "}
                        · radius {`{${radius.x}, ${radius.y}}`}
                    </div>
                </div>

                <SectionList>
                    <SectionList.Item header="Editor">
                        <Cell.Switch value={editMode} onChange={setEditMode}>
                            <Cell.Text
                                title="Edit points"
                                description="Drag center, width and height"
                            />
                        </Cell.Switch>
                        <Cell onClick={reset}>
                            <Cell.Text title="Reset to Figma defaults" />
                        </Cell>
                    </SectionList.Item>

                    <SectionList.Item header="Color input">
                        <div className={styles.segmented}>
                            <SegmentedControl
                                segments={["sRGB", "OKLCH"]}
                                defaultIndex={inputMode}
                                onChange={setInputMode}
                            />
                        </div>
                        {oklchInput ? (
                            <>
                                {colorCell("Base", baseColor, (e) =>
                                    setBaseColor(e.target.value)
                                )}
                                {sliders.map(
                                    ({ key, value, set, max, step, fmt }) => (
                                        <Cell
                                            key={key}
                                            end={
                                                <input
                                                    type="range"
                                                    className={styles.slider}
                                                    min={0}
                                                    max={max}
                                                    step={step}
                                                    value={value}
                                                    onChange={(e) =>
                                                        set(
                                                            parseFloat(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                />
                                            }
                                        >
                                            <Cell.Text
                                                title={key}
                                                description={fmt(value)}
                                            />
                                        </Cell>
                                    )
                                )}
                            </>
                        ) : (
                            <>
                                {colorCell("Inner", innerColor, (e) =>
                                    setInnerColor(e.target.value)
                                )}
                                {colorCell("Outer", outerColor, (e) =>
                                    setOuterColor(e.target.value)
                                )}
                            </>
                        )}
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default GradientShowcase
