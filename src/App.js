import React, { use, useEffect } from "react"
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

    return (
        <Router hook={useHashLocation}>
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
        </Router>
    )
}

export default App
