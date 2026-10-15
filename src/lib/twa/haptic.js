import WebApp from "./webApp"

// Guarded haptics: older Telegram clients lack HapticFeedback or throw on
// unsupported styles, and a missing buzz must never break the interaction.
const run = (fn) => {
    try {
        fn(WebApp.HapticFeedback)
    } catch {
        // older clients may not support HapticFeedback
    }
}

export const haptic = {
    impact: (style) => run((h) => h?.impactOccurred(style)),
    notify: (type) => run((h) => h?.notificationOccurred(type)),
    selection: () => run((h) => h?.selectionChanged()),
}
