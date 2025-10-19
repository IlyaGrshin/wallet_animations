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

const telegramPlatform = WebApp.platform
const basePlatform = "apple"

const platformClass = platform[telegramPlatform] || basePlatform
export const useApple = platformClass === "apple"
export const useMaterial = platformClass === "material"

function DeviceProvider() {
    useEffect(() => {
        document.body.setAttribute("class", platformClass)
    }, [])

    return null
}

export default DeviceProvider
