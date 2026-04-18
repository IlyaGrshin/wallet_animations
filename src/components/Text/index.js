import PropTypes from "prop-types"

import { useSkin } from "../../hooks/DeviceProvider"
import AppleText from "./AppleText"
import MaterialText from "./MaterialText"
import Badge from "./Badge"

const Text = ({ apple, material, children, ...rest }) => {
    const { isApple } = useSkin()
    if (isApple) {
        return (
            <AppleText {...rest} {...apple}>
                {children}
            </AppleText>
        )
    }
    return (
        <MaterialText {...rest} {...material}>
            {children}
        </MaterialText>
    )
}

Text.propTypes = {
    apple: PropTypes.object,
    material: PropTypes.object,
    children: PropTypes.node,
}

Text.Badge = Badge

export default Text
