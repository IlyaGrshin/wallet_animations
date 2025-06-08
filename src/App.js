import { useEffect } from "react"
import AppRouter from "./router"
import {
    initializeViewTransitions,
    cleanupViewTransitions,
} from "./utils/viewTransition"

import "./index.css"

function App() {
    useEffect(() => {
        initializeViewTransitions()

        return () => {
            cleanupViewTransitions()
        }
    }, [])

    return <AppRouter />
}

export default App
