import { useEffect, useRef, useState } from "react"

import { findScroller } from "./useScrolled"

// Fractions of the title row that must pass under the bar before the fade
// starts and before it finishes. The tail lands where the last of the text
// clears the bar's edge, so the title is gone exactly as it is clipped.
const FADE_START = 0.2
const FADE_END = 0.8
const CROSSOVER = 0.5

const smoothstep = (t) => t * t * (3 - 2 * t)

/**
 * Drives an iOS large title as it scrolls under a pinned bar: fades it in step
 * with the scroll (written straight to the node, no re-render) and reports when
 * an inline title should take over.
 * @param {boolean} [enabled=true] Skip the listener entirely when false.
 * @returns {[import("react").RefObject, import("react").RefObject, boolean]}
 *   Ref for the bar, ref for the large title, and the handover flag.
 * @example
 * const [barRef, titleRef, collapsed] = useTitleCollapse()
 * <div ref={barRef} />
 * <h1 ref={titleRef} />
 */
export function useTitleCollapse(enabled = true) {
    const barRef = useRef(null)
    const titleRef = useRef(null)
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        if (!enabled) return

        const bar = barRef.current
        const title = titleRef.current
        if (!bar || !title) return

        const scroller = findScroller(title)
        const target = scroller ?? window

        let raf = 0
        let painted = -1

        const measure = () => {
            raf = 0

            const titleRect = title.getBoundingClientRect()
            if (!titleRect.height) return

            const past =
                (bar.getBoundingClientRect().bottom - titleRect.top) /
                titleRect.height
            const ramp = Math.min(
                Math.max((past - FADE_START) / (FADE_END - FADE_START), 0),
                1
            )
            const opacity = 1 - smoothstep(ramp)

            if (Math.abs(opacity - painted) > 0.004) {
                painted = opacity
                title.style.opacity = String(opacity)
            }
            setCollapsed(past >= CROSSOVER)
        }

        const schedule = () => {
            if (raf) return
            raf = requestAnimationFrame(measure)
        }

        measure()
        target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)

        return () => {
            target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (raf) cancelAnimationFrame(raf)
            title.style.opacity = ""
        }
    }, [enabled])

    return [barRef, titleRef, collapsed]
}

export default useTitleCollapse
