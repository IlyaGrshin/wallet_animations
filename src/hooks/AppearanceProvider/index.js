import PropTypes from "prop-types"
import { createContext, useEffect, useState, useMemo } from "react"
import WebApp from "@twa-dev/sdk"

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

        const updateThemeFromTelegram = () => {
            const tgColorScheme = getTelegramColorScheme()
            if (tgColorScheme) {
                setColorScheme(tgColorScheme)
            }
        }

        const updateThemeFromSystem = () => {
            const systemColorScheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light"
            setColorScheme(systemColorScheme)
            document.body.setAttribute("data-color-scheme", systemColorScheme)
        }

        const handleSystemThemeChange = (e) => {
            const systemColorScheme = e.matches ? "dark" : "light"
            setColorScheme(systemColorScheme)
            document.body.setAttribute("data-color-scheme", systemColorScheme)
        }

        updateThemeFromTelegram()

        if (!getTelegramColorScheme()) {
            updateThemeFromSystem()
        }

        WebApp.onEvent("themeChanged", () => {
            updateThemeFromTelegram()
        })

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        mediaQuery.addEventListener("change", handleSystemThemeChange)

        return () => {
            WebApp.offEvent("themeChanged", updateThemeFromTelegram)
            mediaQuery.removeEventListener("change", handleSystemThemeChange)
        }
    }, [])

    const value = useMemo(
        () => ({
            colorScheme,
        }),
        [colorScheme]
    )

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
