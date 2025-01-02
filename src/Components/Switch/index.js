import { useState } from "react"
import * as styles from "./index.module.scss"

function Switch() {
    const [state, setState] = useState(false)

    const toggleSwitch = () => setState(!state)

    return (
        <div
            className={styles.Switch}
            onClick={toggleSwitch}
            data-state={state}
        ></div>
    )
}

export default Switch
