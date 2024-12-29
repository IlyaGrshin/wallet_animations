import React, { useEffect } from "react"
import WebApp from "@twa-dev/sdk"

const ThemeProvider = ({ children }) => {
    useEffect(() => {
        const getTelegramColorScheme = () => {
            return getComputedStyle(document.documentElement)
                .getPropertyValue("--tg-color-scheme")
                .trim()
        }

        const updateThemeFromTelegram = () => {
            const tgColorScheme = getTelegramColorScheme()
            if (tgColorScheme) {
                document.body.setAttribute("data-color-scheme", tgColorScheme)
            }
        }

        const updateThemeFromSystem = () => {
            const systemColorScheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light"
            document.body.setAttribute("data-color-scheme", systemColorScheme)
        }

        const handleSystemThemeChange = (e) => {
            const systemColorScheme = e.matches ? "dark" : "light"
            document.body.setAttribute("data-color-scheme", systemColorScheme)
        }

        updateThemeFromTelegram()

        if (!document.body.getAttribute("data-color-scheme")) {
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

    return <>{children}</>
}

export default ThemeProvider
