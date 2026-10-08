import PropTypes from "prop-types"
import { Calligraph as LibraryCalligraph } from "calligraph"

import SimpleNumber from "./SimpleNumber"

/**
 * Project entry point for the `calligraph` text/number morph. Same API as the
 * library; `simple` swaps the number variant for a CSS-only odometer with the
 * same per-digit roll, blur and scale. Use it where many numbers live at once
 * (lists, tickers): no per-glyph motion components, no layout measuring, so
 * mounting, revealing and live updates stay cheap. It skips Calligraph's
 * width slide and exit of dropped columns.
 * @param {"text"|"number"|"slots"} [props.variant] Library variant.
 * @param {boolean} [props.simple] CSS odometer; number variant only.
 * @example
 * <Calligraph variant="number" simple>{formatPrice(price)}</Calligraph>
 */
export default function Calligraph({ simple = false, ...props }) {
    if (simple && props.variant === "number") {
        return (
            <SimpleNumber
                value={String(props.children ?? "")}
                className={props.className}
            />
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
