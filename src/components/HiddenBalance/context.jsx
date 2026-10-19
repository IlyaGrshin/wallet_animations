import { createContext, useContext, useState } from "react"
import PropTypes from "prop-types"

// Page-wide "hide balances" switch: every HiddenBalance under one provider
// hides and reveals together. A nested provider defers to the outer one, so a
// self-contained widget (BalanceCard) can wrap itself and still follow the page.
const BalanceVisibilityContext = createContext(null)

export function BalanceVisibilityProvider({ defaultHidden = false, children }) {
    const outer = useContext(BalanceVisibilityContext)
    const [hidden, setHidden] = useState(defaultHidden)
    const value = outer ?? { hidden, toggle: () => setHidden((h) => !h) }
    return (
        <BalanceVisibilityContext value={value}>
            {children}
        </BalanceVisibilityContext>
    )
}

BalanceVisibilityProvider.propTypes = {
    defaultHidden: PropTypes.bool,
    children: PropTypes.node,
}

// { hidden, toggle } from the nearest provider; outside one, a local switch.
export function useBalanceHidden() {
    const shared = useContext(BalanceVisibilityContext)
    const [hidden, setHidden] = useState(false)
    return shared ?? { hidden, toggle: () => setHidden((h) => !h) }
}
