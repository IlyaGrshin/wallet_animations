import { forwardRef } from "react"

import { useApple } from "../../hooks/DeviceProvider"

import AppleTextField from "./AppleTextField"
import MaterialTextField from "./MaterialTextField"

export const TextField = forwardRef((props, ref) => {
    if (useApple) {
        return <AppleTextField {...props} ref={ref} />
    }

    // return <MaterialTextField {...props} ref={ref} />
    return <AppleTextField {...props} ref={ref} />
})

export default TextField
