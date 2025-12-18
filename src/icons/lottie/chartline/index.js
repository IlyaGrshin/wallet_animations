import { useApple } from "../../../hooks/DeviceProvider"

import lottieChartlineIconApple from "./chartline_apple.json"
import lottieChartlineIconMaterial from "./chartline_material.json"

export default useApple ? lottieChartlineIconApple : lottieChartlineIconMaterial
