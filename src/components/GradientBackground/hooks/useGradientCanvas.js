import { useEffect, useEffectEvent } from "react"
import { MAX_CANVAS_SIZE, RESIZE_DEBOUNCE_GRADIENT } from "../utils/constants"
import {
    getContainerDimensions,
    normalizePositions,
    parseColor,
} from "../utils/gradientUtils"

export function useGradientCanvas({
    canvasRef,
    containerRef,
    activeColors,
    positions,
    rotation,
    intensity,
}) {
    const generateGradient = useEffectEvent(() => {
        const canvas = canvasRef.current
        const container = containerRef.current

        if (
            !canvas ||
            !container ||
            !activeColors ||
            activeColors.length !== 4
        ) {
            return
        }

        const { width, height } = getContainerDimensions(container)

        if (
            width <= 0 ||
            height <= 0 ||
            !isFinite(width) ||
            !isFinite(height)
        ) {
            const minWidth = 100
            const minHeight = 100
            canvas.width = minWidth
            canvas.height = minHeight

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const topLeft = parseColor(activeColors[0])
            ctx.fillStyle = `rgb(${topLeft[0]}, ${topLeft[1]}, ${topLeft[2]})`
            ctx.fillRect(0, 0, minWidth, minHeight)
            return
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        if (!ctx) {
            return
        }

        const topRight = parseColor(activeColors[0])
        const bottomRight = parseColor(activeColors[1])
        const bottomLeft = parseColor(activeColors[2])
        const topLeft = parseColor(activeColors[3])

        ctx.clearRect(0, 0, width, height)

        const validPositions = normalizePositions(positions)

        const centerX = 0.5
        const centerY = 0.5
        const rotationRad = (rotation * Math.PI) / 180

        const rotatedPositions = validPositions.map((pos) => {
            if (rotationRad === 0) {
                return pos
            }

            const relX = pos.x - centerX
            const relY = pos.y - centerY

            const cos = Math.cos(rotationRad)
            const sin = Math.sin(rotationRad)
            const rotatedX = relX * cos - relY * sin
            const rotatedY = relX * sin + relY * cos

            return {
                x: rotatedX + centerX,
                y: rotatedY + centerY,
            }
        })

        const scale = width * height > MAX_CANVAS_SIZE ? 0.5 : 1
        const scaledWidth = Math.floor(width * scale)
        const scaledHeight = Math.floor(height * scale)

        const finalImageData = ctx.createImageData(scaledWidth, scaledHeight)
        const finalData = finalImageData.data

        for (let y = 0; y < scaledHeight; y++) {
            const directPixelY = y / scaledHeight
            const centerDistanceY = directPixelY - 0.5
            const centerDistanceY2 = centerDistanceY * centerDistanceY

            for (let x = 0; x < scaledWidth; x++) {
                const index = (y * scaledWidth + x) * 4

                const directPixelX = x / scaledWidth
                const centerDistanceX = directPixelX - 0.5
                const centerDistance = Math.sqrt(
                    centerDistanceX * centerDistanceX + centerDistanceY2
                )

                const swirlFactor = 0.35 * centerDistance
                const theta = swirlFactor * swirlFactor * 0.8 * 8.0
                const sinTheta = Math.sin(theta)
                const cosTheta = Math.cos(theta)

                const pixelX = Math.max(
                    0.0,
                    Math.min(
                        1.0,
                        0.5 +
                            centerDistanceX * cosTheta -
                            centerDistanceY * sinTheta
                    )
                )
                const pixelY = Math.max(
                    0.0,
                    Math.min(
                        1.0,
                        0.5 +
                            centerDistanceX * sinTheta +
                            centerDistanceY * cosTheta
                    )
                )

                let distanceSum = 0.0
                let r = 0.0
                let g = 0.0
                let b = 0.0

                const colorsArray = [topRight, bottomRight, bottomLeft, topLeft]

                for (let i = 0; i < 4; i++) {
                    const colorX = rotatedPositions[i].x
                    const colorY = rotatedPositions[i].y

                    const distanceX = pixelX - colorX
                    const distanceY = pixelY - colorY

                    let distance = Math.max(
                        0.0,
                        0.9 -
                            Math.sqrt(
                                distanceX * distanceX + distanceY * distanceY
                            )
                    )
                    distance = distance * distance * distance * distance

                    distanceSum += distance
                    r += distance * colorsArray[i][0]
                    g += distance * colorsArray[i][1]
                    b += distance * colorsArray[i][2]
                }

                finalData[index] = Math.round(r / distanceSum)
                finalData[index + 1] = Math.round(g / distanceSum)
                finalData[index + 2] = Math.round(b / distanceSum)
                finalData[index + 3] = 255
            }
        }

        if (scale !== 1) {
            if (
                !canvas._tempCanvas ||
                canvas._tempCanvas.width !== scaledWidth ||
                canvas._tempCanvas.height !== scaledHeight
            ) {
                canvas._tempCanvas = document.createElement("canvas")
                canvas._tempCanvas.width = scaledWidth
                canvas._tempCanvas.height = scaledHeight
            }
            const tempCtx = canvas._tempCanvas.getContext("2d")
            tempCtx.putImageData(finalImageData, 0, 0)

            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(canvas._tempCanvas, 0, 0, width, height)
        } else {
            ctx.putImageData(finalImageData, 0, 0)
        }

        if (intensity !== 1) {
            if (
                !canvas._intensityCanvas ||
                canvas._intensityCanvas.width !== width ||
                canvas._intensityCanvas.height !== height
            ) {
                canvas._intensityCanvas = document.createElement("canvas")
                canvas._intensityCanvas.width = width
                canvas._intensityCanvas.height = height
            }
            const tempCtx = canvas._intensityCanvas.getContext("2d")
            tempCtx.globalAlpha = intensity
            tempCtx.drawImage(canvas, 0, 0)
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(canvas._intensityCanvas, 0, 0)
        }
    })

    useEffect(() => {
        let timeoutId = null
        let resizeTimeoutId = null

        const scheduleGeneration = (delay = 0) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            timeoutId = setTimeout(() => {
                generateGradient()
                timeoutId = null
            }, delay)
        }

        scheduleGeneration(0)

        const handleResize = () => {
            if (resizeTimeoutId) {
                clearTimeout(resizeTimeoutId)
            }
            resizeTimeoutId = setTimeout(() => {
                generateGradient()
                resizeTimeoutId = null
            }, RESIZE_DEBOUNCE_GRADIENT)
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
        }
    }, [activeColors, rotation, intensity, positions, containerRef])
}
