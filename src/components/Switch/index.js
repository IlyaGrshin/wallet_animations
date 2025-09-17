import { useState } from "react"
import * as styles from "./Switch.module.scss"

function Switch() {
    const [state, setState] = useState(false)

    const toggleSwitch = () => setState(!state)

    return (
        <div
            className={styles.root}
            onClick={toggleSwitch}
            data-state={state}
        ></div>
    )
}

export default Switch
