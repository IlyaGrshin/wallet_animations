import { useEffect, useRef, useState } from "react"

export const findScroller = (node) => {
    let el = node?.parentElement
    while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return el
        el = el.parentElement
    }
    return null
}

/**
 * Tracks whether the nearest scrolling ancestor is scrolled away from the top,
 * so a pinned header can fade its surface in.
 * @param {boolean} [enabled=true] Skip the listener entirely when false.
 * @param {number} [threshold=2] Scroll offset in px that counts as scrolled.
 * @returns {[import("react").RefObject, boolean]} Ref for the pinned element.
 * @example
 * const [barRef, scrolled] = useScrolled()
 * <div ref={barRef} className={scrolled ? styles.scrolled : ""} />
 */
export function useScrolled(enabled = true, threshold = 2) {
    const ref = useRef(null)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (!enabled) return

        const scroller = findScroller(ref.current)
        if (!scroller) return

        let raf = 0
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                setScrolled(scroller.scrollTop > threshold)
            })
        }

        onScroll()
        scroller.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            scroller.removeEventListener("scroll", onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [enabled, threshold])

    return [ref, scrolled]
}

export default useScrolled
