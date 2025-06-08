import { useEffect } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
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

    return <RouterProvider router={router} />
}

export default App
