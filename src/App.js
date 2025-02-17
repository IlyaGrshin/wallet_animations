import React, { use, useEffect } from "react"
import { Router, Route, Switch } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import "./index.css"

import UI from "./Pages/UI"
import Wallet from "./Pages/Wallet"
import TONSpace from "./Pages/TS"
import Onboarding from "./Pages/Onboarding"
import NewNavigation from "./Pages/NewNavigation"
import ColorChanging from "./Pages/ColorChanging"
import TextPage from "./Pages/TextPage"
import TabBar from "./Pages/TabBar"
import Picker from "./Pages/Picker"

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
