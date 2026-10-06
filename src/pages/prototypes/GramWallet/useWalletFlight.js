import { useLayoutEffect, useState } from "react"
import { animate, useMotionValue, useTransform } from "motion/react"

import { findScroller } from "../../../hooks/useScrolled"

import {
    ISLAND_SCALE,
    gatherEase,
    measureDelta,
    wipeClip,
    withClearedTransforms,
} from "./flightGeometry"

const clamp01 = (value) => Math.min(1, Math.max(0, value))

// Like native large-title bars: a scroll released inside the transition zone
// settles to whichever end is closer, so the morph never parks midway.
const SNAP_DELAY_MS = 140
const SNAP_EASE = [0.23, 1, 0.32, 1]

// WalletCard's .scene perspective — cq(1000) against the 220-tall design —
// converted to px through the measured card height.
const TILT_PERSPECTIVE = 1000 / 220

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
            while (
                bar.parentElement &&
                bar.parentElement !== scroller &&
                getComputedStyle(bar.parentElement).display !== "contents"
            ) {
                bar = bar.parentElement
            }
            return bar.getBoundingClientRect().bottom
        }

        const measure = () => {
            const scrolled = scroller?.scrollTop ?? 0
            scrollY.set(scrolled)
            const cleared = [cardEl, gramEl, fiatEl].filter(Boolean)
            const next = withClearedTransforms(cleared, () => {
                const cardRect = cardEl?.getBoundingClientRect()
                const gram = measureDelta(gramEl, gramAnchor, scrolled, cardRect)
                const fiat = measureDelta(fiatEl, fiatAnchor, scrolled, cardRect)
                if (!gram || !fiat) return null
                return {
                    gram,
                    fiat,
                    distance: Math.max(gram.dy, fiat.dy),
                    tiltPerspective: cardRect
                        ? cardRect.height * TILT_PERSPECTIVE
                        : 0,
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
        tilt:
            flights?.card && flights.gram.origin
                ? {
                      perspective: flights.tiltPerspective,
                      gram: flights.gram.origin,
                      fiat: flights.fiat.origin,
                  }
                : null,
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
