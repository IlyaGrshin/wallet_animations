import { Route, Switch, useLocation } from "wouter"

import { useFrozenLocation } from "../../../components/PageTransition/context"

import { SEND_PATH } from "./constants"
import Send from "./Send"
import Wallet from "./Wallet"

const GramWallet = () => {
    const [liveLocation] = useLocation()
    const frozenLocation = useFrozenLocation() ?? liveLocation

    return (
        <Switch location={frozenLocation}>
            <Route path={SEND_PATH}>
                <Send />
            </Route>
            <Route>
                <Wallet />
            </Route>
        </Switch>
    )
}

export default GramWallet
