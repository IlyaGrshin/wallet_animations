import { memo, useMemo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"

const STAR_FILL = "var(--star, #C0D8FF)"
const STAR_PATH =
    "M11.7392 1.40658C12.3917 -0.468871 15.044 -0.468872 15.7041 1.40658L18.1193 8.26868C18.3227 8.84675 18.7682 9.30773 19.339 9.53088L26.1553 12.1957C27.9368 12.8922 27.9418 15.4112 26.1631 16.1077L19.3575 18.7726C18.7876 18.9957 18.344 19.4567 18.1428 20.0348L15.7551 26.8969C15.1025 28.7723 12.4502 28.7723 11.7901 26.8969L9.37496 20.0348C9.17151 19.4567 8.72605 18.9957 8.15526 18.7726L1.33897 16.1077C-0.442518 15.4112 -0.447555 12.8922 1.33115 12.1957L8.13678 9.53088C8.70668 9.30773 9.15029 8.84675 9.35144 8.26868L11.7392 1.40658Z"

const START_R = 96
const PARTICLE_COUNT_MIN = 16
const PARTICLE_COUNT_MAX = 24

const containerStyle = {
    position: "absolute",
    left: "50%",
    top: "var(--coin-center-y, 50%)",
    width: 0,
    height: 0,
}

const rand = (min, max) => min + Math.random() * (max - min)

function generateStars() {
    const count = Math.round(rand(PARTICLE_COUNT_MIN, PARTICLE_COUNT_MAX))
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: rand(0, 360),
        size: Math.round(rand(8, 26)),
        endR: rand(130, 240),
        delay: rand(0, 2.6),
        duration: rand(1.2, 3.2),
        repeatDelay: rand(0, 0.9),
        peakOpacity: rand(0.55, 1),
        peakScale: rand(0.7, 1.2),
        rotateEnd: rand(-360, 360),
        fadeInRatio: rand(0.18, 0.32),
        fadeOutStart: rand(0.6, 0.78),
    }))
}

const Star = memo(function Star({
    angle,
    size,
    endR,
    delay,
    duration,
    repeatDelay,
    peakOpacity,
    peakScale,
    rotateEnd,
    fadeInRatio,
    fadeOutStart,
}) {
    const rad = (angle * Math.PI) / 180
    const dirX = Math.cos(rad)
    const dirY = Math.sin(rad)
    const x0 = START_R * dirX
    const y0 = START_R * dirY
    const x1 = endR * dirX
    const y1 = endR * dirY
    const lifecycleTimes = [0, fadeInRatio, fadeOutStart, 1]
    return (
        <m.div
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                willChange: "transform, opacity",
            }}
            initial={{ x: x0, y: y0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{
                x: x1,
                y: y1,
                scale: [0, peakScale, peakScale, 0],
                opacity: [0, peakOpacity, peakOpacity * 0.85, 0],
                rotate: rotateEnd,
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                repeatDelay,
                ease: "easeOut",
                scale: {
                    times: lifecycleTimes,
                    ease: "easeInOut",
                    duration,
                    delay,
                    repeat: Infinity,
                    repeatDelay,
                },
                opacity: {
                    times: lifecycleTimes,
                    ease: "easeInOut",
                    duration,
                    delay,
                    repeat: Infinity,
                    repeatDelay,
                },
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox="0 0 28 29"
                fill="none"
                aria-hidden="true"
            >
                <path d={STAR_PATH} style={{ fill: STAR_FILL }} />
            </svg>
        </m.div>
    )
})

Star.propTypes = {
    angle: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    endR: PropTypes.number.isRequired,
    delay: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
    repeatDelay: PropTypes.number.isRequired,
    peakOpacity: PropTypes.number.isRequired,
    peakScale: PropTypes.number.isRequired,
    rotateEnd: PropTypes.number.isRequired,
    fadeInRatio: PropTypes.number.isRequired,
    fadeOutStart: PropTypes.number.isRequired,
}

function Stars() {
    const stars = useMemo(() => generateStars(), [])
    return (
        <div style={containerStyle} aria-hidden="true">
            {stars.map((s) => (
                <Star key={s.id} {...s} />
            ))}
        </div>
    )
}

export default Stars
