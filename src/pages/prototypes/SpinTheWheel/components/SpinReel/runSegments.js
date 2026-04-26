import { animate } from "motion/react"

// Раннер последовательно проигрывает массив сегментов одного «круиза».
// Каждый сегмент — `{ kind, offset, durationMs|durationFraction, ease|spring }`,
// где `offset` — смещение относительно target (0 = ровно target). Все
// случайные параметры разрешены на момент построения профиля.
//
// При `reduceMotion` раннер мгновенно ставит y в target и резолвит — это
// единое место учёта prefers-reduced-motion для cruise-логики.

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
            // Микропауза в позиции `to` — реализуется setTimeout, потому
            // что animate(y, to) к уже текущей позиции мог бы резолвиться
            // сразу, не дав визуального «зависания».
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
