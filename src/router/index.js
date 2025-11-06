import { useEffect } from "react"
import PropTypes from "prop-types"
import { Router, Switch, Route } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import { useLocation } from "wouter"
import PageTransition from "../components/PageTransition"

import UI from "../pages/UI"
import Wallet from "../pages/prototypes/Wallet"
import TONSpace from "../pages/prototypes/TS"
import Onboarding from "../pages/prototypes/Onboarding"
import NewNavigation from "../pages/prototypes/NewNavigation"
import ColorChanging from "../pages/prototypes/ColorChanging"
import TextPage from "../pages/prototypes/TextPage"
import TabBar from "../pages/prototypes/TabBar"
import Picker from "../pages/prototypes/Picker"
import ModalPages from "../pages/prototypes/ModalPages"
import ColorAssetPage from "../pages/prototypes/ColorAssetPage"
import NavigationBar from "../pages/components/NavigationBar"
import BottomBar from "../pages/components/BottomBar"
import InputPage from "../pages/prototypes/InputPage"

function Redirect({ to }) {
    const [, navigate] = useLocation()
    useEffect(() => {
        navigate(to)
    }, [navigate, to])
    return null
}

Redirect.propTypes = {
    to: PropTypes.string,
}

const Routes = () => (
    <Switch>
        <Route path="/" component={UI} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/tonspace" component={TONSpace} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/newnavigation" component={NewNavigation} />
        <Route path="/colorchanging" component={ColorChanging} />
        <Route path="/textpage" component={TextPage} />
        <Route path="/tabbar" component={TabBar} />
        <Route path="/picker" component={Picker} />
        <Route path="/modalpages" component={ModalPages} />
        <Route path="/colorassetpage" component={ColorAssetPage} />
        <Route path="/components/header" component={NavigationBar} />
        <Route path="/components/bottombar" component={BottomBar} />
        <Route path="/inputpage" component={InputPage} />
        <Route>
            <Redirect to="/" />
        </Route>
    </Switch>
)

export default function AppRouter() {
    return (
        <Router hook={useHashLocation}>
            <PageTransition>
                <Routes />
            </PageTransition>
        </Router>
    )
}
