import "./viewTransition.scss"

export const VIEW_TRANSITION_DURATION = 200

let isAnyTransitionRunning = false
let isInitialized = false
let originalPushState = null
let originalReplaceState = null
let popstateHandler = null

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
        updateCallback()
    } finally {
        isAnyTransitionRunning = false
    }
}

export const initializeViewTransitions = () => {
    if (isInitialized || !isViewTransitionSupported()) return

    if (typeof window !== "undefined") {
        window.pageTransitionDuration = VIEW_TRANSITION_DURATION / 1000
        setupBrowserNavigationTransitions()
    }

    isInitialized = true
}

const setupBrowserNavigationTransitions = () => {
    if (typeof window === "undefined") return

    popstateHandler = (event) => {
        if (isViewTransitionSupported() && !isAnyTransitionRunning) {
            isAnyTransitionRunning = true

            try {
                const transition = document.startViewTransition(() => {
                    return new Promise((resolve) => {
                        setTimeout(resolve, 10)
                    })
                })

                transition.finished.finally(() => {
                    isAnyTransitionRunning = false
                })
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.warn("Browser navigation transition failed:", error)
                }
                isAnyTransitionRunning = false
            }
        }
    }

    window.addEventListener("popstate", popstateHandler)
}

export const cleanupViewTransitions = () => {
    if (typeof window === "undefined") return

    if (popstateHandler) {
        window.removeEventListener("popstate", popstateHandler)
        popstateHandler = null
    }

    isInitialized = false
    isAnyTransitionRunning = false
}
