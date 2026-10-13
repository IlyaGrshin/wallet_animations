import PropTypes from "prop-types"
import { PlatformContext } from "./context"

/**
 * Supplies the host platform adapter to components. Without a provider they
 * fall back to the web adapter (no host chrome, no haptics).
 * @example
 * <PlatformProvider adapter={telegramAdapter}>{app}</PlatformProvider>
 */
const PlatformProvider = ({ adapter, children }) => (
    <PlatformContext.Provider value={adapter}>
        {children}
    </PlatformContext.Provider>
)

PlatformProvider.propTypes = {
    adapter: PropTypes.object.isRequired,
    children: PropTypes.node,
}

export default PlatformProvider
