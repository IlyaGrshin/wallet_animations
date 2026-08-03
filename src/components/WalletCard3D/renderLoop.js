import {
    TILT_IDLE_EPSILON,
    TILT_SMOOTH,
    startTiltSource,
} from "../WalletCard/tiltSource"

const MAX_TILT = 0.32
const MAX_PIXEL_RATIO = 2

export function startCardLoop(canvas, gl, scene, contents) {
    const current = { x: 0, y: 0 }
    let raf = 0
    let stopped = false
    let onScreen = true
    let needsRedraw = true

    const ensureLoop = () => {
        if (!raf && !stopped && onScreen && !document.hidden) {
            raf = requestAnimationFrame(tick)
        }
    }
    const source = startTiltSource(ensureLoop)

    const requestRedraw = () => {
        needsRedraw = true
        ensureLoop()
    }

    const resize = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
        const width = Math.round(canvas.clientWidth * pixelRatio)
        const height = Math.round(canvas.clientHeight * pixelRatio)
        if (!width || !height) return
        if (canvas.width === width && canvas.height === height) return
        canvas.width = width
        canvas.height = height
        requestRedraw()
    }

    function tick() {
        raf = 0
        source.poll()
        const dx = source.target.x - current.x
        const dy = source.target.y - current.y
        const moving =
            Math.abs(dx) > TILT_IDLE_EPSILON || Math.abs(dy) > TILT_IDLE_EPSILON
        current.x += dx * TILT_SMOOTH
        current.y += dy * TILT_SMOOTH

        if (moving || needsRedraw) {
            needsRedraw = false
            scene.draw({
                meshes: contents.meshes,
                textures: contents.textures,
                tiltX: current.y * MAX_TILT,
                tiltY: current.x * MAX_TILT,
            })
        }

        // Nothing animates on its own, so a settled web card parks the loop.
        // The Telegram path keeps ticking because gamma/beta need polling.
        if (!source.live && !moving) return
        ensureLoop()
    }

    const onVisibility = () => {
        if (document.hidden) cancel()
        else requestRedraw()
    }
    const onContextLost = (event) => {
        event.preventDefault()
        cancel()
        stopped = true
    }
    const cancel = () => {
        cancelAnimationFrame(raf)
        raf = 0
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const visibility = new IntersectionObserver((entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting)
        if (onScreen) requestRedraw()
        else cancel()
    })
    visibility.observe(canvas)
    document.addEventListener("visibilitychange", onVisibility)
    canvas.addEventListener("webglcontextlost", onContextLost)
    ensureLoop()

    return {
        requestRedraw,
        stop: () => {
            stopped = true
            cancel()
            observer.disconnect()
            visibility.disconnect()
            document.removeEventListener("visibilitychange", onVisibility)
            canvas.removeEventListener("webglcontextlost", onContextLost)
            source.stop()
        },
    }
}
