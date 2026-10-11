import PropTypes from "prop-types"
import cx from "clsx"

import GramIcon from "../../../../../icons/28/Gram.svg?react"

import * as styles from "./Amount.module.scss"

const GRAM_UNIT = "Gram"

const Amount = ({ value, unit, className }) => (
    <span className={cx(styles.root, className)}>
        {value}
        {unit === GRAM_UNIT && <GramIcon className={styles.icon} />}
        {unit && unit !== GRAM_UNIT && <span>{unit}</span>}
    </span>
)

Amount.propTypes = {
    value: PropTypes.string.isRequired,
    unit: PropTypes.string,
    className: PropTypes.string,
}

export default Amount
