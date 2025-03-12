import { useApple } from "../../hooks/DeviceProvider"

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

export default Text
