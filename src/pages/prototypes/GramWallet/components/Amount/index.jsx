import PropTypes from "prop-types"

import GramIcon from "../../../../../icons/28/Gram.svg?react"

import * as styles from "./Amount.module.scss"

const GRAM_UNIT = "Gram"

const Amount = ({ value, unit }) => (
    <span className={styles.root}>
        {value}
        {unit === GRAM_UNIT && <GramIcon className={styles.icon} />}
        {unit && unit !== GRAM_UNIT && unit}
    </span>
)

Amount.propTypes = {
    value: PropTypes.string.isRequired,
    unit: PropTypes.string,
}

export default Amount
