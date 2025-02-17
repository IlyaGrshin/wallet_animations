import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import ThemeProvider from "./Components/ThemeProvider"
import DeviceProvider from "./Components/DeviceProvider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <DeviceProvider />
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>
)
