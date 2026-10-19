import PropTypes from "prop-types"

import ParticleEffect from "../ParticleEffect"
import { BalanceVisibilityProvider, useBalanceHidden } from "./context"

/**
 * HiddenBalance - a user balance that hides behind ParticleEffect. Tapping any
 * one toggles every HiddenBalance under the same HiddenBalance.Provider, so a
 * page can hide dozens of values at once. Particles take the text's own color.
 *
 * @param {React.ReactNode} children - The balance text
 * @param {string} className - Extra classes for the wrapper
 * @example
 * <HiddenBalance.Provider defaultHidden>
 *     <HiddenBalance>$1,234.56</HiddenBalance>
 * </HiddenBalance.Provider>
 */
export default function HiddenBalance({ children, className }) {
    const { hidden, toggle } = useBalanceHidden()

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
            role="button"
            tabIndex={0}
            aria-pressed={hidden}
            aria-label={hidden ? "Hidden balance" : undefined}
        >
            {children}
        </ParticleEffect>
    )
}

HiddenBalance.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
}

HiddenBalance.Provider = BalanceVisibilityProvider

export { useBalanceHidden }
