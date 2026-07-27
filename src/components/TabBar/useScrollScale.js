import { useEffect, useRef } from "react"
import { useMotionValue, useReducedMotion, useSpring } from "motion/react"

const SCALE_RANGE_PX = 200
const MIN_SCALE = 0.8
const SPRING = { stiffness: 760, damping: 26, mass: 0.65 }

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const findScroller = (node) => {
    let element = node?.parentElement
    while (element) {
        const overflowY = getComputedStyle(element).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return element
        element = element.parentElement
    }
    return null
}

const scaleForPosition = (scrollTop) => {
    const progress = clamp(scrollTop / SCALE_RANGE_PX, 0, 1)
    return 1 - progress * (1 - MIN_SCALE)
}

const scaleAfterScroll = (currentScale, scrollDelta) => {
    const scaleDelta = (scrollDelta / SCALE_RANGE_PX) * (1 - MIN_SCALE)
    return clamp(currentScale - scaleDelta, MIN_SCALE, 1)
}

export const useScrollScale = (rootRef, enabled) => {
    const currentScaleRef = useRef(1)
    const previousScrollTopRef = useRef(0)
    const reducedMotion = useReducedMotion()
    const target = useMotionValue(1)
    const scale = useSpring(target, SPRING)

    const setScale = (nextScale) => {
        currentScaleRef.current = nextScale
        target.set(nextScale)
        if (reducedMotion) scale.jump(nextScale)
    }

    useEffect(() => {
        if (!enabled) {
            setScale(1)
            return
        }

        const scroller = findScroller(rootRef.current)
        if (!scroller) return

        previousScrollTopRef.current = Math.max(scroller.scrollTop, 0)
        setScale(scaleForPosition(previousScrollTopRef.current))

        let frame = 0
        const updateScale = () => {
            if (frame) return
            frame = requestAnimationFrame(() => {
                frame = 0
                const scrollTop = Math.max(scroller.scrollTop, 0)
                const scrollDelta = scrollTop - previousScrollTopRef.current
                previousScrollTopRef.current = scrollTop
                setScale(
                    scaleAfterScroll(currentScaleRef.current, scrollDelta)
                )
            })
        }

        scroller.addEventListener("scroll", updateScale, { passive: true })
        return () => {
            scroller.removeEventListener("scroll", updateScale)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [enabled, reducedMotion, rootRef, scale, target])

    const expand = () => {
        const scroller = findScroller(rootRef.current)
        previousScrollTopRef.current = Math.max(scroller?.scrollTop || 0, 0)
        setScale(1)
    }

    return { scale, expand }
}
