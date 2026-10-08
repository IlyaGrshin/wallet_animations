import { useLayoutEffect } from "react"
import { generateClipPath } from "@lisse/core"

const nativeSquircle =
    typeof CSS !== "undefined" &&
    CSS.supports("corner-shape", "superellipse(1.5)")

/**
 * Clips the element in `ref` to a squircle sized from its ResizeObserver
 * entries, so neither renders nor reveals read layout. A no-op where CSS
 * `corner-shape` draws the corners natively.
 * @param {import("react").RefObject<HTMLElement>} ref Element to clip.
 * @param {{ radius: number, smoothing: number }} corners Corner shape.
 * @example
 * const ref = useRef(null)
 * useSquircleClip(ref, { radius: 26, smoothing: 0.6 })
 * <div ref={ref} />
 */
export default function useSquircleClip(ref, { radius, smoothing }) {
    useLayoutEffect(() => {
        const el = ref.current
        if (nativeSquircle || !el) return undefined
        let lastWidth = 0
        let lastHeight = 0
        const observer = new ResizeObserver(([entry]) => {
            const [{ inlineSize: width, blockSize: height }] =
                entry.borderBoxSize
            if (width <= 0 || height <= 0) return
            if (width === lastWidth && height === lastHeight) return
            lastWidth = width
            lastHeight = height
            el.style.clipPath = generateClipPath(width, height, {
                radius,
                smoothing,
            })
        })
        observer.observe(el)
        return () => {
            observer.disconnect()
            el.style.clipPath = ""
        }
    }, [ref, radius, smoothing])
}
