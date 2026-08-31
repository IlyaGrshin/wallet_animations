import { useEffect, useId } from "react"
import PropTypes from "prop-types"

import WebApp from "../../lib/twa"
import { useSplitViewContext } from "../SplitView/context"
import { radialStops, fadeStops } from "./gradientMath"

import * as styles from "./Gradient.module.scss"

// Reproduction of the Figma "Gradient" node (189:6305): a radial navy->blue fill
// masked by a vertical alpha fade into the page. Rendered as one self-contained
// SVG so the mask is identical across browsers. Stops are generated from easing
// functions (see gradientMath) rather than hardcoded tables. Every value
// defaults to the Figma export, so existing call-sites are unchanged; the props
// exist so the Gradient Editor showcase can experiment.

export const DEFAULT_INNER = "#00071b"
export const DEFAULT_OUTER = "#003f8b"
export const DEFAULT_CENTER = { x: 201, y: 94 }
// Independent horizontal/vertical radii, like Figma's radial gradient (center +
// width + height handles). The Figma export was a near-isotropic ~416px circle,
// so equal radii reproduce it (its sub-pixel ellipse + 90deg spin were
// invisible on a circle).
export const DEFAULT_RADIUS = { x: 416, y: 416 }
export const DEFAULT_FADE = { start: 410, end: 530 }

// Fraction of the radius filled with the solid inner colour before the ramp
// begins (the first radial stop); also where the editor parks its axis handles.
export const SOLID_STOP = 0.44916

const RAMP_COUNT = 5
const FADE_COUNT = 16

const Gradient = ({
    style,
    innerColor = DEFAULT_INNER,
    outerColor = DEFAULT_OUTER,
    center = DEFAULT_CENTER,
    radius = DEFAULT_RADIUS,
    fade = DEFAULT_FADE,
    colorSpace = "srgb",
    paintHeader = false,
}) => {
    // Unique per instance: home and card detail render this simultaneously,
    // and duplicate SVG ids in the document are invalid.
    const uid = useId()
    const gradId = `walt-hero-grad-${uid}`
    const fadeId = `walt-hero-fade-${uid}`
    const maskId = `walt-hero-mask-${uid}`

    // The gradient sits at the top of the page, so the header should match its
    // top colour (the solid inner colour). Mirrors <Page>'s header handling; the
    // split shell owns the chrome in a detail pane, so defer there.
    const { inDetailPane } = useSplitViewContext()
    useEffect(() => {
        if (!paintHeader || inDetailPane) return
        if (WebApp.initData) {
            WebApp.setHeaderColor(innerColor)
        } else {
            document
                .querySelector('meta[name="theme-color"]')
                ?.setAttribute("content", innerColor)
        }
    }, [paintHeader, inDetailPane, innerColor])

    // r="1" base scaled to the two radii: an axis-aligned ellipse (rx, ry) at
    // the center. Add rotation here later if a rotate handle is wanted.
    const matrix = `matrix(${radius.x} 0 0 ${radius.y} ${center.x} ${center.y})`
    const radial = radialStops(
        innerColor,
        outerColor,
        SOLID_STOP,
        RAMP_COUNT,
        colorSpace
    )
    const fadeRamp = fadeStops(FADE_COUNT)

    return (
        <div className={styles.root} style={style} aria-hidden="true">
            <svg
                className={styles.svg}
                viewBox="0 0 402 530"
                preserveAspectRatio="none"
            >
                <defs>
                    <radialGradient
                        id={gradId}
                        gradientUnits="userSpaceOnUse"
                        cx="0"
                        cy="0"
                        r="1"
                        gradientTransform={matrix}
                    >
                        {radial.map(([offset, color]) => (
                            <stop
                                key={offset}
                                offset={offset}
                                stopColor={color}
                            />
                        ))}
                    </radialGradient>
                    <linearGradient
                        id={fadeId}
                        gradientUnits="userSpaceOnUse"
                        x1="201"
                        y1={fade.start}
                        x2="201"
                        y2={fade.end}
                    >
                        {fadeRamp.map(([offset, opacity]) => (
                            <stop
                                key={offset}
                                offset={offset}
                                stopColor="#fff"
                                stopOpacity={opacity}
                            />
                        ))}
                    </linearGradient>
                    <mask id={maskId}>
                        <rect
                            width="402"
                            height="530"
                            fill={`url(#${fadeId})`}
                        />
                    </mask>
                </defs>
                <rect
                    width="402"
                    height="530"
                    fill={`url(#${gradId})`}
                    mask={`url(#${maskId})`}
                />
            </svg>
        </div>
    )
}

Gradient.propTypes = {
    style: PropTypes.object,
    innerColor: PropTypes.string,
    outerColor: PropTypes.string,
    center: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    radius: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    fade: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
    colorSpace: PropTypes.oneOf(["srgb", "oklch"]),
    paintHeader: PropTypes.bool,
}

export default Gradient
