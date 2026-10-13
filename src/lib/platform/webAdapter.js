const noop = () => {}

/**
 * Default platform: a plain browser tab with no host app around it. Every
 * host-chrome call is a no-op, so components behave as standalone web UI.
 * Host adapters (e.g. `src/lib/twa/adapter.js`) implement the same shape.
 */
const webAdapter = {
    // True when a host app draws its own chrome (header, back button).
    isEmbedded: false,
    // Raw host platform id: "ios", "android", "macos", ... or "unknown".
    platform: "unknown",
    haptics: {
        selection: noop,
        notification: noop,
        impact: noop,
    },
    // Hex color or a host theme key ("bg_color", "secondary_bg_color").
    setHeaderColor: noop,
    setBackgroundColor: noop,
    expand: noop,
    // Returns an idempotent release.
    lockVerticalSwipes: () => noop,
    // Shows the host back button while held; returns a hide function.
    showBackButton: () => noop,
    getThemeParams: () => ({}),
    // Host color scheme ("light" | "dark"), or "" to follow the system.
    getColorScheme: () => "",
    onThemeChange: () => noop,
    getViewportHeight: () => window.innerHeight,
    onViewportChange: () => noop,
    getUser: () => null,
    // Polled { beta, gamma } sensor with acquire(onFailed) => release, or null.
    getDeviceOrientation: () => null,
}

export default webAdapter
