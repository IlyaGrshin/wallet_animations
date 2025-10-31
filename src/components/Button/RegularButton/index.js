import PropTypes from "prop-types"
import { motion } from "motion/react"

import { GlassBorder } from "../../GlassEffect"
import Text from "../../Text"
import * as styles from "./RegularButton.module.scss"
import { useApple } from "../../../hooks/DeviceProvider"

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
        <motion.div
            className={`${styles.button} ${styles[variant]}`}
            {...(useApple && { whileTap: { scale: 1.02 } })}
            {...dynamicProps}
            {...props}
        >
            {variant === "filled" && <GlassBorder />}
            <Text
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "button1" }}
            >
                {label}
            </Text>
        </motion.div>
    )
}

RegularButton.propTypes = {
    variant: PropTypes.string,
    label: PropTypes.string,
    isShine: PropTypes.bool,
    isFill: PropTypes.bool,
}
