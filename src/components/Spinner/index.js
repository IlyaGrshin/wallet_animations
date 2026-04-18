import { useSkin } from "../../hooks/DeviceProvider"
import PropTypes from "prop-types"

import SpinnerAppleIcon from "../../images/spinner_apple.svg?react"
import SpinnerIcon from "../../images/spinner.svg?react"

import * as styles from "./Spinner.module.scss"

const Spinner = ({ centered, className, size, ...rest }) => {
    const { isApple } = useSkin()
    const Icon = isApple ? SpinnerAppleIcon : SpinnerIcon

    const combinedClassName = [styles.spinner, className]
        .filter(Boolean)
        .join(" ")

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
}
export default Spinner
