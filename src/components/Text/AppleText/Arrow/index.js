import { lazy } from "react"

const modules = import.meta.glob("./*.svg", { query: "?react" })

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

const cache = new Map()

export const getArrow = (direction, variant, weight = "regular") => {
    if (!direction || !variant) return null

    const key = `${direction}_${variant}_${weight}`
    if (!cache.has(key)) {
        const file = `./Arrow_${capitalize(direction)}_${capitalize(variant)}_${capitalize(weight)}.svg`
        const loader = modules[file]
        if (!loader) return null
        cache.set(key, lazy(loader))
    }
    return cache.get(key)
}
