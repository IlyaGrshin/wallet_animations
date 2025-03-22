import React from "react"
import { Router, Route, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"

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
