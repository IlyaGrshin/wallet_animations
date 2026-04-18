import PropTypes from "prop-types"
import * as m from "motion/react-m"

import { GlassBorder } from "../../GlassEffect"
import Text from "../../Text"
import * as styles from "./RegularButton.module.scss"
import { useSkin } from "../../../hooks/DeviceProvider"

export const RegularButton = ({
    variant,
    label,
    isShine = false,
    isFill = false,
    ...props
}) => {
    const { isApple } = useSkin()
    const dynamicProps = {
        ...(isFill && { "data-fill": true }),
        ...(variant === "filled" && isShine && { "data-shine": true }),
    }

    return (
        <m.div
            className={`${styles.button} ${styles[variant]}`}
            {...(isApple && { whileTap: { scale: 1.02 } })}
            {...dynamicProps}
            {...props}
        >
            {variant === "filled" && <GlassBorder />}
            <Text
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "subheadline1", weight: "medium" }}
            >
                {label}
            </Text>
        </m.div>
    )
}

RegularButton.propTypes = {
    variant: PropTypes.string,
    label: PropTypes.string,
    isShine: PropTypes.bool,
    isFill: PropTypes.bool,
}
