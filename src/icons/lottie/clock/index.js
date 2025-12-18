import { useApple } from "../../../hooks/DeviceProvider"

import lottieClockIconApple from "./clock_apple.json"
import lottieClockIconMaterial from "./clock_material.json"

export default useApple ? lottieClockIconApple : lottieClockIconMaterial
