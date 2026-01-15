import { useEffect, useEffectEvent, useRef } from "react"
import {
    DEVICE_PIXEL_RATIO_MAX,
    PATTERN_INITIAL_DELAY,
    RESIZE_DEBOUNCE_PATTERN,
} from "../utils/constants"
import { getContainerDimensions } from "../utils/gradientUtils"
import { fillCanvasWithPattern } from "../utils/patternUtils"

export function usePatternCanvas({
    patternCanvasRef,
    containerRef,
    patternUrl,
    activeIsDarkPattern,
}) {
    const patternImageRef = useRef(null)
    const patternDimensionsRef = useRef({ width: 0, height: 0 })

    const renderPattern = useEffectEvent((forceRender = false) => {
        const patternCanvas = patternCanvasRef.current
        const container = containerRef.current

        if (!patternCanvas || !container || !patternUrl) {
            return
        }

        if (!patternCanvas.isConnected) {
            return
        }

        const { width: baseWidth, height: baseHeight } =
            getContainerDimensions(container)

        if (
            baseWidth <= 0 ||
            baseHeight <= 0 ||
            !isFinite(baseWidth) ||
            !isFinite(baseHeight)
        ) {
            return
        }

        const devicePixelRatio = Math.min(
            DEVICE_PIXEL_RATIO_MAX,
            window.devicePixelRatio || 1
        )
        const width = Math.round(baseWidth * devicePixelRatio)
        const height = Math.round(baseHeight * devicePixelRatio)

        const prevDimensions = patternDimensionsRef.current
        const widthChanged = Math.abs(width - prevDimensions.width) > 1
        const heightChanged = Math.abs(height - prevDimensions.height) > 1

        if (
            !forceRender &&
            !widthChanged &&
            !heightChanged &&
            patternImageRef.current
        ) {
            return
        }

        patternDimensionsRef.current = { width, height }
        patternCanvas.dpr = devicePixelRatio

        if (widthChanged || heightChanged) {
            patternCanvas.width = width
            patternCanvas.height = height
        }

        const ctx = patternCanvas.getContext("2d")
        if (!ctx) return

        if (patternImageRef.current && patternImageRef.current.complete) {
            if (
                patternCanvas.width === width &&
                patternCanvas.height === height
            ) {
                fillCanvasWithPattern(
                    ctx,
                    patternCanvas,
                    patternImageRef.current,
                    width,
                    height,
                    activeIsDarkPattern
                )
            }
            return
        }

        const img = patternImageRef.current || new Image()
        if (!patternImageRef.current) {
            patternImageRef.current = img
            img.crossOrigin = "anonymous"

            img.onload = () => {
                if (
                    patternCanvas.width !== width ||
                    patternCanvas.height !== height
                ) {
                    return
                }

                fillCanvasWithPattern(
                    ctx,
                    patternCanvas,
                    img,
                    width,
                    height,
                    activeIsDarkPattern
                )
            }

            img.onerror = (error) => {
                console.warn("Failed to load pattern image:", patternUrl, error)
            }

            img.src = patternUrl
        } else if (img.complete) {
            fillCanvasWithPattern(
                ctx,
                patternCanvas,
                img,
                width,
                height,
                activeIsDarkPattern
            )
        }
    })

    useEffect(() => {
        if (!patternUrl) {
            patternImageRef.current = null
            patternDimensionsRef.current = { width: 0, height: 0 }
            return
        }

        patternImageRef.current = null
        patternDimensionsRef.current = { width: 0, height: 0 }

        let timeoutId = null
        let resizeTimeoutId = null

        const scheduleRender = (delay = 0) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            timeoutId = setTimeout(() => {
                renderPattern()
                timeoutId = null
            }, delay)
        }

        scheduleRender(PATTERN_INITIAL_DELAY)

        const handleResize = () => {
            if (resizeTimeoutId) {
                clearTimeout(resizeTimeoutId)
            }
            resizeTimeoutId = setTimeout(() => {
                requestAnimationFrame(() => {
                    renderPattern()
                })
                resizeTimeoutId = null
            }, RESIZE_DEBOUNCE_PATTERN)
        }

        window.addEventListener("resize", handleResize)
        const resizeObserver = new ResizeObserver(() => {
            handleResize()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            if (resizeTimeoutId) {
                clearTimeout(resizeTimeoutId)
            }
            window.removeEventListener("resize", handleResize)
            resizeObserver.disconnect()
            patternImageRef.current = null
            patternDimensionsRef.current = { width: 0, height: 0 }
        }
    }, [patternUrl, activeIsDarkPattern, containerRef])
}
