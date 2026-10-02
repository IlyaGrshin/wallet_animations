const EDGE = 64
const MAX_SPEED = 14

const isScrollable = (element) =>
    /(auto|scroll)/.test(getComputedStyle(element).overflowY) &&
    element.scrollHeight > element.clientHeight

const scrollerOf = (element) => {
    for (let node = element?.parentElement; node; node = node.parentElement) {
        if (node === document.body) break
        if (isScrollable(node)) return node
    }
    return document.scrollingElement
}

const edgeSpeed = (distance) => {
    if (distance >= EDGE) return 0
    const depth = Math.min(1, (EDGE - distance) / EDGE)
    return MAX_SPEED * depth * depth
}

export const startAutoScroll = (element, initialY) => {
    const scroller = scrollerOf(element)
    const isRoot = scroller === document.scrollingElement
    let pointerY = initialY
    let frame = 0

    const onMove = (event) => {
        pointerY = event.clientY
    }

    const tick = () => {
        frame = requestAnimationFrame(tick)
        if (pointerY == null || !scroller) return
        const rect = isRoot ? null : scroller.getBoundingClientRect()
        const top = rect ? Math.max(0, rect.top) : 0
        const bottom = rect
            ? Math.min(window.innerHeight, rect.bottom)
            : window.innerHeight
        const delta = edgeSpeed(bottom - pointerY) - edgeSpeed(pointerY - top)
        if (delta) scroller.scrollTop += delta
    }

    window.addEventListener("pointermove", onMove)
    frame = requestAnimationFrame(tick)

    return () => {
        cancelAnimationFrame(frame)
        window.removeEventListener("pointermove", onMove)
    }
}
