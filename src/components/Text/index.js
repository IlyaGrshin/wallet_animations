import { useApple, useApple26 } from "../../hooks/DeviceProvider"

import AppleText from "./AppleText"
import MaterialText from "./MaterialText"

const Text = ({
    apple: appleProps,
    apple26: apple26Props,
    material: materialProps,
    children,
    ...props
}) => {
    if (useApple26) {
        return (
            <AppleText apple={apple26Props || appleProps} {...props}>
                {children}
            </AppleText>
        )
    }
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
