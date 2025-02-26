import React, { useEffect, useState } from "react"
import { Router, Route, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import "./index.css"
import { useApple } from "./hooks/DeviceProvider"

import UI from "./pages/UI"
import Wallet from "./pages/Wallet"
import TONSpace from "./pages/TS"
import Onboarding from "./pages/Onboarding"
import NewNavigation from "./pages/NewNavigation"
import ColorChanging from "./pages/ColorChanging"
import TextPage from "./pages/TextPage"
import TabBar from "./pages/TabBar"
import Picker from "./pages/Picker"

const useTransitionHashLocation = () => {
    const [location, setLocation] = useHashLocation()
    const [isPending, setIsPending] = useState(false)

    const navigate = (to) => {
        if (!document.startViewTransition) {
            setLocation(to)
            return
        }

        if (location === to) return
        setIsPending(true)

        try {
            const transition = document.startViewTransition(async () => {
                setLocation(to)
            })

            transition.ready.catch((error) => {
                if (error.name !== "AbortError") {
                    console.warn("View transition ready error:", error)
                }
            })

            transition.finished
                .then(() => {
                    setIsPending(false)
                })
                .catch((error) => {
                    if (error.name !== "AbortError") {
                        console.warn("View transition finished error:", error)
                    }
                    setIsPending(false)
                })
        } catch (error) {
            console.warn("Failed to start view transition:", error)
            setLocation(to)
            setIsPending(false)
        }
    }

    return [location, navigate, isPending, setLocation]
}

function App() {
    const [location] = useTransitionHashLocation()
    const isApple = useApple

    useEffect(() => {
        const blurValue = isApple ? "2px" : "0px"
        document.documentElement.style.setProperty("--blur-value", blurValue)
    }, [isApple])

    return (
        <Router hook={useTransitionHashLocation}>
            <div className="page-container">
                <Switch key={location}>
                    <Route path="/" component={UI} />
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/tonspace" component={TONSpace} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route path="/textpage" component={TextPage} />
                    <Route path="/newnavigation" component={NewNavigation} />
                    <Route path="/colorchanging" component={ColorChanging} />
                    <Route path="/tabbar" component={TabBar} />
                    <Route path="/picker" component={Picker} />
                    <Route path="*" component={UI} />
                </Switch>
            </div>
        </Router>
    )
}

export default App
