import WebApp from "./webApp"
import { isTelegram } from "./env"
import { lockVerticalSwipes } from "./verticalSwipes"
import { acquireDeviceOrientation } from "./deviceOrientation"

const subscribe = (event, callback) => {
    WebApp.onEvent(event, callback)
    return () => WebApp.offEvent(event, callback)
}

/**
 * Platform adapter backed by Telegram WebApp. Same shape as
 * `src/lib/platform/webAdapter.js`; pass it to `<PlatformProvider>`.
 */
const telegramAdapter = {
    get isEmbedded() {
        return isTelegram()
    },
    get platform() {
        return WebApp.platform
    },
    haptics: {
        selection: () => WebApp.HapticFeedback?.selectionChanged(),
        notification: (type) =>
            WebApp.HapticFeedback?.notificationOccurred(type),
        impact: (style) => WebApp.HapticFeedback?.impactOccurred?.(style),
    },
    setHeaderColor: (color) => WebApp.setHeaderColor(color),
    setBackgroundColor: (color) => WebApp.setBackgroundColor(color),
    expand: () => WebApp.expand(),
    lockVerticalSwipes,
    showBackButton: (onClick) => {
        WebApp.BackButton.onClick(onClick)
        WebApp.BackButton.show()
        return () => {
            WebApp.BackButton.offClick(onClick)
            WebApp.BackButton.hide()
        }
    },
    getThemeParams: () => WebApp.themeParams,
    // telegram-web-app.js mirrors the host scheme into this CSS var.
    getColorScheme: () =>
        getComputedStyle(document.documentElement)
            .getPropertyValue("--tg-color-scheme")
            .trim(),
    onThemeChange: (callback) => subscribe("themeChanged", callback),
    getViewportHeight: () => WebApp.viewportHeight || window.innerHeight,
    onViewportChange: (callback) => subscribe("viewportChanged", callback),
    getUser: () => WebApp.initDataUnsafe?.user ?? null,
    getDeviceOrientation: () => {
        const orientation = WebApp.DeviceOrientation
        if (!isTelegram() || typeof orientation?.start !== "function")
            return null
        return {
            get beta() {
                return orientation.beta
            },
            get gamma() {
                return orientation.gamma
            },
            acquire: (onFailed) =>
                acquireDeviceOrientation(orientation, onFailed),
        }
    },
}

export default telegramAdapter
