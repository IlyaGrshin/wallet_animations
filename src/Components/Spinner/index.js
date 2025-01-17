import { apple } from "../DeviceProvider"

import { ReactComponent as SpinnerAppleIcon } from "../../Images/spinner_apple.svg"
import { ReactComponent as SpinnerIcon } from "../../Images/spinner.svg"

import * as styles from "./Spinner.module.scss"

const Spinner = (props) => {
    const Icon = apple ? SpinnerAppleIcon : SpinnerIcon

    const combinedClassName = [styles.spinner, props.className]
        .filter(Boolean)
        .join(" ")

    return <Icon {...props} className={combinedClassName} />
}

export default Spinner
