import PropTypes from "prop-types"
import * as styles from "./GlassContainer.module.scss"
import GlassBorder from "./GlassBorder"
import GlassGlare from "./GlassGlare"

/**
 * Frosted-glass surface: tinted backdrop-filtered background, shadow carrying
 * the contour ring, glare, and a single rim. With children it wraps them; with
 * none it renders the layers into a positioned parent. Do NOT wrap a scaling
 * element — backdrop-filter belongs on the scaled node (Safari drops it
 * mid-animation).
 *
 * Retune with tokens, never by restyling the layers: `--glass-tint-background`,
 * `--glass-surface-filter`, `--glass-surface-shadow`, `--glass-surface-contour`,
 * `--glass-glare-*`. An ancestor that isolates blending (filter, clip-path,
 * opacity) marks itself `data-glass-isolated`, and the blended layers step down
 * to their blend-free forms.
 * @example
 * <GlassContainer className={styles.bar}>{children}</GlassContainer>
 */
const GlassContainer = ({ children, className = "", style = {}, ...rest }) => {
    const layers = (
        <>
            <div className={styles.glassBackground} aria-hidden="true" />
            <div className={styles.glassShadow} aria-hidden="true" />
            <GlassGlare />
            <GlassBorder />
        </>
    )

    if (!children) return layers

    return (
        <div className={`${styles.root} ${className}`} style={style} {...rest}>
            {layers}
            {children}
        </div>
    )
}

GlassContainer.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.object,
}

export default GlassContainer
