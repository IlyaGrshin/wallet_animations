import React, { useEffect } from "react"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"
import { initializeViewTransitions } from "./utils/viewTransition"

import "./index.css"

function App() {
    // Initialize View Transition API on app start
    useEffect(() => {
        initializeViewTransitions()
    }, [])

    return <RouterProvider router={router} />
}

export default App
