import WebApp from "../../lib/twa"

const REFRESH_MS = 20
const RETRY_MS = 250
const MAX_ATTEMPTS = 12

let consumers = 0
let release = null
let failed = false
const failureListeners = new Set()

function fail() {
    failed = true
    for (const listener of failureListeners) listener()
}

function start(orientation) {
    let started = false
    let retryTimer = null
    failed = false
    const onStarted = () => {
        started = true
        clearTimeout(retryTimer)
    }
    const tryStart = (attempt) => {
        if (started || orientation.isStarted) return
        if (attempt >= MAX_ATTEMPTS) {
            fail()
            return
        }
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

export function acquireDeviceOrientation(orientation, onFailed) {
    consumers += 1
    if (onFailed) failureListeners.add(onFailed)
    if (consumers === 1) release = start(orientation)
    else if (failed) onFailed?.()
    return () => {
        consumers -= 1
        if (onFailed) failureListeners.delete(onFailed)
        if (consumers > 0) return
        release?.()
        release = null
        failed = false
    }
}
