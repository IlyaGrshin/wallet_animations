import Text from "../../Text"
import * as styles from "./MultilineButton.module.scss"

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
                apple26={{
                    variant: "footnote",
                    weight: "semibold",
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
