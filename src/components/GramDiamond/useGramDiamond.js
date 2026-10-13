import { useEffect, useRef, useState } from "react"
import { usePlatform } from "../../lib/platform"
import { Appearance, GramDiamond } from "../../lib/gramDiamond/renderer"

function resolveColor(css) {
    const probe = document.createElement("canvas")
    probe.width = 1
    probe.height = 1
    const context = probe.getContext("2d", { willReadFrequently: true })
    context.fillStyle = css
    context.fillRect(0, 0, 1, 1)
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
}

function applyLens(engine, canvas, options) {
    if (!options.tinted && !options.lens) return
    let image = options.lens?.(canvas)
    if (!image) {
        image = document.createElement("canvas")
        image.width = 1
        image.height = 1
    }
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    engine.setRefractionSource({
        image,
        rect: { x: -width / 2, y: -height / 2, width, height },
        mode: "color",
        backgroundColor: options.tinted
            ? resolveColor(getComputedStyle(canvas).color)
            : undefined,
    })
}

const STONE_SCALE = 0.85

export default function useGramDiamond(slotRef, canvasRef, options) {
    const [failed, setFailed] = useState(false)
    const platform = usePlatform()
    const engineRef = useRef(null)
    const latest = useRef(options)

    useEffect(() => {
        latest.current = options
    })

    useEffect(() => {
        const slot = slotRef.current
        const canvas = canvasRef.current
        if (!slot || !canvas) return undefined

        let releaseSwipes = null
        const holdSwipes = (pressed) => {
            if (pressed && !releaseSwipes) {
                releaseSwipes = platform.lockVerticalSwipes()
            } else if (!pressed && releaseSwipes) {
                releaseSwipes()
                releaseSwipes = null
            }
        }

        let engine
        try {
            const style = options.style(slot.clientWidth * STONE_SCALE)
            engine = new GramDiamond(
                canvas,
                { appearance: Appearance.cool, ...style },
                {
                    onBurst: () => platform.haptics.impact("soft"),
                    onPressChanged: (pressed) => {
                        holdSwipes(pressed)
                        latest.current.onPressChanged?.(pressed)
                    },
                    onRaisedChanged: (raised) => {
                        if (raised) applyLens(engine, canvas, latest.current)
                    },
                },
                {
                    input: options.interactive
                        ? slot
                        : document.createElement("div"),
                }
            )
        } catch (error) {
            console.warn("GramDiamond unavailable:", error.message)
            setFailed(true)
            return undefined
        }
        engineRef.current = engine

        applyLens(engine, canvas, options)
        document.fonts?.ready.then(() => {
            if (engineRef.current === engine)
                applyLens(engine, canvas, latest.current)
        })

        const visibility = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) engine.resume()
            else engine.pause()
        })
        visibility.observe(canvas)

        return () => {
            holdSwipes(false)
            visibility.disconnect()
            engine.destroy()
            engineRef.current = null
        }
    }, [])

    useEffect(() => {
        const engine = engineRef.current
        if (engine) applyLens(engine, canvasRef.current, options)
    }, [options.lensKey])

    return failed
}
