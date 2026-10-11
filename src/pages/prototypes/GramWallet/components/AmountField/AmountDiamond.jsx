import PropTypes from "prop-types"

import GramDiamond from "../../../../../components/GramDiamond"
import paintTextLens from "../../../../../components/GramDiamond/paintTextLens"
import { cardDiamondStyle } from "../../../../../components/WalletCard/CardDiamond"
import { Appearance } from "../../../../../lib/gramDiamond/renderer"
import GramIcon from "../../../../../icons/28/Gram.svg?react"

import { splitAmount } from "../../currency"
import * as styles from "./AmountField.module.scss"

const sendDiamondStyle = (width) => ({
    ...cardDiamondStyle(width),
    appearance: Appearance.blue,
    backgroundStars: false,
})

const AmountDiamond = ({ amount, moneyRef }) => {
    const { whole, fraction } = splitAmount(amount)

    const paintLens = (canvas) => {
        const money = moneyRef.current
        if (!money) return null
        const pick = (className) => money.querySelector(`.${className}`)
        return paintTextLens(canvas, [
            [pick(styles.number), whole],
            [pick(styles.fraction), fraction],
            [pick(styles.unit), "GRAM"],
        ])
    }

    return (
        <GramDiamond
            className={styles.diamond}
            style={sendDiamondStyle}
            interactive
            lens={paintLens}
            lensKey={amount}
            fallback={<GramIcon className={styles.diamondFallback} />}
        />
    )
}

AmountDiamond.propTypes = {
    amount: PropTypes.string.isRequired,
    moneyRef: PropTypes.object.isRequired,
}

export default AmountDiamond
