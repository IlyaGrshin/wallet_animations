import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import AppearanceProvider from "./hooks/AppearanceProvider"
import DeviceProvider from "./hooks/DeviceProvider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <DeviceProvider />
        <AppearanceProvider>
            <App />
        </AppearanceProvider>
    </React.StrictMode>
)
