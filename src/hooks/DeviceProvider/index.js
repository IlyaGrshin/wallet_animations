import { useEffect } from "react"
import WebApp from "../../lib/twa"

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

const SKIN_STORAGE_KEY = "skin-override"

const readOverride = () => {
    try {
        const v = window.localStorage.getItem(SKIN_STORAGE_KEY)
        return v === "apple" || v === "material" ? v : null
    } catch {
        return null
    }
}

const telegramPlatform = WebApp.platform
const basePlatform = "apple"
const detectedPlatform = platform[telegramPlatform] || basePlatform
const override = readOverride()

const platformClass = override || detectedPlatform
export const useApple = platformClass === "apple"
export const useMaterial = platformClass === "material"

export const currentSkin = platformClass

export function setSkinOverride(skin) {
    try {
        window.localStorage.setItem(SKIN_STORAGE_KEY, skin)
    } catch {}
    window.location.reload()
}

function DeviceProvider() {
    useEffect(() => {
        const other = platformClass === "apple" ? "material" : "apple"
        document.body.classList.remove(other)
        document.body.classList.add(platformClass)
    }, [])

    return null
}

export default DeviceProvider
