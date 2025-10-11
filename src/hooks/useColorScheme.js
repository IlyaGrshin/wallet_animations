import { useContext } from "react"
import { AppearanceContext } from "./AppearanceProvider"

export function useColorScheme(forceColorScheme) {
    const { colorScheme } = useContext(AppearanceContext)
    return forceColorScheme || colorScheme
}
