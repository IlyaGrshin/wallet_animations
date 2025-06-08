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

    const runBrowserTransition = () => {
        if (
            !isViewTransitionSupported() ||
            isAnyTransitionRunning ||
            window.navigation?.transition
        ) {
            return
        }

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

    if ("navigation" in window) {
        window.navigation.addEventListener("navigate", (event) => {
            if (event.navigationType === "traverse") {
                runBrowserTransition()
            }
        })
    } else {
        popstateHandler = runBrowserTransition
        window.addEventListener("popstate", popstateHandler)
        window.addEventListener("hashchange", popstateHandler)
    }
}

export const cleanupViewTransitions = () => {
    if (typeof window === "undefined") return

    if (popstateHandler) {
        window.removeEventListener("popstate", popstateHandler)
        popstateHandler = null
    }

    if (originalPushState) {
        window.history.pushState = originalPushState
        originalPushState = null
    }

    if (originalReplaceState) {
        window.history.replaceState = originalReplaceState
        originalReplaceState = null
    }

    isInitialized = false
}
