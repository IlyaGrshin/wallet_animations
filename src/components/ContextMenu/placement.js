import { clamp } from "../../utils/number"
import WebApp from "../../lib/twa"

const GAP = 8
const EDGE = 12

const insets = () => ({
    top:
        EDGE +
        (WebApp.safeAreaInset?.top ?? 0) +
        (WebApp.contentSafeAreaInset?.top ?? 0),
    bottom:
        EDGE +
        (WebApp.safeAreaInset?.bottom ?? 0) +
        (WebApp.contentSafeAreaInset?.bottom ?? 0),
})

/**
 * Where the lifted row and its menu land. The menu prefers to open below the
 * row, flips above when only that side fits, and when neither does the row
 * itself slides up so the menu fits underneath (iOS behaviour). Horizontally
 * the menu hugs the row edge on the side the press happened.
 * @returns {{ shift: number, top: number, left: number, originX: string, originY: string }}
 */
export const placeMenu = (rect, menu, pointX) => {
    const { top: minTop, bottom: bottomInset } = insets()
    const maxBottom = window.innerHeight - bottomInset
    const fitsBelow = rect.bottom + GAP + menu.height <= maxBottom
    const fitsAbove = rect.top - GAP - menu.height >= minTop
    const below = fitsBelow || !fitsAbove

    let shift = 0
    if (below && !fitsBelow) {
        const target = maxBottom - menu.height - GAP - rect.height
        shift = Math.max(target, minTop) - rect.top
    }

    const top = below ? rect.bottom + shift + GAP : rect.top - GAP - menu.height

    const alignRight = pointX > rect.left + rect.width / 2
    const rawLeft = alignRight
        ? rect.right - EDGE - menu.width
        : rect.left + EDGE
    const left = clamp(
        rawLeft,
        EDGE,
        Math.max(EDGE, window.innerWidth - EDGE - menu.width)
    )

    return {
        shift,
        top,
        left,
        originX: alignRight ? "100%" : "0%",
        originY: below ? "0%" : "100%",
    }
}
