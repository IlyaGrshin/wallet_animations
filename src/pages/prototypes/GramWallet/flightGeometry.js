import { cubicBezier } from "motion/react"

// One curve drives every secondary channel (x, scale, gem, card): the slow
// start keeps the lines riding the scroll with the card, then they sweep into
// the centre of the bar. y stays linear so the ride is pixel-locked.
export const gatherEase = cubicBezier(0.86, 0, 0.07, 1)

// Roughly the Dynamic Island's width over the card's: the card collapses to
// about the island's footprint as it leaves the screen.
export const ISLAND_SCALE = 125 / 361

const fontSizeOf = (el) => parseFloat(getComputedStyle(el).fontSize) || 1

// Left edges and vertical centres, matching transform-origin: left center — a
// width difference between the two strings can't shift the start position.
// `origin` is the card's centre in the line's local (unscaled) box, the pivot
// that lets the parked line rotate in the card's plane.
export function measureDelta(element, anchor, scrolled, cardRect) {
    const start = anchor.getBoundingClientRect()
    const rest = element.getBoundingClientRect()
    if (!rest.height || !start.height) return null
    const scale = fontSizeOf(anchor) / fontSizeOf(element)
    return {
        dx: start.left - rest.left,
        dy:
            start.top +
            start.height / 2 -
            (rest.top + rest.height / 2) +
            scrolled,
        scale,
        restTop: rest.top,
        restHeight: rest.height,
        origin: cardRect
            ? {
                  x: (cardRect.left + cardRect.width / 2 - start.left) / scale,
                  y:
                      rest.height / 2 +
                      (cardRect.top +
                          cardRect.height / 2 -
                          (start.top + start.height / 2)) /
                          scale,
              }
            : null,
    }
}

// The card-look layer stays visible only where the card is still behind the
// text: its clip edge is the card's scaled bottom edge, converted into the
// line's local (untransformed) box. One geometric cut, so digits, gem and
// unit can never recolour out of sync.
export function wipeClip(flights, line, p) {
    if (!flights || !line) return "inset(0 0 0 0)"
    if (!flights.card) {
        return p > 0.8 ? "inset(0 0 100% 0)" : "inset(0 0 0 0)"
    }
    const eased = gatherEase(p)
    const scale = 1 + (line.scale - 1) * (1 - eased)
    const lineBottom =
        line.restTop +
        line.restHeight +
        line.dy * (1 - p) +
        ((scale - 1) * line.restHeight) / 2
    const cardBottom =
        flights.card.top -
        p * flights.distance +
        flights.card.height * (1 - (1 - ISLAND_SCALE) * eased)
    const cut = Math.min(
        line.restHeight,
        Math.max(0, (lineBottom - cardBottom) / scale)
    )
    return `inset(0 0 ${cut}px 0)`
}

// Rects must be read with every in-flight transform cleared: the lines carry
// their own transforms and the card shell scales the anchors.
export function withClearedTransforms(elements, fn) {
    const saved = elements.map((el) => [el, el.style.transform])
    for (const [el] of saved) el.style.transform = "none"
    const result = fn()
    for (const [el, prev] of saved) el.style.transform = prev
    return result
}
