import { useRef } from "react"
import PropTypes from "prop-types"
import cx from "clsx"
import useGramDiamond from "./useGramDiamond"
import * as styles from "./GramDiamond.module.scss"

/**
 * Interactive WebGL 2 Gram diamond (port of the iOS GramDiamond). The element
 * itself is the slot the resting stone fills and, when `interactive`, the
 * gesture target; the canvas overflows it by `--diamond-overflow` so sparkles,
 * stars and the press-to-grow stone have room. Size and place the slot from
 * the parent; set `color` on it to tint the stone when `tinted`.
 * `lens(canvas)` returns an image the size of the canvas (CSS px, any pixel
 * ratio) that the stone refracts; it is repainted on every press and when
 * `lensKey` changes. Renders `fallback` when WebGL 2 is unavailable.
 * @param {(stoneWidth: number) => object} props.style Engine style, given the
 * resting stone width (0.85 of the slot)
 * (see defaultStyle in lib/gramDiamond/renderer), read once on mount.
 * @example
 * <GramDiamond
 *     className={styles.diamond}
 *     interactive
 *     style={(w) => ({ widthPoints: w, dragGrow: 3, growShift: w / 4 })}
 *     fallback={<GramIcon />}
 * />
 */
const GramDiamond = ({
    className,
    style,
    interactive = false,
    tinted = false,
    onPressChanged,
    lens,
    lensKey,
    fallback = null,
    label = "Gram",
}) => {
    const slotRef = useRef(null)
    const canvasRef = useRef(null)
    const failed = useGramDiamond(slotRef, canvasRef, {
        style,
        interactive,
        tinted,
        onPressChanged,
        lens,
        lensKey,
    })

    return (
        <span
            ref={slotRef}
            className={cx(
                styles.root,
                interactive && styles.interactive,
                className
            )}
            role="img"
            aria-label={label}
        >
            {failed ? (
                fallback
            ) : (
                <canvas ref={canvasRef} className={styles.canvas} />
            )}
        </span>
    )
}

GramDiamond.propTypes = {
    className: PropTypes.string,
    style: PropTypes.func.isRequired,
    interactive: PropTypes.bool,
    tinted: PropTypes.bool,
    onPressChanged: PropTypes.func,
    lens: PropTypes.func,
    lensKey: PropTypes.string,
    fallback: PropTypes.node,
    label: PropTypes.string,
}

export default GramDiamond
