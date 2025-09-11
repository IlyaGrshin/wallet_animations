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

const params = new URLSearchParams(window.location.search)

const startAppParam = params.get("startapp") || params.get("tgWebAppStartParam")

let platformClass
if (startAppParam) {
    platformClass = startAppParam
} else {
    platformClass = platform[telegramPlatform] || basePlatform
}

export const useApple = ["apple", "apple26"].includes(platformClass)
export const useApple26 = platformClass === "apple26"
export const useMaterial = platformClass === "material"

function DeviceProvider() {
    useEffect(() => {
        if (platformClass === "apple26") {
            document.body.setAttribute("class", "apple apple26")
        } else {
            document.body.setAttribute("class", platformClass)
        }
    }, [])

    return null
}

export default DeviceProvider
