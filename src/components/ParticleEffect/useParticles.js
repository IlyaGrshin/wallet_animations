import { useEffect, useRef, useState } from "react"

import { createEngine } from "./glEngine"

const pendingStarts = []
let draining = false

const drainStarts = () => {
    pendingStarts.shift()?.()
    if (pendingStarts.length) setTimeout(drainStarts, 0)
    else draining = false
}

const queueStart = (start) => {
    pendingStarts.push(start)
    if (draining) return
    draining = true
    setTimeout(drainStarts, 0)
}

/**
 * Wires the WebGL2 particle engine to React lifecycle and the `hidden` prop.
 *
 * @returns {{ supported: boolean, revealOriginRef: object }} supported is false
 *   when WebGL2 is unavailable (caller shows a static fallback); revealOriginRef
 *   holds the pointer origin for the reveal burst.
 */
export function useParticles({
    canvasRef,
    contentRef,
    hidden,
    color,
    radius,
    padding,
    maskDilation,
}) {
    const [supported, setSupported] = useState(true)
    const revealOriginRef = useRef(null)
    const startRef = useRef(null)
    const engineRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const content = contentRef.current
        if (!canvas || !content) return

        let ro = null
        let io = null

        startRef.current = () => {
            if (engineRef.current) return engineRef.current

            const gl = canvas.getContext("webgl2", {
                premultipliedAlpha: false,
            })
            if (!gl) {
                setSupported(false)
                return null
            }

            const engine = createEngine({
                gl,
                canvas,
                content,
                color,
                radius,
                padding,
                maskDilation,
            })
            engineRef.current = engine
            engine.resize()

            ro = new ResizeObserver(() => engine.resize())
            ro.observe(content)

            // Pause the render loop while scrolled out of the viewport.
            io = new IntersectionObserver(([entry]) => {
                engine.setOnscreen(entry.isIntersecting)
            })
            io.observe(content)

            return engine
        }

        return () => {
            ro?.disconnect()
            io?.disconnect()
            engineRef.current?.destroy()
            engineRef.current = null
            startRef.current = null
        }
    }, [canvasRef, contentRef, color, radius, padding, maskDilation])

    // Spawn the cloud on cover, burst it away on reveal. reveal() before any
    // cover() is a no-op, so the initial mount stays dormant.
    useEffect(() => {
        if (!hidden) {
            engineRef.current?.reveal(revealOriginRef.current)
            return undefined
        }
        if (engineRef.current) {
            engineRef.current.cover()
            return undefined
        }
        let cancelled = false
        queueStart(() => {
            if (!cancelled) startRef.current?.()?.cover()
        })
        return () => {
            cancelled = true
        }
    }, [hidden])

    return { supported, revealOriginRef }
}
