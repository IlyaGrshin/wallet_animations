import { useEffect } from "react"
import PropTypes from "prop-types"
import Text from "../../Text"

import * as styles from "./RegularButton.module.scss"

import { hexToRgb } from "../../../utlis/common"

export const RegularButton = ({
    variant,
    label,
    isShine = false,
    isFill = false,
    ...props
}) => {
    useEffect(() => {
        const root = document.documentElement
        const hexColor = getComputedStyle(root)
            .getPropertyValue("--tg-theme-button-color")
            .trim()
        const rgbColor = hexToRgb(hexColor)
        root.style.setProperty("--secondary-button-color", rgbColor)
    }, [])

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

RegularButton.propTypes = {
    variant: PropTypes.oneOf(["filled", "tinted", "plain", "gray", "disabled"]),
}
