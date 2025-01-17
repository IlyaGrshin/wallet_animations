import React, { Suspense } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "motion/react"
import "./index.css"

import Spinner from "./Components/Spinner"

const UI = React.lazy(() => import("./Pages/UI"))
const Wallet = React.lazy(() => import("./Pages/Wallet"))
const TONSpace = React.lazy(() => import("./Pages/TS"))
const Onboarding = React.lazy(() => import("./Pages/Onboarding"))
const NewNavigation = React.lazy(() => import("./Pages/NewNavigation"))
const ColorChanging = React.lazy(() => import("./Pages/ColorChanging"))

import TextPage from "./Pages/TextPage"

function App() {
    const location = useLocation()

    const centeredSpinner = (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Spinner />
        </div>
    )

    return (
        <Suspense fallback={centeredSpinner}>
            <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<UI />} />
                    <Route path="wallet" element={<Wallet />} />
                    <Route path="tonspace" element={<TONSpace />} />
                    <Route path="onboarding" element={<Onboarding />} />
                    <Route path="textpage" element={<TextPage />} />
                    <Route path="newnavigation" element={<NewNavigation />} />
                    <Route path="colorchanging" element={<ColorChanging />} />
                    <Route path="*" element={<UI />} />
                </Routes>
            </AnimatePresence>
        </Suspense>
    )
}

export default App
