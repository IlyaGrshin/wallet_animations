import { RegularButton } from "../components/Button"
import Text from "../components/Text"

import * as styles from "./RouteErrorFallback.module.scss"

const handleReload = () => {
    window.location.reload()
}

const RouteErrorFallback = () => (
    <div className={styles.root}>
        <Text
            apple={{ variant: "body", weight: "semibold" }}
            material={{ variant: "subheadline1", weight: "medium" }}
        >
            Something went wrong
        </Text>
        <div className={styles.description}>
            <Text
                apple={{ variant: "subheadline1" }}
                material={{ variant: "subheadline2" }}
            >
                This page failed to load. It may have been updated — try
                reloading.
            </Text>
        </div>
        <div className={styles.button}>
            <RegularButton
                variant="filled"
                label="Reload"
                onClick={handleReload}
            />
        </div>
    </div>
)

export default RouteErrorFallback
