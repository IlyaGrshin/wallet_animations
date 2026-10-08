import PropTypes from "prop-types"
import { Calligraph as LibraryCalligraph } from "calligraph"

import SimpleNumber from "./SimpleNumber"

const MOTION_PROPS = new Set([
    "children",
    "variant",
    "animation",
    "drift",
    "trend",
    "stagger",
    "initial",
    "onComplete",
    "autoSize",
])

/**
 * Project entry point for the `calligraph` text/number morph. Same API as the
 * library; `simple` swaps the number variant for a CSS-only odometer with the
 * same per-digit roll, blur and scale. Use it where many numbers live at once
 * (lists, tickers): no per-glyph motion components, no layout measuring, so
 * mounting, revealing and live updates stay cheap. It skips Calligraph's
 * width slide and exit of dropped columns, and ignores the motion-only props
 * (`animation`, `drift`, `trend`, `stagger`, `initial`, `onComplete`,
 * `autoSize`); DOM props, `as` and `ref` are forwarded.
 * @param {"text"|"number"|"slots"} [props.variant] Library variant.
 * @param {boolean} [props.simple] CSS odometer; number variant only.
 * @example
 * <Calligraph variant="number" simple>{formatPrice(price)}</Calligraph>
 */
export default function Calligraph({ simple = false, ...props }) {
    if (simple && props.variant === "number") {
        const domProps = Object.fromEntries(
            Object.entries(props).filter(([key]) => !MOTION_PROPS.has(key))
        )
        return (
            <SimpleNumber value={String(props.children ?? "")} {...domProps} />
        )
    }

    return <LibraryCalligraph {...props} />
}

Calligraph.propTypes = {
    children: PropTypes.node,
    variant: PropTypes.oneOf(["text", "number", "slots"]),
    simple: PropTypes.bool,
    animation: PropTypes.oneOf(["default", "smooth", "snappy", "bouncy"]),
    autoSize: PropTypes.bool,
    className: PropTypes.string,
}
