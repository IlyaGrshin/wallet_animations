import { useEffect, useRef, useEffectEvent, Activity } from "react"
import PropTypes from "prop-types"

import { useColorScheme } from "../../hooks/useColorScheme"
import * as styles from "./GradientBackground.module.scss"

// Константы
const DEFAULT_POSITIONS = [
    { x: 0.5, y: 0.75 }, // topRight (позиция для colors[0])
    { x: 0.35, y: 0.75 }, // bottomRight (позиция для colors[1])
    { x: 0.25, y: 0.4 }, // bottomLeft (позиция для colors[2])
    { x: 0.6, y: 0 }, // topLeft (позиция для colors[3])
]

const MAX_CANVAS_SIZE = 1920 * 1080
const RESIZE_DEBOUNCE_GRADIENT = 150
const RESIZE_DEBOUNCE_PATTERN = 300
const PATTERN_INITIAL_DELAY = 100
const DEVICE_PIXEL_RATIO_MAX = 2

// Утилиты
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

const parseSize = (size) => {
    if (!size) return null
    const match = size.toString().match(/^(\d+(?:\.\d+)?)(px)?$/)
    if (match) {
        return parseFloat(match[1])
    }
    return null
}

/**
 * Генерирует 4-цветный градиент на canvas как фоновое изображение
 * Основано на алгоритме градиентов Telegram
 */
function GradientBackground({
    colors,
    colorsDark = null,
    className = "",
    rotation = 0,
    intensity = 1,
    positions = null,
    patternUrl = null,
    patternIntensity = null,
    isDarkPattern = undefined,
    ...restProps
}) {
    const canvasRef = useRef(null)
    const patternCanvasRef = useRef(null)
    const containerRef = useRef(null)
    const patternImageRef = useRef(null)
    const patternDimensionsRef = useRef({ width: 0, height: 0 })
    const colorScheme = useColorScheme()

    // Выбираем цвета в зависимости от темы
    const activeColors =
        colorScheme === "dark" && colorsDark ? colorsDark : colors

    // Автоматически определяем isDarkPattern на основе темы, если не указан явно
    const activeIsDarkPattern =
        isDarkPattern !== undefined ? isDarkPattern : colorScheme === "dark"

    // Генерация градиента на canvas
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
            const topLeft = parseColor(activeColors[0])
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
        const topRight = parseColor(activeColors[0])
        const bottomRight = parseColor(activeColors[1])
        const bottomLeft = parseColor(activeColors[2])
        const topLeft = parseColor(activeColors[3])

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height)

        // Используем переданные позиции или значения по умолчанию
        const colorPositions = positions || DEFAULT_POSITIONS

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
        const scale = width * height > MAX_CANVAS_SIZE ? 0.5 : 1
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
            // Переиспользуем временный canvas из ref если возможно
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

        // Применяем интенсивность через globalAlpha
        if (intensity !== 1) {
            // Переиспользуем временный canvas из ref если возможно
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

        // Canvas уже готов, просто рисуем на нём
    })

    // Функция заполнения canvas паттерном (как в Telegram fillCanvas)
    // Вынесена как обычная функция, т.к. не зависит от props/state
    const fillCanvasWithPattern = (
        ctx,
        canvas,
        source,
        width,
        height,
        isDark
    ) => {
        let imageWidth = source.width
        let imageHeight = source.height

        // Вычисляем patternHeight как в Telegram
        // patternHeight = (500 + (windowSize.height / 2.5)) * canvas.dpr
        const windowHeight = height / canvas.dpr
        const patternHeight = (500 + windowHeight / 2.5) * canvas.dpr

        const ratio = patternHeight / imageHeight
        imageWidth *= ratio
        imageHeight = patternHeight

        // Очищаем canvas перед рисованием
        ctx.clearRect(0, 0, width, height)

        // Если mask (isDark), заливаем чёрным и используем destination-out
        // В этом режиме паттерн "вырезает" градиент, создавая эффект маски
        if (isDark) {
            ctx.fillStyle = "#000"
            ctx.fillRect(0, 0, width, height)
            ctx.globalCompositeOperation = "destination-out"
        } else {
            ctx.globalCompositeOperation = "source-over"
        }

        // Функция для рисования одной строки паттерна
        const drawRow = (y) => {
            for (let x = 0; x < width; x += imageWidth) {
                ctx.drawImage(source, x, y, imageWidth, imageHeight)
            }
        }

        // Рисуем от центра вверх и вниз
        const centerY = (height - imageHeight) / 2
        drawRow(centerY)

        // Рисуем вверх от центра
        if (centerY > 0) {
            let topY = centerY
            do {
                topY -= imageHeight
                drawRow(topY)
            } while (topY >= 0)
        }

        // Рисуем вниз от центра
        const endY = height - 1
        for (
            let bottomY = centerY + imageHeight;
            bottomY < endY;
            bottomY += imageHeight
        ) {
            drawRow(bottomY)
        }

        // Сбрасываем globalCompositeOperation
        ctx.globalCompositeOperation = "source-over"
    }

    // Функция для рендеринга паттерна
    const renderPattern = (forceRender = false) => {
        const patternCanvas = patternCanvasRef.current
        const container = containerRef.current

        if (!patternCanvas || !container || !patternUrl) {
            return
        }

        // Проверяем, что canvas в DOM
        if (!patternCanvas.isConnected) {
            return
        }

        const rect = container.getBoundingClientRect()
        const styleHeight = container.style?.height
        const styleWidth = container.style?.width

        const parseSize = (size) => {
            if (!size) return null
            const match = size.toString().match(/^(\d+(?:\.\d+)?)(px)?$/)
            if (match) {
                return parseFloat(match[1])
            }
            return null
        }

        const baseWidth =
            rect.width || parseSize(styleWidth) || window.innerWidth
        const baseHeight =
            rect.height || parseSize(styleHeight) || window.innerHeight || 100

        if (
            baseWidth <= 0 ||
            baseHeight <= 0 ||
            !isFinite(baseWidth) ||
            !isFinite(baseHeight)
        ) {
            return
        }

        // Используем devicePixelRatio как в Telegram
        const devicePixelRatio = Math.min(
            DEVICE_PIXEL_RATIO_MAX,
            window.devicePixelRatio || 1
        )
        const width = Math.round(baseWidth * devicePixelRatio)
        const height = Math.round(baseHeight * devicePixelRatio)

        // Проверяем, изменились ли размеры существенно (больше чем на 1 пиксель)
        const prevDimensions = patternDimensionsRef.current
        const widthChanged = Math.abs(width - prevDimensions.width) > 1
        const heightChanged = Math.abs(height - prevDimensions.height) > 1

        // Если размеры не изменились и не принудительная перерисовка, пропускаем
        if (
            !forceRender &&
            !widthChanged &&
            !heightChanged &&
            patternImageRef.current
        ) {
            return
        }

        // Обновляем сохранённые размеры
        patternDimensionsRef.current = { width, height }

        // Сохраняем dpr для использования в fillCanvas
        patternCanvas.dpr = devicePixelRatio

        // Изменяем размеры canvas только если они изменились
        if (widthChanged || heightChanged) {
            patternCanvas.width = width
            patternCanvas.height = height
        }

        const ctx = patternCanvas.getContext("2d")
        if (!ctx) return

        // Если изображение уже загружено, используем его сразу
        if (patternImageRef.current && patternImageRef.current.complete) {
            // Проверяем, что размеры canvas не изменились
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

        // Загружаем изображение только если его ещё нет
        const img = patternImageRef.current || new Image()
        if (!patternImageRef.current) {
            patternImageRef.current = img
            img.crossOrigin = "anonymous"

            img.onload = () => {
                // Проверяем, что размеры не изменились
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
            // Изображение уже загружено, сразу рисуем
            fillCanvasWithPattern(
                ctx,
                patternCanvas,
                img,
                width,
                height,
                activeIsDarkPattern
            )
        }
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
    }, [activeColors, rotation, intensity, positions])

    // Эффект для рендеринга паттерна
    useEffect(() => {
        if (!patternUrl) {
            // Очищаем кэш если паттерн удалён
            patternImageRef.current = null
            patternDimensionsRef.current = { width: 0, height: 0 }
            return
        }

        // Сбрасываем кэш при изменении URL паттерна
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

        // Откладываем рендеринг, чтобы canvas успел добавиться в DOM
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
            // Сбрасываем кэш изображения при изменении URL или режима паттерна
            patternImageRef.current = null
            patternDimensionsRef.current = { width: 0, height: 0 }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patternUrl, activeIsDarkPattern])

    const { style: restStyle, ...otherRestProps } = restProps

    // Вычисляем opacity согласно логике Telegram
    // В тёмной теме: паттерн работает как маска (destination-out), opacity применяется к градиенту
    // В светлой теме: паттерн смешивается через overlay, opacity применяется к паттерну
    const gradientOpacity =
        patternIntensity !== null && activeIsDarkPattern
            ? (() => {
                  const absIntensity = Math.abs(patternIntensity)
                  const opacityMax = Math.max(0.3, absIntensity * 0.5)
                  return opacityMax
              })()
            : null

    // В тёмной теме паттерн должен быть полностью непрозрачным (работает как маска)
    // В светлой теме opacity контролирует интенсивность паттерна
    const patternOpacity =
        patternIntensity !== null && !activeIsDarkPattern
            ? (() => {
                  const absIntensity = Math.abs(patternIntensity)
                  return absIntensity * 1
              })()
            : null

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
                style={
                    gradientOpacity !== null
                        ? {
                              "--opacity-max": gradientOpacity,
                              opacity: "var(--opacity-max)",
                          }
                        : undefined
                }
                aria-hidden="true"
            />
            <Activity mode={patternUrl ? "visible" : "hidden"}>
                <canvas
                    ref={patternCanvasRef}
                    className={`${styles.canvas} ${styles.patternCanvas} ${
                        !activeIsDarkPattern ? styles.blend : ""
                    }`}
                    style={
                        patternOpacity !== null
                            ? {
                                  "--opacity-max": patternOpacity,
                              }
                            : undefined
                    }
                    aria-hidden="true"
                />
            </Activity>
        </div>
    )
}

GradientBackground.propTypes = {
    /**
     * Массив из 4 цветов в формате hex (#RRGGBB) или rgb(r, g, b)
     * Порядок: [topRight, bottomRight, bottomLeft, topLeft]
     * Используется для светлой темы (или если colorsDark не указан)
     */
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    /**
     * Массив из 4 цветов для темной темы в формате hex (#RRGGBB) или rgb(r, g, b)
     * Порядок: [topRight, bottomRight, bottomLeft, topLeft]
     * Если не указано, используется colors для обеих тем
     */
    colorsDark: PropTypes.arrayOf(PropTypes.string),
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
    /**
     * URL изображения паттерна для наложения поверх градиента
     * Если указано, паттерн будет отрендерен на отдельном canvas поверх градиента
     */
    patternUrl: PropTypes.string,
    /**
     * Интенсивность паттерна (0-1)
     * Управляет opacity паттерна
     * Если не указано, используется 1 (полная непрозрачность)
     */
    patternIntensity: PropTypes.number,
    /**
     * Если true, паттерн работает как маска (темный режим)
     * Если false, применяется blend mode для смешивания с градиентом
     * Если не указано (undefined), автоматически определяется на основе текущей темы
     * (dark theme = true, light theme = false)
     */
    isDarkPattern: PropTypes.bool,
}

export default GradientBackground
