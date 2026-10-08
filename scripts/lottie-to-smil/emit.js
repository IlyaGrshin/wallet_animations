// Builds the SMIL SVG string from sampled lottie-web output.
import {
    compressTrack,
    decomposeMatrix,
    formatValue,
    parseValue,
    trackIsStatic,
    unwrapAngle,
} from "./tracks.js"

// Placeholder for per-instance ids; the runtime swaps it for a unique prefix
// so two copies of one icon on a page never share mask / clip ids.
export const ID_TOKEN = "__UID__"

const TOLERANCE = { default: 0.002, d: 0.04, rotate: 0.01, skewX: 0.01 }
const DECIMALS = { default: 4, d: 2 }

const escapeAttr = (value) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

const rewriteIds = (value) =>
    value.replace(/__lottie_element_(\d+)/g, `${ID_TOKEN}$1`)

const attrString = (attrs) =>
    Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${escapeAttr(rewriteIds(v))}"`)
        .join("")

const keyTimes = (points, duration) =>
    points.map((p) => Number((p.time / duration).toFixed(5))).join(";")

const animateTag = (tag, extra, points, duration, decimals) => {
    const values = points.map((p) => formatValue(p.value, decimals)).join(";")
    const splines = points
        .slice(1)
        .map((p) => p.spline.join(" "))
        .join(";")
    return (
        `<${tag}${extra} dur="${duration}s" begin="0s" fill="freeze"` +
        ` calcMode="spline" keyTimes="${keyTimes(points, duration)}"` +
        ` keySplines="${splines}" values="${escapeAttr(values)}"/>`
    )
}

const toPoints = (samples, read) =>
    samples.map((s) => ({ time: s.time, value: parseValue(read(s)) }))

// Lottie keeps `display` toggles in inline style; expose it as an attribute
// so SMIL can animate it.
const splitStyle = (attrs) => {
    if (attrs.style == null) return attrs
    const { style, ...rest } = attrs
    const display = /display:\s*([a-z]+)/.exec(style)?.[1]
    const remaining = style.replace(/display:\s*[a-z]+;?\s*/, "").trim()
    return {
        ...rest,
        ...(display ? { display } : {}),
        ...(remaining ? { style: remaining } : {}),
    }
}

const transformLayers = (samples, duration, read) => {
    let prevRotation = null
    const parts = samples.map((s) => {
        const raw = read(s)
        const parsed = decomposeMatrix(parseValue(raw).numbers, prevRotation)
        parsed.rotation = unwrapAngle(parsed.rotation, prevRotation)
        prevRotation = parsed.rotation
        return { time: s.time, ...parsed }
    })
    const channels = [
        ["translate", (p) => p.translate.join(" "), 0],
        ["rotate", (p) => String(p.rotation), 0],
        ["skewX", (p) => String(p.skew), 0],
        ["scale", (p) => p.scale.join(" "), 1],
    ]
    return channels.flatMap(([type, read, identity]) => {
        const points = parts.map((p) => ({
            time: p.time,
            value: parseValue(read(p)),
        }))
        const isIdentity = points.every((p) =>
            p.value.numbers.every((n) => Math.abs(n - identity) < 1e-6)
        )
        if (isIdentity) return []
        if (trackIsStatic(points)) {
            const value = formatValue(points[0].value, DECIMALS.default)
            return [{ open: `<g transform="${type}(${value})">` }]
        }
        const tolerance = TOLERANCE[type] ?? TOLERANCE.default
        const anim = animateTag(
            "animateTransform",
            ` attributeName="transform" type="${type}"`,
            compressTrack(points, tolerance),
            duration,
            DECIMALS.default
        )
        return [{ open: `<g>${anim}` }]
    })
}

export function emitSvg({ nodes, samples, duration }) {
    const children = nodes.map(() => [])
    nodes.forEach(
        (node, i) => node.parent >= 0 && children[node.parent].push(i)
    )

    const render = (index) => {
        const states = samples.map((s) => splitStyle(s.states[index]))
        const names = new Set(states.flatMap(Object.keys))
        const staticAttrs = {}
        const animations = []
        let wrappers = []

        for (const name of names) {
            // lottie-web skips hidden layers, so an attribute can be missing
            // until its layer first shows; reuse the first rendered value.
            const firstRaw = states.find((s) => s[name] != null)[name]
            const firstValue =
                name === "d"
                    ? formatValue(parseValue(firstRaw), DECIMALS.d)
                    : firstRaw
            const read = (s) => splitStyle(s.states[index])[name] ?? firstRaw
            const points = toPoints(samples, read)
            if (trackIsStatic(points)) {
                staticAttrs[name] = firstValue
                continue
            }
            if (name === "transform") {
                wrappers = transformLayers(samples, duration, read)
                continue
            }
            staticAttrs[name] = firstValue
            const tolerance = TOLERANCE[name] ?? TOLERANCE.default
            const decimals = DECIMALS[name] ?? DECIMALS.default
            animations.push(
                animateTag(
                    "animate",
                    ` attributeName="${name}"`,
                    compressTrack(points, tolerance),
                    duration,
                    decimals
                )
            )
        }

        const { tag } = nodes[index]
        if (wrappers.length && nodes[nodes[index].parent]?.tag === "clipPath") {
            throw new Error(
                "Animated transform inside <clipPath> is unsupported"
            )
        }
        const inner =
            `<${tag}${attrString(staticAttrs)}>` +
            animations.join("") +
            children[index].map(render).join("") +
            `</${tag}>`
        return (
            wrappers.map((w) => w.open).join("") +
            inner +
            "</g>".repeat(wrappers.length)
        )
    }

    return render(0)
}
