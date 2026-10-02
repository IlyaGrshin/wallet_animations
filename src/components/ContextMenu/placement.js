import { clamp } from "../../utils/number"
import WebApp from "../../lib/twa"

const GAP = 8
const EDGE = 12

// Telegram's device and content safe areas plus the visual edge margin.
const inset = (side) =>
    EDGE +
    (WebApp.safeAreaInset?.[side] ?? 0) +
    (WebApp.contentSafeAreaInset?.[side] ?? 0)

/**
 * Where the lifted row and its menu land. The menu prefers to open below the
 * row, flips above when only that side fits, and when neither does the row
 * itself slides up so the menu fits underneath (iOS behaviour). Horizontally
 * a wide element (a row) keeps the menu inset on the side the press happened;
 * a narrow one (a button) lines the menu up with its edge facing the screen
 * centre. `scale` is the lifted growth, so the gap clears the grown element.
 * @returns {{ shift: number, top: number, left: number, maxHeight?: number, originX: string, originY: string }}
 */
export const placeMenu = (rect, menu, pointX, scale = 1) => {
    const minTop = inset("top")
    const maxBottom = window.innerHeight - inset("bottom")
    const minLeft = inset("left")
    const maxRight = window.innerWidth - inset("right")
    const gap = GAP + (rect.height * (scale - 1)) / 2
    const fitsBelow = rect.bottom + gap + menu.height <= maxBottom
    const fitsAbove = rect.top - gap - menu.height >= minTop
    const below = fitsBelow || !fitsAbove

    let shift = 0
    if (below && !fitsBelow) {
        const target = maxBottom - menu.height - gap - rect.height
        shift = Math.max(target, minTop) - rect.top
    }

    const top = below ? rect.bottom + shift + gap : rect.top - gap - menu.height
    // When even the shifted row leaves too little room (short viewport, long
    // list), the menu is capped to what is left and scrolls inside.
    const maxHeight = below ? maxBottom - top : undefined

    const wide = rect.width >= menu.width
    const center = rect.left + rect.width / 2
    const alignRight = wide ? pointX > center : center > window.innerWidth / 2
    const offset = wide ? EDGE : 0
    const rawLeft = alignRight
        ? rect.right - offset - menu.width
        : rect.left + offset
    const left = clamp(
        rawLeft,
        minLeft,
        Math.max(minLeft, maxRight - menu.width)
    )

    return {
        shift,
        top,
        left,
        maxHeight,
        originX: alignRight ? "100%" : "0%",
        originY: below ? "0%" : "100%",
    }
}
