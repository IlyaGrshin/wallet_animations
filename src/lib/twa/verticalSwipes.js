import WebApp from "./webApp"

let holders = 0

/**
 * Disables Mini App close-on-swipe until every holder has released it, so an
 * outgoing screen's cleanup cannot undo the lock the incoming one just took.
 * @returns {() => void} Idempotent release.
 * @example
 * useEffect(() => lockVerticalSwipes(), [])
 */
export const lockVerticalSwipes = () => {
    holders += 1
    if (holders === 1) WebApp.disableVerticalSwipes?.()

    let released = false
    return () => {
        if (released) return
        released = true
        holders -= 1
        if (holders === 0) WebApp.enableVerticalSwipes?.()
    }
}
