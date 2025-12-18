import { useApple } from "../../../hooks/DeviceProvider"

import lottieBagIconApple from "./bag_apple.json"
import lottieBagIconMaterial from "./bag_material.json"

export default useApple ? lottieBagIconApple : lottieBagIconMaterial
