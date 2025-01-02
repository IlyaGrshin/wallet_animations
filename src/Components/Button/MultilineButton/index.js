import PropTypes from "prop-types"

import Text from "../../Text"
import * as styles from "./index.module.scss"

export function MultilineButton({ variant, icon, label, style, ...props }) {
    return (
        <div
            className={`${styles.button} ${styles[variant]}`}
            style={style}
            {...props}
        >
            {icon}
            <Text
                apple={{
                    variant: "caption2",
                    weight: "medium",
                }}
                material={{
                    variant: "subtitle2",
                    weight: "medium",
                }}
            >
                {label}
            </Text>
        </div>
    )
}

MultilineButton.propTypes = {
    variant: PropTypes.oneOf(["filled", "tinted", "plain", "gray", "disabled"]),
}
