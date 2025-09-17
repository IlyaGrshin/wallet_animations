import { useEffect } from "react"
import WebApp from "@twa-dev/sdk"

let platform = {
    ios: "apple",
    macos: "apple",

    android: "material",
    android_x: "material",
    tdesktop: "material",
    webk: "material",
    webz: "material",
    unigram: "material",
}

let telegramPlatform = WebApp.platform
let basePlatform = "apple"

export const useApple = (platform[telegramPlatform] || basePlatform) === "apple"
export const useMaterial =
    (platform[telegramPlatform] || basePlatform) === "material"

function DeviceProvider() {
    useEffect(() => {
        const platformClass = platform[telegramPlatform] || basePlatform
        document.body.setAttribute("class", platformClass)
    }, [])

    return null
}

export default DeviceProvider
