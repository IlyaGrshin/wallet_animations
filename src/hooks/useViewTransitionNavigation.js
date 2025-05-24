import { useNavigate, useLocation } from "@tanstack/react-router"
import { performViewTransition } from "../utils/viewTransition"

export const useViewTransitionNavigation = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const navigateTo = async (path, options = {}) => {
        if (location.pathname === path) {
            return
        }

        try {
            // TanStack Router автоматически применит ViewTransition через middleware
            await navigate({ to: path, ...options })
        } catch (error) {
            console.warn("Navigation with view transition failed:", error)
            // Fallback navigation
            await navigate({ to: path, ...options })
        }
    }

    const goBack = async () => {
        try {
            await performViewTransition(() => {
                window.history.back()
            })
        } catch (error) {
            console.warn("Back navigation with view transition failed:", error)
            window.history.back()
        }
    }

    return {
        location: location.pathname,
        navigateTo,
        goBack,
        navigate,
    }
}
