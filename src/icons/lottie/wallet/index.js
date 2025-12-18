import { useApple } from "../../../hooks/DeviceProvider"

import lottieWalletIconApple from "./wallet_apple.json"
import lottieWalletIconMaterial from "./wallet_material.json"

export default useApple ? lottieWalletIconApple : lottieWalletIconMaterial
