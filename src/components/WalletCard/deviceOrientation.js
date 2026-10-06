import WebApp from "../../lib/twa"

const REFRESH_MS = 20
const RETRY_MS = 250
const MAX_ATTEMPTS = 12

let consumers = 0
let release = null

function start(orientation) {
    let started = false
    let retryTimer = null
    const onStarted = () => {
        started = true
        clearTimeout(retryTimer)
    }
    const tryStart = (attempt) => {
        if (started || attempt >= MAX_ATTEMPTS) return
        orientation.start({ refresh_rate: REFRESH_MS })
        retryTimer = setTimeout(() => tryStart(attempt + 1), RETRY_MS)
    }

    WebApp.onEvent("deviceOrientationStarted", onStarted)
    tryStart(0)

    return () => {
        clearTimeout(retryTimer)
        WebApp.offEvent("deviceOrientationStarted", onStarted)
        if (orientation.isStarted) orientation.stop()
    }
}

export function acquireDeviceOrientation(orientation) {
    consumers += 1
    if (consumers === 1) release = start(orientation)
    return () => {
        consumers -= 1
        if (consumers > 0) return
        release?.()
        release = null
    }
}
