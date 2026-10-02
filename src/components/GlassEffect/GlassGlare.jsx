import PropTypes from "prop-types"
import * as styles from "./GlassGlare.module.scss"

/**
 * Light along the inside edges: two inset shadows added with `plus-lighter`,
 * in one declaration so the layer reads the backdrop once. Inset shadows follow
 * `border-radius`, so on a capsule the light hugs the curve.
 *
 * `--glass-glare-blur` sets how thick each band reads — offset and spread
 * cancel, so `--glass-glare-reach` only pushes the side edges out of view and
 * must stay above the blur. `--glass-glare-color` is how much light is added,
 * not a tint; `transparent` turns the glare off.
 * @example
 * <GlassGlare />
 */
const GlassGlare = ({ className = "" }) => (
    <div className={`${styles.glassGlare} ${className}`} aria-hidden="true" />
)

GlassGlare.propTypes = {
    className: PropTypes.string,
}

export default GlassGlare
