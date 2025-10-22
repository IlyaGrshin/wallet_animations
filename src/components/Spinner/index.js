import { useApple } from "../../hooks/DeviceProvider"
import PropTypes from "prop-types"

import SpinnerAppleIcon from "../../images/spinner_apple.svg?react"
import SpinnerIcon from "../../images/spinner.svg?react"

import * as styles from "./Spinner.module.scss"

const Spinner = (props) => {
    const Icon = useApple ? SpinnerAppleIcon : SpinnerIcon

    const combinedClassName = [styles.spinner, props.className]
        .filter(Boolean)
        .join(" ")

    return <Icon {...props} className={combinedClassName} />
}

Spinner.propTypes = {
    className: PropTypes.string,
}
export default Spinner
