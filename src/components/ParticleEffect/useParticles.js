import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { clearStill, drawStill } from "./stillFrame"

// The WebGL renderer (shaders included) is a separate chunk: nothing loads
// until an effect is covered or the browser is idle, so it never weighs on
// initial JS or on the first paint of a page.
let loading = null
// Instances parked until idle; a cover anywhere starts the load, so they all
// register right away instead of waiting out the idle timer (1s on iOS).
const idleWaiters = new Set()

const loadRenderer = () => {
    loading ??= import("./renderer").then((m) => m.getRenderer())
    for (const resolve of idleWaiters) resolve()
    idleWaiters.clear()
    return loading
}

const loadWhenIdle = () =>
    loading ??
    new Promise((resolve) => {
        idleWaiters.add(resolve)
        if (window.requestIdleCallback) window.requestIdleCallback(resolve)
        else setTimeout(resolve, 1000)
    }).then(loadRenderer)

/**
 * Registers the element with the shared particle renderer and maps the
 * `hidden` prop onto cover / reveal.
 *
 * @returns {{ supported: boolean, revealOriginRef: object }} supported is false
 *   when WebGL2 is unavailable (caller shows a static fallback); revealOriginRef
 *   holds the pointer origin for the next reveal burst (consumed on change).
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
    const handleRef = useRef(null)
    const hiddenRef = useRef(hidden)

    // Until the renderer is registered, paint a still cloud before the browser
    // paints the hidden state, so the value never leaves an empty gap.
    useLayoutEffect(() => {
        if (!hidden) clearStill(canvasRef.current)
        if (!hidden || handleRef.current) return
        drawStill(canvasRef.current, contentRef.current, {
            color,
            radius,
            padding,
            maskDilation,
        })
    }, [hidden, canvasRef, contentRef, color, radius, padding, maskDilation])

    // Declared before registration so hiddenRef is current when it runs.
    // reveal() before any cover() is a no-op, so the initial mount stays dormant.
    useEffect(() => {
        hiddenRef.current = hidden
        const handle = handleRef.current
        if (!hidden) handle?.reveal(revealOriginRef.current)
        else if (handle) handle.cover()
        else loadRenderer() // registration below covers once it resolves
        revealOriginRef.current = null
    }, [hidden])

    // Option changes re-register; a still covered element is covered again.
    useEffect(() => {
        const canvas = canvasRef.current
        const content = contentRef.current
        if (!canvas || !content) return undefined

        let cancelled = false
        let handle = null
        const load = hiddenRef.current ? loadRenderer() : loadWhenIdle()
        load.then((renderer) => {
            if (cancelled) return
            if (!renderer) {
                setSupported(false)
                return
            }
            handle = renderer.register({
                canvas,
                content,
                color,
                radius,
                padding,
                maskDilation,
            })
            handleRef.current = handle
            if (hiddenRef.current) handle.cover()
        })

        return () => {
            cancelled = true
            handle?.destroy()
            handleRef.current = null
        }
    }, [canvasRef, contentRef, color, radius, padding, maskDilation])

    return { supported, revealOriginRef }
}
