import { animate } from "motion/react"

// Runs a cruise profile by playing its segments in order. Each segment is
// `{ kind, offset, durationMs|durationFraction, ease|spring }`, where
// `offset` is relative to target (0 = exactly target). All random params
// are resolved at profile-build time, so each segment is deterministic.
//
// Under `reduceMotion` the runner snaps y to target and resolves — the
// single place where prefers-reduced-motion is honoured for cruise logic.

export default function runSegments({
    y,
    segments,
    target,
    totalMs,
    onDone,
    reduceMotion,
}) {
    if (reduceMotion || segments.length === 0) {
        y.set(target)
        onDone?.()
        return { stop: () => {} }
    }

    let i = 0
    let current = null
    let cancelled = false
    let timeoutId = 0

    const next = () => {
        if (cancelled) return
        if (i >= segments.length) {
            onDone?.()
            return
        }
        const seg = segments[i]
        i += 1
        const to = target + (seg.offset ?? 0)
        const durationMs =
            seg.durationMs ?? (seg.durationFraction ?? 0) * totalMs

        if (seg.kind === "wait") {
            // Hold at `to` via setTimeout — animate(y, to) toward the
            // current position could resolve immediately and skip the
            // visible pause.
            y.set(to)
            timeoutId = setTimeout(next, durationMs)
            return
        }

        const opts =
            seg.kind === "spring"
                ? { type: "spring", ...seg.spring, onComplete: next }
                : {
                      duration: durationMs / 1000,
                      ease: seg.ease,
                      onComplete: next,
                  }
        current = animate(y, to, opts)
    }

    next()

    return {
        stop: () => {
            cancelled = true
            if (timeoutId) clearTimeout(timeoutId)
            current?.stop?.()
        },
    }
}
