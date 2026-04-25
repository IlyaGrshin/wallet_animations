import { memo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"

const STAR_COLOR = "#C0D8FF"
const STAR_PATH =
    "M11.7392 1.40658C12.3917 -0.468871 15.044 -0.468872 15.7041 1.40658L18.1193 8.26868C18.3227 8.84675 18.7682 9.30773 19.339 9.53088L26.1553 12.1957C27.9368 12.8922 27.9418 15.4112 26.1631 16.1077L19.3575 18.7726C18.7876 18.9957 18.344 19.4567 18.1428 20.0348L15.7551 26.8969C15.1025 28.7723 12.4502 28.7723 11.7901 26.8969L9.37496 20.0348C9.17151 19.4567 8.72605 18.9957 8.15526 18.7726L1.33897 16.1077C-0.442518 15.4112 -0.447555 12.8922 1.33115 12.1957L8.13678 9.53088C8.70668 9.30773 9.15029 8.84675 9.35144 8.26868L11.7392 1.40658Z"

const STARS = [
    { x: 18, y: 28, size: 22, delay: 0.0, duration: 1.9 },
    { x: 80, y: 22, size: 26, delay: 0.4, duration: 2.3 },
    { x: 12, y: 52, size: 16, delay: 0.8, duration: 2.0 },
    { x: 86, y: 50, size: 18, delay: 0.2, duration: 2.2 },
    { x: 24, y: 72, size: 22, delay: 0.6, duration: 2.0 },
    { x: 76, y: 74, size: 20, delay: 1.0, duration: 2.4 },
    { x: 50, y: 14, size: 14, delay: 0.3, duration: 1.8 },
    { x: 50, y: 82, size: 16, delay: 0.9, duration: 2.0 },
    { x: 8, y: 78, size: 12, delay: 1.2, duration: 2.1 },
    { x: 92, y: 80, size: 14, delay: 0.5, duration: 2.0 },
    { x: 6, y: 18, size: 10, delay: 1.4, duration: 1.8 },
    { x: 90, y: 14, size: 12, delay: 0.7, duration: 2.0 },
    { x: 34, y: 88, size: 10, delay: 1.1, duration: 1.7 },
    { x: 66, y: 8, size: 12, delay: 0.15, duration: 2.0 },
]

const DRIFT_PX = 26

const Star = memo(function Star({ x, y, size, delay, duration }) {
    const driftX = ((x - 50) / 50) * DRIFT_PX
    const driftY = ((y - 50) / 50) * DRIFT_PX
    return (
        <m.div
            style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                willChange: "transform, opacity",
            }}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
                scale: [0, 1, 1, 0],
                opacity: [0, 1, 0.85, 0],
                rotate: [0, 60, 180, 360],
                x: [0, driftX * 0.3, driftX * 0.7, driftX],
                y: [0, driftY * 0.3, driftY * 0.7, driftY],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                repeatDelay: 0.3,
                ease: "easeInOut",
                times: [0, 0.25, 0.7, 1],
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 28 29"
                fill="none"
                aria-hidden="true"
            >
                <path d={STAR_PATH} fill={STAR_COLOR} />
            </svg>
        </m.div>
    )
})

Star.propTypes = {
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    delay: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
}

function Stars() {
    return (
        <>
            {STARS.map((s, i) => (
                <Star key={i} {...s} />
            ))}
        </>
    )
}

export default Stars
