import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import AppearanceProvider from "./hooks/AppearanceProvider"
import DeviceProvider from "./hooks/DeviceProvider"
import MotionProvider from "./components/MotionProvider"
import { SnackbarProvider } from "./components/Snackbar"
import { PlatformProvider } from "./lib/platform"
import { telegramAdapter } from "./lib/twa"

const root = createRoot(document.getElementById("root"))
root.render(
    <StrictMode>
        <PlatformProvider adapter={telegramAdapter}>
            <MotionProvider>
                <DeviceProvider>
                    <AppearanceProvider>
                        <SnackbarProvider>
                            <App />
                        </SnackbarProvider>
                    </AppearanceProvider>
                </DeviceProvider>
            </MotionProvider>
        </PlatformProvider>
    </StrictMode>
)
