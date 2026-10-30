import { useSkin } from "../../hooks/DeviceProvider"
import PropTypes from "prop-types"
import cx from "clsx"

import SpinnerAppleIcon from "../../images/spinner_apple.svg?react"
import SpinnerIcon from "../../images/spinner.svg?react"

import * as styles from "./Spinner.module.scss"

/**
 * @param {boolean} [props.isLinear] Use the smooth arc spinner on every
 * platform instead of the stepped iOS one.
 */
const Spinner = ({ centered, className, size, isLinear = false, ...rest }) => {
    const { isApple } = useSkin()
    const Icon = isApple && !isLinear ? SpinnerAppleIcon : SpinnerIcon

    const combinedClassName = cx(
        styles.spinner,
        isLinear && styles.linear,
        className
    )

    const sizeStyle = size ? { width: size, height: size } : undefined

    const icon = (
        <Icon {...rest} className={combinedClassName} style={sizeStyle} />
    )

    if (centered) {
        return <div className={styles.centered}>{icon}</div>
    }

    return icon
}

Spinner.propTypes = {
    centered: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.number,
    isLinear: PropTypes.bool,
}
export default Spinner
