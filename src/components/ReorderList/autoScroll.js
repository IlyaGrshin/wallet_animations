const EDGE = 64
const MAX_SPEED = 0.84
const MAX_FRAME_MS = 50

const isScrollable = (element) =>
    /(auto|scroll)/.test(getComputedStyle(element).overflowY) &&
    element.scrollHeight > element.clientHeight

// Innermost first, the page last: when an inner scroller hits its end, the
// drag keeps scrolling through the ones around it.
const scrollersOf = (element) => {
    const scrollers = []
    for (let node = element; node; node = node.parentElement) {
        if (node === document.body) break
        if (isScrollable(node)) scrollers.push(node)
    }
    if (document.scrollingElement) scrollers.push(document.scrollingElement)
    return scrollers
}

const canScroll = (scroller, by) =>
    by < 0
        ? scroller.scrollTop > 0
        : scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 1

const edgeSpeed = (distance) => {
    if (distance >= EDGE) return 0
    const depth = Math.min(1, (EDGE - distance) / EDGE)
    return MAX_SPEED * depth * depth
}

export const startAutoScroll = (element, initialY, pointerId) => {
    const scrollers = scrollersOf(element)
    let target = null
    let pointerY = initialY
    let frame = 0
    let lastTime = null
    let carry = 0

    const onMove = (event) => {
        if (event.pointerId === pointerId) pointerY = event.clientY
    }

    const tick = (time) => {
        frame = requestAnimationFrame(tick)
        const elapsed = Math.min(MAX_FRAME_MS, time - (lastTime ?? time))
        lastTime = time
        if (pointerY == null) return
        // Each scroller's edges are where it shows on screen: its box clipped
        // by every scroller around it, so a partly hidden inner one still has
        // an edge under the finger.
        const edges = []
        let top = 0
        let bottom = window.innerHeight
        for (let i = scrollers.length - 1; i >= 0; i -= 1) {
            if (scrollers[i] !== document.scrollingElement) {
                const rect = scrollers[i].getBoundingClientRect()
                top = Math.max(top, rect.top)
                bottom = Math.min(bottom, rect.bottom)
            }
            edges[i] = { top, bottom }
        }
        // The innermost scroller that wants to move and still can.
        let delta = 0
        const next = scrollers.find((scroller, i) => {
            const edge = edges[i]
            delta =
                edgeSpeed(edge.bottom - pointerY) -
                edgeSpeed(pointerY - edge.top)
            return delta && canScroll(scroller, delta)
        })
        if (!next) {
            carry = 0
            return
        }
        // A fraction owed to one scroller isn't owed to the next.
        if (next !== target) carry = 0
        target = next
        carry += delta * elapsed
        const whole = Math.trunc(carry)
        if (!whole) return
        target.scrollTo({
            top: target.scrollTop + whole,
            behavior: "instant",
        })
        carry -= whole
    }

    window.addEventListener("pointermove", onMove, true)
    frame = requestAnimationFrame(tick)

    return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener("pointermove", onMove, true)
    }
}
