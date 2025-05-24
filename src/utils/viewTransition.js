import "./viewTransition.scss"

export const VIEW_TRANSITION_DURATION = 200

let isAnyTransitionRunning = false
let isInitialized = false

export const isViewTransitionSupported = () => {
    return typeof document !== "undefined" && "startViewTransition" in document
}

export const performViewTransition = async (updateCallback) => {
    if (!isViewTransitionSupported()) {
        updateCallback()
        return Promise.resolve()
    }

    if (isAnyTransitionRunning) {
        updateCallback()
        return Promise.resolve()
    }

    isAnyTransitionRunning = true

    try {
        const transition = document.startViewTransition(updateCallback)
        await transition.finished
        return transition
    } catch (error) {
        if (error.name !== "AbortError") {
            console.warn("View transition failed:", error)
        }
        try {
            updateCallback()
        } catch (callbackError) {
            // Callback may have already been called
        }
    } finally {
        isAnyTransitionRunning = false
    }
}

export const initializeViewTransitions = () => {
    if (isInitialized) return

    if (isViewTransitionSupported()) {
        if (typeof window !== "undefined") {
            window.pageTransitionDuration = VIEW_TRANSITION_DURATION / 1000
        }

        isInitialized = true
    }
}

export const navigateWithTransition = async (navigationFunction) => {
    return performViewTransition(navigationFunction)
}
