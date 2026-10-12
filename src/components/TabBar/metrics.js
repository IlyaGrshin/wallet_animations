export const EDGE_INSET = 21

const HUG_MAX_TABS = 3
const MIN_ITEM_WIDTH = 94
const LABEL_PADDING = 39
const ITEM_OVERLAP = 8
const PLATTER_PADDING = 16
const LABEL_FONT =
    "500 10px -apple-system, BlinkMacSystemFont, system-ui, sans-serif"

let context = null

const measureLabel = (label = "") => {
    context ??= document.createElement("canvas").getContext("2d")
    context.font = LABEL_FONT
    return context.measureText(label).width
}

export const naturalWidth = (tabs) => {
    if (tabs.length > HUG_MAX_TABS) return null
    const widest = Math.max(0, ...tabs.map((tab) => measureLabel(tab.label)))
    const item = Math.max(MIN_ITEM_WIDTH, Math.ceil(widest + LABEL_PADDING))
    return tabs.length * (item - ITEM_OVERLAP) + PLATTER_PADDING
}

export const barWidth = (tabs) => {
    const fill = `calc(100% - ${EDGE_INSET * 2}px)`
    const natural = naturalWidth(tabs)
    return natural ? `min(${fill}, ${natural}px)` : fill
}
