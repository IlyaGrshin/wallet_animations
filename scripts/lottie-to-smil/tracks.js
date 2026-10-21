// Turns per-sample attribute values into compact keyframe tracks.
// A value is split into a template (non-numeric text) and a number vector;
// samples with the same template interpolate linearly, a template change is
// a jump. Points that linear interpolation already reproduces are dropped.

import { fitSpline, LINEAR_SPLINE } from "./spline.js"

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi

export const parseValue = (value) => ({
    template: value.replace(NUMBER, "#"),
    numbers: (value.match(NUMBER) || []).map(Number),
})

const formatNumber = (n, decimals) => {
    const rounded = Number(n.toFixed(decimals))
    return Object.is(rounded, -0) ? "0" : String(rounded)
}

export const formatValue = ({ template, numbers }, decimals) => {
    let i = 0
    return template.replace(/#/g, () => formatNumber(numbers[i++], decimals))
}

const compatible = (a, b) => a.template === b.template

const withinTolerance = (points, from, to, tolerance) => {
    const a = points[from]
    const b = points[to]
    const span = b.time - a.time
    for (let i = from + 1; i < to; i++) {
        const p = points[i]
        if (!compatible(p.value, a.value)) return false
        const k = (p.time - a.time) / span
        const nums = p.value.numbers
        for (let n = 0; n < nums.length; n++) {
            const expected =
                a.value.numbers[n] +
                (b.value.numbers[n] - a.value.numbers[n]) * k
            if (Math.abs(nums[n] - expected) > tolerance) return false
        }
    }
    return true
}

// Jumps are kept as a pair of points a hair apart, so the same output works
// for both interpolated and discrete-only attributes (e.g. `display`).
const JUMP_EPSILON = 1e-4

// Greedy: from each kept point, extend the segment as far as a straight line
// or a single fitted easing curve still reproduces every sample in between.
export function compressTrack(points, tolerance) {
    const out = [points[0]]
    let anchor = 0
    while (anchor < points.length - 1) {
        const next = points[anchor + 1]
        if (!compatible(points[anchor].value, next.value)) {
            // The jump lands just before the sample so that the exact frame
            // time (and keyTimes rounding) already shows the new value.
            out.push({
                time: next.time - 2 * JUMP_EPSILON,
                value: points[anchor].value,
                spline: LINEAR_SPLINE,
            })
            out.push({
                time: next.time - JUMP_EPSILON,
                value: next.value,
                spline: LINEAR_SPLINE,
            })
            out.push({ ...next, spline: LINEAR_SPLINE })
            anchor++
            continue
        }
        let best = { end: anchor + 1, spline: LINEAR_SPLINE }
        for (let end = anchor + 2; end < points.length; end++) {
            if (!compatible(points[end - 1].value, points[end].value)) break
            const spline = withinTolerance(points, anchor, end, tolerance)
                ? LINEAR_SPLINE
                : fitSpline(points, anchor, end, tolerance)
            if (!spline) break
            best = { end, spline }
        }
        out.push({ ...points[best.end], spline: best.spline })
        anchor = best.end
    }
    return out
}

const isConstant = (points) =>
    points.every(
        (p) =>
            compatible(p.value, points[0].value) &&
            p.value.numbers.every((n, i) => n === points[0].value.numbers[i])
    )

export const trackIsStatic = isConstant

// matrix(a,b,c,d,e,f) = translate(e,f) rotate(r) skewX(k) scale(sx,sy)
export function decomposeMatrix([a, b, c, d, e, f], prevRotation = 0) {
    const sx = Math.hypot(a, b)
    const rotation =
        sx > 1e-9 ? (Math.atan2(b, a) * 180) / Math.PI : prevRotation
    const rad = (rotation * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    // Upper-triangular part of R^-1 * M: [[sx, m], [0, sy]]
    const m = cos * c + sin * d
    const sy = -sin * c + cos * d
    const skew = Math.abs(sy) > 1e-9 ? (Math.atan(m / sy) * 180) / Math.PI : 0
    return { translate: [e, f], rotation, skew, scale: [sx, sy] }
}

// Keeps rotation continuous so interpolation never spins through 360deg.
export const unwrapAngle = (angle, prev) => {
    if (prev == null) return angle
    let next = angle
    while (next - prev > 180) next -= 360
    while (next - prev < -180) next += 360
    return next
}
