import PropTypes from "prop-types"
import { createContext, useEffect, useMemo, useState } from "react"
import { usePlatform } from "../../lib/platform"

export const AppearanceContext = createContext({
    colorScheme: "light",
})

const AppearanceProvider = ({ children }) => {
    const platform = usePlatform()
    const [colorScheme, setColorScheme] = useState(() => {
        const hostColorScheme = platform.getColorScheme()
        if (hostColorScheme) return hostColorScheme

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
    })

    useEffect(() => {
        const applySystemScheme = (scheme) => {
            setColorScheme(scheme)
            document.body.setAttribute("data-color-scheme", scheme)
        }

        const updateThemeFromHost = () => {
            const hostColorScheme = platform.getColorScheme()
            if (!hostColorScheme) return
            setColorScheme(hostColorScheme)
            document.body.removeAttribute("data-color-scheme")
        }

        const handleSystemThemeChange = (e) => {
            if (platform.getColorScheme()) return
            applySystemScheme(e.matches ? "dark" : "light")
        }

        if (platform.getColorScheme()) {
            updateThemeFromHost()
        } else {
            applySystemScheme(
                window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
            )
        }

        const unsubscribe = platform.onThemeChange(updateThemeFromHost)
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        mediaQuery.addEventListener("change", handleSystemThemeChange)

        return () => {
            unsubscribe()
            mediaQuery.removeEventListener("change", handleSystemThemeChange)
        }
    }, [platform])

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
