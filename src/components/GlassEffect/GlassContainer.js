import PropTypes from "prop-types"
import * as styles from "./GlassContainer.module.scss"
import GlassBorder from "./GlassBorder"
import GlassGlare from "./GlassGlare"

/**
 * Frosted-glass surface: a tinted backdrop-filtered background, a shadow layer
 * that also carries the outer contour ring, a glare along the inside edges and
 * a single GlassBorder rim. With children it wraps them; with none it renders
 * overlay layers meant to fill a positioned parent. Do NOT wrap a scaling
 * element — put backdrop-filter on the scaled node itself (Safari drops the
 * filter mid-animation).
 *
 * Retune it with tokens rather than by restyling the layers:
 * `--glass-tint-background`, `--glass-surface-filter`, `--glass-surface-shadow`,
 * `--glass-surface-contour`, `--glass-glare-*`.
 *
 * The blended layers (glare, rim) need to see the page to look right. An
 * ancestor owning a filter, clip-path or opacity confines them to its own
 * group, where they flatten into a dark wash and a stark white ring; such an
 * ancestor marks itself `data-glass-isolated` and the layers step down to their
 * blend-free forms on their own.
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
