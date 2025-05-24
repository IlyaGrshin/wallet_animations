import React, { useEffect } from "react"
import { Router, Route, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import { initializeViewTransitions } from "./utils/viewTransition"

import "./index.css"

import UI from "./pages/UI"
import Wallet from "./pages/prototypes/Wallet"
import TONSpace from "./pages/prototypes/TS"
import Onboarding from "./pages/prototypes/Onboarding"
import NewNavigation from "./pages/prototypes/NewNavigation"
import ColorChanging from "./pages/prototypes/ColorChanging"
import TextPage from "./pages/prototypes/TextPage"
import TabBar from "./pages/prototypes/TabBar"
import Picker from "./pages/prototypes/Picker"
import ModalPages from "./pages/prototypes/ModalPages"
import ColorAssetPage from "./pages/prototypes/ColorAssetPage"

import NavigationBar from "./pages/components/NavigationBar"

function App() {
    const [location] = useHashLocation()

    // Initialize View Transition API on app start
    useEffect(() => {
        initializeViewTransitions()
    }, [])

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
        { path: "/modalpages", component: ModalPages },
        { path: "/colorassetpage", component: ColorAssetPage },

        { path: "/components/header", component: NavigationBar },

        { path: "*", component: UI },
    ]

    return (
        <Router hook={useHashLocation}>
            <Switch key={location}>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        component={route.component}
                    />
                ))}
            </Switch>
        </Router>
    )
}

export default App
