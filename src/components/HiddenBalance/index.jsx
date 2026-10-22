import PropTypes from "prop-types"

import WebApp from "../../lib/twa"
import ParticleEffect from "../ParticleEffect"
import { BalanceVisibilityProvider, useBalanceHidden } from "./context"

/**
 * HiddenBalance - a user balance that hides behind ParticleEffect. Tapping any
 * one toggles every HiddenBalance under the same HiddenBalance.Provider, so a
 * page can hide dozens of values at once. Particles take the text's own color.
 *
 * @param {React.ReactNode} children - The balance text
 * @param {string} className - Extra classes for the wrapper
 * @param {object} style - Inline styles for the wrapper
 * @example
 * <HiddenBalance.Provider defaultHidden>
 *     <HiddenBalance>$1,234.56</HiddenBalance>
 * </HiddenBalance.Provider>
 */
export default function HiddenBalance({ children, className, style }) {
    const { hidden, toggle: toggleHidden } = useBalanceHidden()

    const toggle = () => {
        WebApp.HapticFeedback?.impactOccurred?.("light")
        toggleHidden()
    }

    // Tapping a balance inside a tappable row must not also activate the row.
    const handleClick = (event) => {
        event.stopPropagation()
        toggle()
    }

    const handleKeyDown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        event.stopPropagation()
        toggle()
    }

    return (
        <ParticleEffect
            hidden={hidden}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={className}
            style={style}
            role="button"
            tabIndex={0}
            aria-label={hidden ? "Show balances" : undefined}
            aria-description={hidden ? undefined : "Hides balances"}
        >
            {children}
        </ParticleEffect>
    )
}

HiddenBalance.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.object,
}

HiddenBalance.Provider = BalanceVisibilityProvider

export { useBalanceHidden }
