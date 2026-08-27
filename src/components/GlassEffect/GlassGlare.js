import PropTypes from "prop-types"
import * as styles from "./GlassGlare.module.scss"

/**
 * The light gathering along the inside edges of a glass surface: two inset
 * shadows added to what shows through with `plus-lighter`. Inset shadows
 * follow `border-radius`, so on a capsule the light hugs the curve instead of
 * cutting straight across it. Both live in one declaration, so the layer reads
 * the backdrop once. Tune through tokens: `--glass-glare-blur` sets how thick
 * each band reads, since the offset and the negative spread cancel and leave
 * the band's edge on the box edge whatever `--glass-glare-reach` is — reach
 * only pushes the side edges out of view, so raise it, never drop it below the
 * blur. `--glass-glare-color` reads as how much light is added, not as a tint.
 *
 * Gated on `@supports`: without `plus-lighter` the blend would fall back to
 * `normal` and paint a dark band instead of a highlight.
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
