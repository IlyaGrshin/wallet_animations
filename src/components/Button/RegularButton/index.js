import Text from "../../Text"

import * as styles from "./RegularButton.module.scss"

export const RegularButton = ({
    variant,
    label,
    isShine = false,
    isFill = false,
    ...props
}) => {
    const dynamicProps = {
        ...(isFill && { "data-fill": true }),
        ...(variant === "filled" && isShine && { "data-shine": true }),
    }

    return (
        <div
            className={`${styles.button} ${styles[variant]}`}
            {...dynamicProps}
            {...props}
        >
            <Text
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "button1" }}
            >
                {label}
            </Text>
        </div>
    )
}
