import { useApple } from "../../hooks/DeviceProvider"
import PropTypes from "prop-types"

import AppleText from "./AppleText"
import MaterialText from "./MaterialText"

const Text = ({
    apple: appleProps,
    material: materialProps,
    children,
    ...props
}) => {
    if (useApple) {
        return (
            <AppleText apple={appleProps} {...props}>
                {children}
            </AppleText>
        )
    }

    return (
        <MaterialText material={materialProps} {...props}>
            {children}
        </MaterialText>
    )
}

Text.propTypes = {
    apple: PropTypes.object,
    material: PropTypes.object,
    children: PropTypes.node,
}
export default Text
