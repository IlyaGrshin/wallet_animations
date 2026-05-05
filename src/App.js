import { lazy, Suspense, useEffect } from "react"
import AppRouter from "./router"
import {
    initializeViewTransitions,
    cleanupViewTransitions,
} from "./utils/viewTransition"
import WebApp from "./lib/twa"

import "./index.css"

const Agentation = import.meta.env.DEV
    ? lazy(() => import("agentation").then((m) => ({ default: m.Agentation })))
    : null

// Патч BackButton с ref-counting для корректной работы при переходах страниц
const patchBackButton = () => {
    const original = {
        show: WebApp.BackButton.show.bind(WebApp.BackButton),
        hide: WebApp.BackButton.hide.bind(WebApp.BackButton),
    }
    let count = 0

    WebApp.BackButton.show = () => {
        count++
        if (count === 1) {
            original.show()
        }
    }

    WebApp.BackButton.hide = () => {
        count = Math.max(0, count - 1)
        if (count === 0) {
            original.hide()
        }
    }
}

patchBackButton()
WebApp.ready()

const ORIENTATION_REFRESH_MS = 20
const ORIENTATION_RETRY_MS = 250
const ORIENTATION_MAX_ATTEMPTS = 12

const startDeviceOrientation = () => {
    const tgOrient = WebApp?.DeviceOrientation
    if (!tgOrient || typeof tgOrient.start !== "function") return () => {}

    let started = false
    let retryTimer = null
    const onStarted = () => {
        started = true
        clearTimeout(retryTimer)
    }
    const tryStart = (attempt) => {
        if (started || attempt >= ORIENTATION_MAX_ATTEMPTS) return
        tgOrient.start({ refresh_rate: ORIENTATION_REFRESH_MS })
        retryTimer = setTimeout(
            () => tryStart(attempt + 1),
            ORIENTATION_RETRY_MS
        )
    }

    WebApp.onEvent("deviceOrientationStarted", onStarted)
    tryStart(0)

    return () => {
        clearTimeout(retryTimer)
        WebApp.offEvent("deviceOrientationStarted", onStarted)
        if (tgOrient.isStarted) tgOrient.stop()
    }
}

function App() {
    useEffect(() => {
        initializeViewTransitions()
        const stopOrientation = startDeviceOrientation()

        return () => {
            cleanupViewTransitions()
            stopOrientation()
        }
    }, [])

    return (
        <>
            <AppRouter />
            {Agentation && (
                <Suspense fallback={null}>
                    <Agentation />
                </Suspense>
            )}
        </>
    )
}

export default App
