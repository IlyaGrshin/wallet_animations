import { useEffect, useEffectEvent, useRef } from "react"
import {
    CandlestickSeries,
    CrosshairMode,
    LineSeries,
    LineStyle,
    LineType,
    createChart,
} from "lightweight-charts"

export const GRID_LINES = 4

// The chart is a bare plot: no axes, labels or watermark. Price labels,
// horizontal grid lines and markers are DOM drawn by PriceChart to match the
// design, and a line keeps every touch for the page.
const CHART_OPTIONS = {
    autoSize: true,
    layout: {
        background: { color: "transparent" },
        attributionLogo: false,
    },
    grid: { vertLines: { visible: false }, horzLines: { visible: false } },
    leftPriceScale: { visible: false },
    rightPriceScale: {
        visible: false,
        scaleMargins: { top: 0, bottom: 0 },
    },
    timeScale: {
        visible: false,
        borderVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
    },
    handleScroll: false,
    handleScale: false,
    crosshair: {
        mode: CrosshairMode.Magnet,
        horzLine: { visible: false, labelVisible: false },
        vertLine: { labelVisible: false, style: LineStyle.Solid, width: 1 },
    },
}

// Candles keep a fixed 12pt pitch (Figma "Candle Chart") and pan sideways
// through the history; vertical drags still scroll the page.
const CANDLE_OPTIONS = {
    handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
    },
    timeScale: {
        barSpacing: 12,
        minBarSpacing: 12,
        rightOffset: 2,
        fixRightEdge: false,
    },
}

const cssVar = (element, name) =>
    getComputedStyle(element).getPropertyValue(name).trim()

// The canvas parses colours itself: no color-mix(), so tint a hex by hand.
const withAlpha = (hex, alpha) => {
    const value = parseInt(hex.slice(1, 7), 16)
    return `rgba(${value >> 16}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

const seriesFor = (chart, type, colors) =>
    type === "candles"
        ? chart.addSeries(CandlestickSeries, {
              lastValueVisible: false,
              priceLineWidth: 1,
              priceLineStyle: LineStyle.Solid,
              upColor: colors.up,
              downColor: colors.down,
              wickUpColor: colors.up,
              wickDownColor: colors.down,
              borderVisible: false,
          })
        : chart.addSeries(LineSeries, {
              priceLineVisible: false,
              lastValueVisible: false,
              lineWidth: 2,
              lineType: LineType.Curved,
              crosshairMarkerRadius: 4,
              crosshairMarkerBorderWidth: 0,
          })

const trendStyle = (type, color) =>
    type === "candles" ? { priceLineColor: withAlpha(color, 0.2) } : { color }

// Pixel-rounded layout: a pan frame or tick that moves nothing visible
// doesn't re-render the labels.
const sameLayout = (a, b) =>
    a &&
    a.height === b.height &&
    Math.round(a.lastY) === Math.round(b.lastY) &&
    a.labels.every((price, i) => price === b.labels[i])

// Same history with only the forming bar moved (or one bar appended): the
// series can take it as an update instead of a full redraw.
const isIncremental = (prev, next) =>
    prev?.length > 0 &&
    prev[0].time === next[0].time &&
    (next.length === prev.length || next.length === prev.length + 1)

/**
 * Owns one lightweight-charts instance inside `containerRef`. Rebuilds only
 * when the series kind or theme changes; a trend flip recolours in place and
 * live ticks go in as single-bar updates. A line is fitted to its history,
 * candles pan through theirs. Reports the prices at the grid lines and the
 * height of the last price whenever the visible scale moves.
 */
export default function useChart({
    containerRef,
    data,
    type,
    trend,
    colorScheme,
    onScrub,
    onLayout,
}) {
    const chartRef = useRef(null)
    const seriesRef = useRef(null)
    const colorsRef = useRef(null)
    const shownRef = useRef(null)
    const reportRef = useRef(null)
    const layoutRef = useRef(null)
    const scrub = useEffectEvent((index) => onScrub?.(index))
    const layout = useEffectEvent((value) => onLayout?.(value))

    useEffect(() => {
        const container = containerRef.current
        const colors = {
            up: cssVar(container, "--text-confirm-color"),
            down: cssVar(container, "--tg-theme-destructive-text-color"),
            hint: cssVar(container, "--tg-theme-hint-color"),
            grid: cssVar(container, "--tg-theme-section-separator-color"),
        }
        colorsRef.current = colors

        const chart = createChart(container, CHART_OPTIONS)
        chart.applyOptions({
            crosshair: { vertLine: { color: colors.hint } },
            ...(type === "candles" && {
                ...CANDLE_OPTIONS,
                grid: {
                    vertLines: {
                        visible: true,
                        color: colors.grid,
                        style: LineStyle.Dashed,
                    },
                },
            }),
        })
        const series = seriesFor(chart, type, colors)
        chartRef.current = chart
        seriesRef.current = series

        // Read the visible scale a frame later, once the chart has laid out.
        let frame = 0
        const report = () => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                const shown = shownRef.current
                if (!shown?.length) return
                const height = container.clientHeight
                const labels = Array.from({ length: GRID_LINES }, (_, i) =>
                    series.coordinateToPrice((height * i) / (GRID_LINES - 1))
                )
                const lastY = series.priceToCoordinate(shown.at(-1).close)
                const next = { labels, lastY, height }
                if (sameLayout(layoutRef.current, next)) return
                layoutRef.current = next
                layout(next)
            })
        }
        reportRef.current = report

        // autoSize settles the width after the first fit; a line refits so
        // its tail can't hang past the right edge.
        const onResize = () => {
            if (type !== "candles") chart.timeScale().fitContent()
            report()
        }

        // Bars and plotted points share indices: report the index, the
        // caller reads its own bar in O(1).
        chart.subscribeCrosshairMove((param) =>
            scrub(param.point && param.logical != null ? param.logical : null)
        )
        chart.timeScale().subscribeSizeChange(onResize)
        chart.timeScale().subscribeVisibleLogicalRangeChange(report)

        return () => {
            cancelAnimationFrame(frame)
            chart.remove()
            chartRef.current = null
            seriesRef.current = null
            shownRef.current = null
            layoutRef.current = null
        }
    }, [containerRef, type, colorScheme])

    useEffect(() => {
        const colors = colorsRef.current
        const color = trend === "down" ? colors.down : colors.up
        seriesRef.current.applyOptions(trendStyle(type, color))
    }, [trend, type, colorScheme])

    useEffect(() => {
        const chart = chartRef.current
        const series = seriesRef.current
        if (!chart || !series || !data?.length) return

        const shown = shownRef.current
        if (isIncremental(shown, data)) {
            series.update(data.at(-1))
            // A new bar widens a fitted line: keep it all in view.
            if (type !== "candles" && data.length !== shown.length) {
                chart.timeScale().fitContent()
            }
        } else {
            series.setData(data)
            if (type === "candles") chart.timeScale().scrollToRealTime()
            else chart.timeScale().fitContent()
        }
        shownRef.current = data
        reportRef.current()
    }, [data, type, colorScheme])
}
