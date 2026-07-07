import PropTypes from "prop-types"

import { useSkin } from "../../hooks/DeviceProvider"
import { Redaction, useSkeletonContext } from "../Skeleton"
import AppleText from "./AppleText"
import MaterialText from "./MaterialText"
import Badge from "./Badge"

/**
 * Platform-adaptive typography. Pass per-skin prop objects (variant/weight)
 * inline at the call site; DeviceProvider picks apple vs material. Set custom
 * color on the WRAPPING element, never as a style here — [variant] inherits.
 * @param {object} props.apple    iOS/macOS props, e.g. { variant, weight }
 * @param {object} props.material Android/Desktop props, e.g. { variant, weight }
 * @param {boolean|number} [props.skeleton] Redact; a number is a width in ch.
 * @example
 * <Text apple={{ variant: "body", weight: "semibold" }}
 *       material={{ variant: "subheadline1", weight: "medium" }}>
 *   Balance
 * </Text>
 */
const Text = ({ apple, material, skeleton, children, ...rest }) => {
    const { isApple } = useSkin()
    const contextRedacted = useSkeletonContext()

    // local prop overrides the Skeleton provider; a number is a width in ch
    const active =
        skeleton !== undefined ? Boolean(skeleton) : Boolean(contextRedacted)
    const redact = skeleton !== undefined || contextRedacted !== null
    const width = typeof skeleton === "number" ? skeleton : undefined

    const content = redact ? (
        <Redaction active={active} width={width}>
            {children}
        </Redaction>
    ) : (
        children
    )
    const skeletonAttr = active ? { "data-skeleton": true } : {}

    if (isApple) {
        return (
            <AppleText {...rest} {...apple} {...skeletonAttr}>
                {content}
            </AppleText>
        )
    }
    return (
        <MaterialText {...rest} {...material} {...skeletonAttr}>
            {content}
        </MaterialText>
    )
}

Text.propTypes = {
    apple: PropTypes.object,
    material: PropTypes.object,
    skeleton: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    children: PropTypes.node,
}

Text.Badge = Badge

export default Text
