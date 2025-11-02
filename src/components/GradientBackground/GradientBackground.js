import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

import * as styles from "./GradientBackground.module.scss"

/**
 * Генерирует 4-цветный градиент на canvas как фоновое изображение
 * Основано на алгоритме градиентов Telegram
 */
function GradientBackground({
    colors,
    className = "",
    rotation = 0,
    intensity = 1,
    positions = null,
    ...restProps
}) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)

    // Парсинг цветов в формат RGB
    const parseColor = (color) => {
        if (!color) return [0, 0, 0]

        // Если цвет в формате #RRGGBB
        if (color.startsWith("#")) {
            const hex = color.slice(1)
            const r = parseInt(hex.slice(0, 2), 16)
            const g = parseInt(hex.slice(2, 4), 16)
            const b = parseInt(hex.slice(4, 6), 16)
            return [r, g, b]
        }

        // Если цвет в формате rgb(r, g, b)
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (rgbMatch) {
            return [
                parseInt(rgbMatch[1], 10),
                parseInt(rgbMatch[2], 10),
                parseInt(rgbMatch[3], 10),
            ]
        }

        return [0, 0, 0]
    }

    // Генерация градиента на canvas
    const generateGradient = () => {
        const canvas = canvasRef.current
        const container = containerRef.current

        if (!canvas || !container || !colors || colors.length !== 4) {
            return
        }

        const rect = container.getBoundingClientRect()
        // Используем style.height если rect.height еще не готов
        const styleHeight = container.style?.height
        const styleWidth = container.style?.width

        // Парсим размеры из style (могут быть в формате "500px", "100%", и т.д.)
        const parseSize = (size) => {
            if (!size) return null
            const match = size.toString().match(/^(\d+(?:\.\d+)?)(px)?$/)
            if (match) {
                return parseFloat(match[1])
            }
            return null
        }

        const width = rect.width || parseSize(styleWidth) || window.innerWidth
        const height =
            rect.height || parseSize(styleHeight) || window.innerHeight || 100

        // Проверяем, что размеры валидны
        if (
            width <= 0 ||
            height <= 0 ||
            !isFinite(width) ||
            !isFinite(height)
        ) {
            // Если размеры еще не готовы, используем минимальные размеры
            const minWidth = 100
            const minHeight = 100
            canvas.width = minWidth
            canvas.height = minHeight

            const ctx = canvas.getContext("2d")
            if (!ctx) return

            // Генерируем простой градиент на минимальном размере
            const topLeft = parseColor(colors[0])
            ctx.fillStyle = `rgb(${topLeft[0]}, ${topLeft[1]}, ${topLeft[2]})`
            ctx.fillRect(0, 0, minWidth, minHeight)
            return
        }

        // Устанавливаем размер canvas
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        if (!ctx) {
            return
        }

        // Парсим цвета
        // Порядок: [topRight, bottomRight, bottomLeft, topLeft]
        const topRight = parseColor(colors[0])
        const bottomRight = parseColor(colors[1])
        const bottomLeft = parseColor(colors[2])
        const topLeft = parseColor(colors[3])

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height)

        // Позиции цветов в нормализованных координатах (0-1)
        // Порядок позиций: [topRight, bottomRight, bottomLeft, topLeft]
        // Дефолтные позиции для однотонного верха
        const defaultPositions = [
            { x: 0.5, y: 0.75 }, // topRight (позиция для colors[0])
            { x: 0.35, y: 0.75 }, // bottomRight (позиция для colors[1])
            { x: 0.25, y: 0.4 }, // bottomLeft (позиция для colors[2])
            { x: 0.6, y: 0 }, // topLeft (позиция для colors[3])
        ]

        // Используем переданные позиции или значения по умолчанию
        const colorPositions = positions || defaultPositions

        // Валидация позиций
        const validPositions = colorPositions.map((pos, index) => {
            if (
                !pos ||
                typeof pos.x !== "number" ||
                typeof pos.y !== "number"
            ) {
                console.warn(
                    `Invalid position at index ${index}, using default`
                )
                return defaultPositions[index]
            }
            // Ограничиваем значения в диапазоне 0-1
            return {
                x: Math.max(0, Math.min(1, pos.x)),
                y: Math.max(0, Math.min(1, pos.y)),
            }
        })

        // Применяем поворот к позициям
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

        // Оптимизированная генерация: используем ImageData для точного контроля
        // Для больших экранов используем пониженное разрешение
        const scale = width * height > 1920 * 1080 ? 0.5 : 1
        const scaledWidth = Math.floor(width * scale)
        const scaledHeight = Math.floor(height * scale)

        // Создаём ImageData для финального результата
        const finalImageData = ctx.createImageData(scaledWidth, scaledHeight)
        const finalData = finalImageData.data

        // Точный алгоритм из tweb
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

                // Swirl эффект (точно как в Telegram)
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

                // Вычисляем расстояние до каждого цвета и смешиваем
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

                    // Точная формула из Telegram
                    let distance = Math.max(
                        0.0,
                        0.9 -
                            Math.sqrt(
                                distanceX * distanceX + distanceY * distanceY
                            )
                    )
                    // Возводим в 4-ю степень для создания выраженного эффекта
                    distance = distance * distance * distance * distance

                    distanceSum += distance
                    r += distance * colorsArray[i][0]
                    g += distance * colorsArray[i][1]
                    b += distance * colorsArray[i][2]
                }

                finalData[index] = Math.round(r / distanceSum) // R
                finalData[index + 1] = Math.round(g / distanceSum) // G
                finalData[index + 2] = Math.round(b / distanceSum) // B
                finalData[index + 3] = 255 // A
            }
        }

        // Если использовали пониженное разрешение, масштабируем результат
        if (scale !== 1) {
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = scaledWidth
            tempCanvas.height = scaledHeight
            const tempCtx = tempCanvas.getContext("2d")
            tempCtx.putImageData(finalImageData, 0, 0)

            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(tempCanvas, 0, 0, width, height)
        } else {
            ctx.putImageData(finalImageData, 0, 0)
        }

        // Применяем интенсивность через globalAlpha
        if (intensity !== 1) {
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = width
            tempCanvas.height = height
            const tempCtx = tempCanvas.getContext("2d")
            tempCtx.globalAlpha = intensity
            tempCtx.drawImage(canvas, 0, 0)
            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(tempCanvas, 0, 0)
        }

        // Canvas уже готов, просто рисуем на нём
    }

    // Эффект для генерации градиента при монтировании и изменении размеров
    useEffect(() => {
        let timeoutId = null
        let resizeTimeoutId = null

        // Отложенная генерация для обеспечения наличия размеров
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
            // Debounce для resize
            if (resizeTimeoutId) {
                clearTimeout(resizeTimeoutId)
            }
            resizeTimeoutId = setTimeout(() => {
                generateGradient()
                resizeTimeoutId = null
            }, 150)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colors, rotation, intensity, positions])

    const { style: restStyle, ...otherRestProps } = restProps

    return (
        <div
            ref={containerRef}
            className={`${styles.root} ${className}`}
            style={restStyle}
            {...otherRestProps}
        >
            <canvas
                ref={canvasRef}
                className={styles.canvas}
                aria-hidden="true"
            />
        </div>
    )
}

GradientBackground.propTypes = {
    /**
     * Массив из 4 цветов в формате hex (#RRGGBB) или rgb(r, g, b)
     * Порядок: [topRight, bottomRight, bottomLeft, topLeft]
     */
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    className: PropTypes.string,
    /**
     * Поворот градиента в градусах (0-360)
     */
    rotation: PropTypes.number,
    /**
     * Интенсивность градиента (0-1)
     */
    intensity: PropTypes.number,
    /**
     * Позиции цветов в нормализованных координатах (0-1)
     * Массив из 4 объектов с полями x и y
     * Порядок: [topRight, bottomRight, bottomLeft, topLeft]
     * Если не указано, используются значения по умолчанию из Telegram
     */
    positions: PropTypes.arrayOf(
        PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number,
        })
    ),
}

export default GradientBackground
