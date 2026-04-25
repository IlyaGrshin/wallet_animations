import { useEffect, useRef, useState } from "react"

function computeRange(latest, offset, step, count, buffer) {
    const index = Math.round((offset - latest) / step)
    return {
        start: Math.max(0, index - buffer),
        end: Math.min(count, index + buffer + 1),
    }
}

const sameRange = (a, b) => a.start === b.start && a.end === b.end

export default function useVirtualWindow({
    motionValue,
    offset,
    step,
    count,
    buffer = 5,
}) {
    const offsetRef = useRef(offset)
    const stepRef = useRef(step)
    const countRef = useRef(count)
    const bufferRef = useRef(buffer)

    useEffect(() => {
        offsetRef.current = offset
        stepRef.current = step
        countRef.current = count
        bufferRef.current = buffer
    }, [offset, step, count, buffer])

    const [range, setRange] = useState(() =>
        computeRange(motionValue.get(), offset, step, count, buffer)
    )

    useEffect(() => {
        let rafId = 0
        const apply = () => {
            rafId = 0
            const next = computeRange(
                motionValue.get(),
                offsetRef.current,
                stepRef.current,
                countRef.current,
                bufferRef.current
            )
            setRange((prev) => (sameRange(prev, next) ? prev : next))
        }
        const schedule = () => {
            if (!rafId) rafId = requestAnimationFrame(apply)
        }
        schedule()
        const unsubscribe = motionValue.on("change", schedule)
        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            unsubscribe()
        }
    }, [motionValue])

    useEffect(() => {
        const next = computeRange(
            motionValue.get(),
            offset,
            step,
            count,
            buffer
        )
        setRange((prev) => (sameRange(prev, next) ? prev : next))
    }, [offset, step, count, buffer, motionValue])

    return range
}
