import { useApple } from "../../hooks/DeviceProvider"

import { ReactComponent as SpinnerAppleIcon } from "../../images/spinner_apple.svg"
import { ReactComponent as SpinnerIcon } from "../../images/spinner.svg"

import * as styles from "./Spinner.module.scss"

const Spinner = (props) => {
    const Icon = useApple ? SpinnerAppleIcon : SpinnerIcon

    const combinedClassName = [styles.spinner, props.className]
        .filter(Boolean)
        .join(" ")

    return <Icon {...props} className={combinedClassName} />
}

export default Spinner
