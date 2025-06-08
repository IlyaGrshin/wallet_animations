import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import AppearanceProvider from "./hooks/AppearanceProvider"
import DeviceProvider from "./hooks/DeviceProvider"
import MotionProvider from "./components/MotionProvider"

const root = createRoot(document.getElementById("root"))
root.render(
    <StrictMode>
        <MotionProvider>
            <DeviceProvider />
            <AppearanceProvider>
                <App />
            </AppearanceProvider>
        </MotionProvider>
    </StrictMode>
)
