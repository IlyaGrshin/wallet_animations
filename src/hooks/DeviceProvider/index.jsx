import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import PropTypes from "prop-types"
import WebApp from "../../lib/twa"

const PLATFORM_MAP = {
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

const detectSkin = () => {
    const override = readOverride()
    if (override) return override
    return PLATFORM_MAP[WebApp.platform] || "apple"
}

const ROBOTO_FLEX_MARKER = "data-roboto-flex"

export const ensureRobotoFlex = () => {
    if (typeof document === "undefined") return
    const isAndroid =
        WebApp.platform === "android" || WebApp.platform === "android_x"
    if (isAndroid) return
    if (document.querySelector(`link[${ROBOTO_FLEX_MARKER}]`)) return

    const preconnect = document.createElement("link")
    preconnect.rel = "preconnect"
    preconnect.href = "https://fonts.gstatic.com"
    preconnect.crossOrigin = ""
    preconnect.setAttribute(ROBOTO_FLEX_MARKER, "preconnect")
    document.head.appendChild(preconnect)

    const stylesheet = document.createElement("link")
    stylesheet.rel = "stylesheet"
    stylesheet.href =
        "https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400..700&display=swap"
    stylesheet.setAttribute(ROBOTO_FLEX_MARKER, "stylesheet")
    document.head.appendChild(stylesheet)
}

const SkinContext = createContext(null)

const FALLBACK_VALUE = (() => {
    const skin = detectSkin()
    return {
        skin,
        isApple: skin === "apple",
        isMaterial: skin === "material",
        setSkin: () => {},
    }
})()

export const useSkin = () => {
    const value = useContext(SkinContext)
    return value || FALLBACK_VALUE
}

export default function DeviceProvider({ children }) {
    const [skin, setSkinState] = useState(detectSkin)

    useEffect(() => {
        const other = skin === "apple" ? "material" : "apple"
        document.body.classList.remove(other)
        document.body.classList.add(skin)
    }, [skin])

    useEffect(() => {
        if (skin === "material") ensureRobotoFlex()
    }, [skin])

    const setSkin = useCallback((next) => {
        if (next !== "apple" && next !== "material") return
        try {
            window.localStorage.setItem(SKIN_STORAGE_KEY, next)
        } catch {
            // ignore storage failures (private mode, quota)
        }
        setSkinState(next)
    }, [])

    const value = useMemo(
        () => ({
            skin,
            isApple: skin === "apple",
            isMaterial: skin === "material",
            setSkin,
        }),
        [skin, setSkin]
    )

    return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>
}

DeviceProvider.propTypes = {
    children: PropTypes.node,
}
