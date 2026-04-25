import PropTypes from "prop-types"
import * as m from "motion/react-m"

import * as styles from "./SpinReel.module.scss"

const arrowAnim = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
}

function Glyph({ flip }) {
    return (
        <svg
            width="17"
            height="27"
            viewBox="0 0 17 27"
            fill="none"
            aria-hidden="true"
            style={flip ? { transform: "scaleX(-1)" } : undefined}
        >
            <path
                d="M15.6752 14.8889C16.5288 14.0975 16.5288 12.7471 15.6752 11.9557L3.35979 0.537348C2.07972 -0.649477 0 0.258365 0 2.00397V24.8406C0 26.5862 2.07972 27.4941 3.35979 26.3073L15.6752 14.8889Z"
                fill="#A3A1C3"
            />
        </svg>
    )
}

Glyph.propTypes = { flip: PropTypes.bool }

function Chevron({ side }) {
    const flip = side === "right"
    const className = flip ? styles.arrowRight : styles.arrowLeft
    return (
        <m.span key={side} className={className} {...arrowAnim}>
            <Glyph flip={flip} />
        </m.span>
    )
}

Chevron.propTypes = {
    side: PropTypes.oneOf(["left", "right"]).isRequired,
}

export default Chevron
