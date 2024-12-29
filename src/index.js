import React from "react"
import ReactDOM from "react-dom/client"
import { HashRouter as Router } from "react-router-dom"
import "./index.css"
import App from "./App"
import ThemeProvider from "./Components/ThemeProvider"
import DeviceProvider from "./Components/DeviceProvider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
    <React.StrictMode>
        <DeviceProvider />
        <ThemeProvider>
            <Router basename="/">
                <App />
            </Router>
        </ThemeProvider>
    </React.StrictMode>
)
