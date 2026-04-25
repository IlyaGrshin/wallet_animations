import { forwardRef } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import { RegularButton } from "@components/Button"
import Text from "@components/Text"

import { formatPrice } from "../../utils"
import { PHASE, PHASE_VALUES, SPIN_COST } from "../../mockData"
import * as styles from "./WheelModal.module.scss"

const cardSlide = {
    initial: { y: "110%" },
    animate: {
        y: 0,
        transition: { type: "spring", damping: 32, stiffness: 220 },
    },
    exit: {
        y: "110%",
        transition: { duration: 0.32, ease: [0.55, 0, 0.85, 0.4] },
    },
}

function FooterCopy({ title, description }) {
    return (
        <div className={styles.copy}>
            <Text
                apple={{ variant: "title3", weight: "semibold" }}
                material={{ variant: "title3", weight: "medium" }}
            >
                {title}
            </Text>
            <p className={styles.description}>
                <Text
                    apple={{ variant: "subheadline1", weight: "regular" }}
                    material={{ variant: "subheadline1", weight: "regular" }}
                >
                    {description}
                </Text>
            </p>
        </div>
    )
}

FooterCopy.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
}

function getCardContent({ phase, winner, points, onSpin }) {
    if (phase === PHASE.IDLE) {
        return {
            title: "Spin the Chance",
            description: `Spend ${SPIN_COST} points for a random crypto reward up to $10.`,
            button: (
                <button
                    type="button"
                    className={styles.cta}
                    onClick={onSpin}
                    disabled={points < SPIN_COST}
                >
                    <Text
                        apple={{ variant: "body", weight: "semibold" }}
                        material={{ variant: "body", weight: "medium" }}
                    >
                        Spin for {SPIN_COST} pts
                    </Text>
                </button>
            ),
        }
    }
    if (phase === PHASE.RESULT) {
        return {
            title: `You got ${formatPrice(winner.amount)} worth of ${winner.token.ticker}`,
            description:
                "It will soon appear in your Wallet balance. This may take some time.",
            button: (
                <RegularButton
                    variant="filled"
                    label={`Spin again for ${SPIN_COST} pts`}
                    isFill
                    onClick={onSpin}
                />
            ),
        }
    }
    return null
}

const Footer = forwardRef(function Footer(
    { phase, winner, points, canSpeedUp, onSpin, onSpeedUp },
    ref
) {
    const card = getCardContent({ phase, winner, points, onSpin })
    return (
        <div ref={ref} className={styles.footerArea}>
            <m.div
                className={styles.speedUpLayer}
                animate={{ opacity: canSpeedUp ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "linear" }}
                style={{ pointerEvents: canSpeedUp ? "auto" : "none" }}
            >
                <button
                    type="button"
                    className={`${styles.cta} ${styles.ctaGhost}`}
                    onClick={onSpeedUp}
                    disabled={!canSpeedUp}
                    aria-hidden={!canSpeedUp}
                    tabIndex={canSpeedUp ? 0 : -1}
                >
                    <Text
                        apple={{ variant: "body", weight: "semibold" }}
                        material={{ variant: "body", weight: "medium" }}
                    >
                        Speed up the wheel
                    </Text>
                </button>
            </m.div>
            <AnimatePresence>
                {card && (
                    <m.div
                        key={phase}
                        className={styles.footerCard}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={cardSlide}
                    >
                        <FooterCopy
                            title={card.title}
                            description={card.description}
                        />
                        {card.button}
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    )
})

Footer.propTypes = {
    phase: PropTypes.oneOf(PHASE_VALUES).isRequired,
    winner: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        token: PropTypes.shape({ ticker: PropTypes.string.isRequired })
            .isRequired,
    }).isRequired,
    points: PropTypes.number.isRequired,
    canSpeedUp: PropTypes.bool.isRequired,
    onSpin: PropTypes.func.isRequired,
    onSpeedUp: PropTypes.func.isRequired,
}

export default Footer
