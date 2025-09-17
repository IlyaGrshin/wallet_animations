import { forwardRef } from "react"

import { useApple } from "../../hooks/DeviceProvider"

import AppleTextField from "./AppleTextField"
import MaterialTextField from "./MaterialTextField"

export const TextField = forwardRef((ref) => {
    if (useApple) {
        return <AppleTextField ref={ref} />
    }
    return <MaterialTextField ref={ref} />
})
