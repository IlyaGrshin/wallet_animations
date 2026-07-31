import { useLayoutEffect, useState } from "react"
import {
    animate,
    cubicBezier,
    useMotionValue,
    useTransform,
} from "motion/react"

import { findScroller } from "../../../hooks/useScrolled"

const clamp01 = (value) => Math.min(1, Math.max(0, value))

const fontSizeOf = (el) => parseFloat(getComputedStyle(el).fontSize) || 1

// One curve drives every secondary channel (x, scale, gem, card): the slow
// start keeps the lines riding the scroll with the card, then they sweep into
// the centre of the bar. y stays linear so the ride is pixel-locked.
const gatherEase = cubicBezier(0.86, 0, 0.07, 1)

// Roughly the Dynamic Island's width over the card's: the card collapses to
// about the island's footprint as it leaves the screen.
const ISLAND_SCALE = 125 / 361

// Like native large-title bars: a scroll released inside the transition zone
// settles to whichever end is closer, so the morph never parks midway.
const SNAP_DELAY_MS = 140
const SNAP_EASE = [0.23, 1, 0.32, 1]

// Left edges and vertical centres, matching transform-origin: left center — a
// width difference between the two strings can't shift the start position.
function measureDelta(element, anchor, scrolled) {
    const start = anchor.getBoundingClientRect()
    const rest = element.getBoundingClientRect()
    if (!rest.height || !start.height) return null
    return {
        dx: start.left - rest.left,
        dy:
            start.top +
            start.height / 2 -
            (rest.top + rest.height / 2) +
            scrolled,
        scale: fontSizeOf(anchor) / fontSizeOf(element),
        restTop: rest.top,
        restHeight: rest.height,
    }
}

// The card-look layer stays visible only where the card is still behind the
// text: its clip edge is the card's scaled bottom edge, converted into the
// line's local (untransformed) box. One geometric cut, so digits, gem and
// unit can never recolour out of sync.
function wipeClip(flights, line, p) {
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
function withClearedTransforms(elements, fn) {
    const saved = elements.map((el) => [el, el.style.transform])
    for (const [el] of saved) el.style.transform = "none"
    const result = fn()
    for (const [el, prev] of saved) el.style.transform = prev
    return result
}

export default function useWalletFlight({
    cardEl,
    gramAnchor,
    fiatAnchor,
    gramEl,
    fiatEl,
}) {
    const scrollY = useMotionValue(0)
    const [flights, setFlights] = useState(null)

    useLayoutEffect(() => {
        if (!gramAnchor || !fiatAnchor || !gramEl || !fiatEl) return
        const scroller = findScroller(gramEl)
        let distance = 0
        let collapse = 0

        // The bar is the scroller child that hosts the flying lines; its
        // bottom edge marks where the buttons should dock when collapsed.
        const barBottom = () => {
            let bar = gramEl
            while (bar.parentElement && bar.parentElement !== scroller) {
                bar = bar.parentElement
            }
            return bar.getBoundingClientRect().bottom
        }

        const measure = () => {
            const scrolled = scroller?.scrollTop ?? 0
            scrollY.set(scrolled)
            const cleared = [cardEl, gramEl, fiatEl].filter(Boolean)
            const next = withClearedTransforms(cleared, () => {
                const gram = measureDelta(gramEl, gramAnchor, scrolled)
                const fiat = measureDelta(fiatEl, fiatAnchor, scrolled)
                if (!gram || !fiat) return null
                const cardRect = cardEl?.getBoundingClientRect()
                return {
                    gram,
                    fiat,
                    distance: Math.max(gram.dy, fiat.dy),
                    card: cardRect
                        ? {
                              top: cardRect.top + scrolled,
                              height: cardRect.height,
                          }
                        : null,
                }
            })
            const ok = next?.distance > 0
            distance = ok ? next.distance : 0
            // The collapsed rest position tucks the card's whole layout box
            // behind the bar, so the buttons dock right under it — the flight
            // itself still completes at `distance`.
            collapse =
                ok && next.card && scroller
                    ? Math.max(
                          distance,
                          next.card.top + next.card.height - barBottom()
                      )
                    : distance
            setFlights(ok ? next : null)
        }
        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(gramAnchor)
        observer.observe(fiatAnchor)

        if (!scroller) return () => observer.disconnect()

        let snapTimer = 0
        let settling = null
        let touching = false

        const snap = () => {
            if (touching || !distance) return
            const from = scroller.scrollTop
            if (from <= 0 || from >= collapse) return
            settling = animate(from, from > distance / 2 ? collapse : 0, {
                duration: 0.35,
                ease: SNAP_EASE,
                onUpdate: (value) => {
                    scroller.scrollTop = value
                },
            })
        }
        const scheduleSnap = () => {
            clearTimeout(snapTimer)
            snapTimer = setTimeout(snap, SNAP_DELAY_MS)
        }
        const onScroll = () => {
            scrollY.set(scroller.scrollTop)
            scheduleSnap()
        }
        const onTouchStart = () => {
            touching = true
            settling?.stop()
            clearTimeout(snapTimer)
        }
        const onTouchEnd = () => {
            touching = false
            scheduleSnap()
        }
        const onWheel = () => settling?.stop()

        scroller.addEventListener("scroll", onScroll, { passive: true })
        scroller.addEventListener("touchstart", onTouchStart, { passive: true })
        scroller.addEventListener("touchend", onTouchEnd, { passive: true })
        scroller.addEventListener("touchcancel", onTouchEnd, { passive: true })
        scroller.addEventListener("wheel", onWheel, { passive: true })
        scheduleSnap()
        return () => {
            observer.disconnect()
            clearTimeout(snapTimer)
            settling?.stop()
            scroller.removeEventListener("scroll", onScroll)
            scroller.removeEventListener("touchstart", onTouchStart)
            scroller.removeEventListener("touchend", onTouchEnd)
            scroller.removeEventListener("touchcancel", onTouchEnd)
            scroller.removeEventListener("wheel", onWheel)
        }
    }, [cardEl, gramAnchor, fiatAnchor, gramEl, fiatEl, scrollY])

    const progress = useTransform(scrollY, (value) =>
        flights ? clamp01(value / flights.distance) : 0
    )
    const gather = useTransform(progress, gatherEase)

    return {
        ready: flights ? 1 : 0,
        progress,
        gather,
        gram: {
            x: useTransform(gather, (v) => (flights ? flights.gram.dx * (1 - v) : 0)),
            y: useTransform(progress, (v) => (flights ? flights.gram.dy * (1 - v) : 0)),
            scale: useTransform(gather, (v) =>
                flights ? 1 + (flights.gram.scale - 1) * (1 - v) : 1
            ),
            wipe: useTransform(progress, (p) => wipeClip(flights, flights?.gram, p)),
        },
        fiat: {
            x: useTransform(gather, (v) => (flights ? flights.fiat.dx * (1 - v) : 0)),
            y: useTransform(progress, (v) => (flights ? flights.fiat.dy * (1 - v) : 0)),
            scale: useTransform(gather, (v) =>
                flights ? 1 + (flights.fiat.scale - 1) * (1 - v) : 1
            ),
            wipe: useTransform(progress, (p) => wipeClip(flights, flights?.fiat, p)),
        },
        card: {
            scale: useTransform(gather, (v) => 1 - (1 - ISLAND_SCALE) * v),
            fade: useTransform(progress, [0, 0.7], [1, 0]),
        },
    }
}
