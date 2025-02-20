import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import ThemeProvider from "./components/ThemeProvider"
import DeviceProvider from "./components/DeviceProvider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <DeviceProvider />
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
