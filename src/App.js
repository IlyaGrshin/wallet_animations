import React, { useEffect } from "react"
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
    const [isPending, setPending] = React.useState(false)

    const navigate = (to) => {
        if (location === to) return

        if (!document.startViewTransition) {
            setLocation(to)
            return
        }

        setPending(true)

        try {
            const transition = document.startViewTransition(() => {
                setLocation(to)
                return new Promise((resolve) => setTimeout(resolve, 0))
            })

            transition.finished
                .catch(
                    (error) =>
                        error.name !== "AbortError" &&
                        console.warn("View transition error:", error)
                )
                .finally(() => setPending(false))
        } catch (error) {
            console.warn("Failed to start view transition:", error)
            setLocation(to)
            setPending(false)
        }
    }

    return [location, navigate, isPending, setLocation]
}

function App() {
    const [location] = useTransitionHashLocation()
    const isApple = useApple

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--blur-value",
            isApple ? "2px" : "0px"
        )
    }, [isApple])

    const routes = [
        { path: "/", component: UI },
        { path: "/wallet", component: Wallet },
        { path: "/tonspace", component: TONSpace },
        { path: "/onboarding", component: Onboarding },
        { path: "/textpage", component: TextPage },
        { path: "/newnavigation", component: NewNavigation },
        { path: "/colorchanging", component: ColorChanging },
        { path: "/tabbar", component: TabBar },
        { path: "/picker", component: Picker },
        { path: "*", component: UI },
    ]

    return (
        <Router hook={useTransitionHashLocation}>
            <div className="page-container">
                <Switch key={location}>
                    {routes.map((route) => (
                        <Route
                            key={route.path}
                            path={route.path}
                            component={route.component}
                        />
                    ))}
                </Switch>
            </div>
        </Router>
    )
}

export default App
