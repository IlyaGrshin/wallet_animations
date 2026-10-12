import PropTypes from "prop-types"
import { createContext, useEffect, useMemo, useState } from "react"
import WebApp from "../../lib/twa"

export const AppearanceContext = createContext({
    colorScheme: "light",
})

const AppearanceProvider = ({ children }) => {
    const [colorScheme, setColorScheme] = useState(() => {
        const tgColorScheme = getComputedStyle(document.documentElement)
            .getPropertyValue("--tg-color-scheme")
            .trim()
        if (tgColorScheme) return tgColorScheme

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
    })

    useEffect(() => {
        const getTelegramColorScheme = () => {
            return getComputedStyle(document.documentElement)
                .getPropertyValue("--tg-color-scheme")
                .trim()
        }

        const applySystemScheme = (scheme) => {
            setColorScheme(scheme)
            document.body.setAttribute("data-color-scheme", scheme)
        }

        const updateThemeFromTelegram = () => {
            const tgColorScheme = getTelegramColorScheme()
            if (!tgColorScheme) return
            setColorScheme(tgColorScheme)
            document.body.removeAttribute("data-color-scheme")
        }

        const handleSystemThemeChange = (e) => {
            if (getTelegramColorScheme()) return
            applySystemScheme(e.matches ? "dark" : "light")
        }

        if (getTelegramColorScheme()) {
            updateThemeFromTelegram()
        } else {
            applySystemScheme(
                window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
            )
        }

        WebApp.onEvent("themeChanged", updateThemeFromTelegram)
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        mediaQuery.addEventListener("change", handleSystemThemeChange)

        return () => {
            WebApp.offEvent("themeChanged", updateThemeFromTelegram)
            mediaQuery.removeEventListener("change", handleSystemThemeChange)
        }
    }, [])

    const value = useMemo(() => ({ colorScheme }), [colorScheme])

    return (
        <AppearanceContext.Provider value={value}>
            {children}
        </AppearanceContext.Provider>
    )
}

AppearanceProvider.propTypes = {
    children: PropTypes.node,
}

export default AppearanceProvider
