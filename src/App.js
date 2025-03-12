import React from "react"
import { Router, Route, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"

import "./index.css"

import UI from "./pages/UI"
import Wallet from "./pages/Wallet"
import TONSpace from "./pages/TS"
import Onboarding from "./pages/Onboarding"
import NewNavigation from "./pages/NewNavigation"
import ColorChanging from "./pages/ColorChanging"
import TextPage from "./pages/TextPage"
import TabBar from "./pages/TabBar"
import Picker from "./pages/Picker"

function App() {
    const [location] = useHashLocation()

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
