import { lazy } from "react"

const modules = import.meta.glob("./*.svg", { query: "?react" })

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const cache = new Map()

export const getChevronRight = (variant, weight = "regular") => {
    if (!variant) return null

    const key = `${variant}_${weight}`
    if (!cache.has(key)) {
        const file = `./ChevronRight_${capitalize(variant)}_${capitalize(weight)}.svg`
        const loader = modules[file]
        if (!loader) return null
        cache.set(key, lazy(loader))
    }
    return cache.get(key)
}
