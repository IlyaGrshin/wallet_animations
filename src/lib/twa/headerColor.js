import WebApp from "./webApp"

/**
 * Paints the Telegram header, e.g. to continue a hero colour under it.
 * Outside Telegram the browser's theme-color stands in for it.
 * @param {string | null} color A hex colour, or null for the page colour.
 */
export function paintHeader(color) {
    if (WebApp.initData) {
        WebApp.setHeaderColor(color ?? "secondary_bg_color")
        return
    }
    const fallback = getComputedStyle(document.body)
        .getPropertyValue("--tg-theme-secondary-bg-color")
        .trim()
    document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", color ?? fallback)
}
