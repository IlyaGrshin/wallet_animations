import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import AppearanceProvider from "./hooks/AppearanceProvider"
import DeviceProvider from "./hooks/DeviceProvider"

const root = createRoot(document.getElementById("root"))
root.render(
    <StrictMode>
        <DeviceProvider />
        <AppearanceProvider>
            <App />
        </AppearanceProvider>
    </StrictMode>
)
