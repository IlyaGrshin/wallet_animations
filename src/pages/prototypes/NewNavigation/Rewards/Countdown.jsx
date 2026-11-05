import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import { useReducedMotion } from "motion/react"

import Calligraph from "../../../../components/Calligraph"

const pad = (value) => String(value).padStart(2, "0")

// "18:36:14" from whole seconds left.
const formatLeft = (seconds) =>
    [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
        .map(pad)
        .join(":")

/**
 * Live H:MM:SS countdown to `endsAt`, ticking once a second. Each change
 * rolls the digits down through Calligraph; plain text under reduced motion.
 * @param {number} props.endsAt Deadline as a timestamp in ms.
 */
export default function Countdown({ endsAt }) {
    const reduceMotion = useReducedMotion()
    const [now, setNow] = useState(Date.now)

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    const left = formatLeft(Math.max(0, Math.round((endsAt - now) / 1000)))

    if (reduceMotion) return left
    return (
        <Calligraph variant="number" trend={-1} animation="snappy">
            {left}
        </Calligraph>
    )
}

Countdown.propTypes = {
    endsAt: PropTypes.number.isRequired,
}
