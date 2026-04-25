import { useEffect, useRef, useState } from "react"
import { useMotionValueEvent } from "motion/react"

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
    useEffect(() => {
        offsetRef.current = offset
    }, [offset])

    const [range, setRange] = useState(() =>
        computeRange(motionValue.get(), offset, step, count, buffer)
    )

    useEffect(() => {
        const next = computeRange(
            motionValue.get(),
            offset,
            step,
            count,
            buffer
        )
        setRange((prev) => (sameRange(prev, next) ? prev : next))
    }, [motionValue, offset, step, count, buffer])

    useMotionValueEvent(motionValue, "change", (latest) => {
        const next = computeRange(
            latest,
            offsetRef.current,
            step,
            count,
            buffer
        )
        setRange((prev) => (sameRange(prev, next) ? prev : next))
    })

    return range
}
