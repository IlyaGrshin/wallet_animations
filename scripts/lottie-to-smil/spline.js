// Fits a SMIL keySpline (cubic-bezier easing, control points in [0, 1]) to a
// run of samples that move along a straight line in value space. Between two
// Lottie keyframes every animated value is exactly `A + (B - A) * ease(t)`,
// so one spline replaces the dozens of points a linear approximation needs.

const bezier = (p1, p2, s) => {
    const k = 1 - s
    return 3 * k * k * s * p1 + 3 * k * s * s * p2 + s * s * s
}

const ease = ([x1, y1, x2, y2], t) => {
    let lo = 0
    let hi = 1
    let s = t
    for (let i = 0; i < 24; i++) {
        const x = bezier(x1, x2, s)
        if (Math.abs(x - t) < 1e-7) break
        if (x < t) lo = s
        else hi = s
        s = (lo + hi) / 2
    }
    return bezier(y1, y2, s)
}

const clamp01 = (v) => Math.min(1, Math.max(0, v))

const cost = (spline, taus, progress) => {
    let worst = 0
    for (let i = 0; i < taus.length; i++) {
        worst = Math.max(worst, Math.abs(ease(spline, taus[i]) - progress[i]))
    }
    return worst
}

// Nelder-Mead over the four control values, clamped to the SMIL range.
const minimize = (start, f) => {
    let simplex = [start]
    for (let i = 0; i < 4; i++) {
        const p = [...start]
        p[i] = clamp01(p[i] + (p[i] > 0.5 ? -0.15 : 0.15))
        simplex.push(p)
    }
    let scores = simplex.map(f)
    for (let iter = 0; iter < 300; iter++) {
        const order = scores
            .map((s, i) => i)
            .sort((a, b) => scores[a] - scores[b])
        simplex = order.map((i) => simplex[i])
        scores = order.map((i) => scores[i])
        const centroid = [0, 1, 2, 3].map(
            (d) => simplex.slice(0, 4).reduce((sum, p) => sum + p[d], 0) / 4
        )
        const along = (k) =>
            centroid.map((c, d) => clamp01(c + k * (simplex[4][d] - c)))
        const reflected = along(-1)
        const rScore = f(reflected)
        if (rScore < scores[0]) {
            const expanded = along(-2)
            const eScore = f(expanded)
            ;[simplex[4], scores[4]] =
                eScore < rScore ? [expanded, eScore] : [reflected, rScore]
        } else if (rScore < scores[3]) {
            ;[simplex[4], scores[4]] = [reflected, rScore]
        } else {
            const contracted = along(0.5)
            const cScore = f(contracted)
            if (cScore < scores[4]) {
                ;[simplex[4], scores[4]] = [contracted, cScore]
            } else {
                for (let i = 1; i < 5; i++) {
                    simplex[i] = simplex[i].map(
                        (v, d) => (v + simplex[0][d]) / 2
                    )
                    scores[i] = f(simplex[i])
                }
            }
        }
    }
    const best = scores.indexOf(Math.min(...scores))
    return { spline: simplex[best], score: scores[best] }
}

const STARTS = [
    [0.33, 0, 0.67, 1],
    [0.42, 0, 0.58, 1],
    [0.17, 0.17, 0.83, 0.83],
    [0.25, 0.1, 0.25, 1],
    [0.6, 0, 0.9, 0.6],
]

// Returns a spline when points[from..to] fit `start + delta * ease(tau)`
// within `tolerance` (in value units), otherwise null.
export function fitSpline(points, from, to, tolerance) {
    const a = points[from].value.numbers
    const b = points[to].value.numbers
    const delta = b.map((v, i) => v - a[i])
    const length = Math.hypot(...delta)
    if (length < 1e-9) return null
    const t0 = points[from].time
    const span = points[to].time - t0
    const taus = []
    const progress = []
    for (let i = from + 1; i < to; i++) {
        const nums = points[i].value.numbers
        const u =
            nums.reduce((sum, v, d) => sum + (v - a[d]) * delta[d], 0) /
            (length * length)
        for (let d = 0; d < nums.length; d++) {
            if (Math.abs(nums[d] - (a[d] + delta[d] * u)) > tolerance)
                return null
        }
        taus.push((points[i].time - t0) / span)
        progress.push(u)
    }
    const limit = tolerance / length
    for (const start of STARTS) {
        if (cost(start, taus, progress) <= limit) return start
    }
    let best = null
    for (const start of STARTS) {
        const fit = minimize(start, (s) => cost(s, taus, progress))
        if (!best || fit.score < best.score) best = fit
        if (best.score <= limit) break
    }
    const rounded = best.spline.map((v) => Number(v.toFixed(3)))
    return cost(rounded, taus, progress) <= limit ? rounded : null
}

export const LINEAR_SPLINE = [0, 0, 1, 1]
