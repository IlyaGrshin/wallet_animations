import { useEffect } from "react"
import WebApp from "@twa-dev/sdk"
import { apple26Whitelist } from "../../config/apple26Whitelist"

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

const startAppParam = params.get("startapp")
const startWithApple26 = startAppParam === "apple26"
const userId = WebApp.initDataUnsafe?.user?.id
const isWhitelisted = apple26Whitelist.includes(userId)

let platformClass = platform[telegramPlatform] || basePlatform
if (platformClass === "apple" && (startWithApple26 || isWhitelisted)) {
    platformClass = "apple26"
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
