import { useLocation } from "wouter"
import { navigateWithTransition } from "../utils/viewTransition"

export const useViewTransitionNavigation = () => {
    const [location, setLocation] = useLocation()

    const navigateTo = async (path, options = {}) => {
        if (location === path) {
            return
        }

        try {
            await navigateWithTransition(() => {
                setLocation(path, options)
            })
        } catch (error) {
            console.warn("Navigation with view transition failed:", error)
            setLocation(path, options)
        }
    }

    const goBack = async () => {
        try {
            await navigateWithTransition(() => {
                window.history.back()
            })
        } catch (error) {
            console.warn("Back navigation with view transition failed:", error)
            window.history.back()
        }
    }

    return {
        location,
        navigateTo,
        goBack,
        setLocation,
    }
}
