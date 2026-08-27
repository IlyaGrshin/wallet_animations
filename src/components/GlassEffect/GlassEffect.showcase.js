import PropTypes from "prop-types"

import Page from "../Page"
import SectionList from "../SectionList"
import SectionHeader from "../SectionHeader"
import Text from "../Text"
import GradientBackground from "../GradientBackground"
import GlassContainer, { GlassBorder } from "../GlassEffect"

import { BackButton } from "../../lib/twa"

import patternSvg from "../../images/pattern.svg"
import * as styles from "./GlassEffect.showcase.module.scss"

const COLORS = ["#fbc2eb", "#a6c1ee", "#ffd3a5", "#8fd3f4"]
const COLORS_DARK = ["#7028e4", "#e5b2ca", "#2b5876", "#4e4376"]

const Backdrop = () => (
    <GradientBackground
        colors={COLORS}
        colorsDark={COLORS_DARK}
        patternUrl={patternSvg}
        patternIntensity={0.5}
        className={styles.backdrop}
    />
)

const Demo = ({ title, footer, children }) => (
    <section data-header="" data-footer="">
        <div className={styles.card}>
            <SectionHeader title={title} />
            {children}
        </div>
        <SectionHeader type="Footer" title={footer} />
    </section>
)

Demo.propTypes = {
    title: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
    children: PropTypes.node,
}

const Stage = ({ children }) => (
    <div className={styles.stage}>
        <Backdrop />
        {children}
    </div>
)

Stage.propTypes = {
    children: PropTypes.node,
}

const Label = ({ children }) => (
    <div className={styles.label}>
        <Text
            apple={{ variant: "body", weight: "semibold" }}
            material={{ variant: "subheadline1", weight: "medium" }}
        >
            {children}
        </Text>
    </div>
)

Label.propTypes = {
    children: PropTypes.node,
}

const GlassEffectShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <Demo
                    title="Surface"
                    footer="GlassContainer with children wraps them in a background, a shadow and a single rim."
                >
                    <Stage>
                        <GlassContainer className={styles.panel}>
                            <Label>Glass surface</Label>
                        </GlassContainer>
                    </Stage>
                </Demo>

                <Demo
                    title="Overlay"
                    footer="Without children it renders the bare layers, which fill the nearest positioned parent."
                >
                    <Stage>
                        <div className={styles.overlayHost}>
                            <GlassContainer />
                            <Label>Overlay</Label>
                        </div>
                    </Stage>
                </Demo>

                <Demo
                    title="Rim"
                    footer="A glass surface carries exactly one border. Pass muted inside an element that owns a backdrop-filter: the filter isolates blending, so the default overlay rim would turn into a stark white ring."
                >
                    <Stage>
                        <div className={styles.rims}>
                            <div className={`${styles.rim} ${styles.rimPlain}`}>
                                <GlassBorder />
                                <Label>Default</Label>
                            </div>
                            <div
                                className={`${styles.rim} ${styles.rimFiltered}`}
                            >
                                <GlassBorder muted />
                                <Label>Muted</Label>
                            </div>
                        </div>
                    </Stage>
                </Demo>

                <Demo
                    title="Over Moving Content"
                    footer="The bar sits over the scroller rather than sticky inside it, which Chromium renders without a backdrop."
                >
                    <div className={styles.scroller}>
                        <div className={styles.scrollArea}>
                            <div className={styles.scrollContent}>
                                <Backdrop />
                                {Array.from({ length: 12 }, (_, index) => (
                                    <div
                                        key={index}
                                        className={styles.scrollRow}
                                    >
                                        <Text
                                            apple={{ variant: "body" }}
                                            material={{ variant: "body" }}
                                        >
                                            {`Row ${index + 1}`}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <GlassContainer className={styles.scrollBar}>
                            <Label>Blurred bar</Label>
                        </GlassContainer>
                    </div>
                </Demo>
            </SectionList>
        </Page>
    </>
)

export default GlassEffectShowcase
