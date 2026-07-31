import PropTypes from "prop-types"
import * as m from "motion/react-m"

import { GlassBorder } from "../GlassEffect"
import Tappable from "../Tappable"
import Text from "../Text"
import { useSkin } from "../../hooks/DeviceProvider"

import * as styles from "./HeaderButton.module.scss"

export const HEADER_BUTTON_VARIANTS = [
    "regular",
    "secondary",
    "accent",
    "overlay",
]

// A glass action in the panel header: a text label (auto-sized pill) or an
// icon (44x44 square). Glass lives on the element itself so the tap scale
// can't make Safari drop the backdrop-filter mid-animation; the rim lives
// inside it, so it must stay blend-free (GlassBorder's muted variant).
const HeaderButton = ({
    children,
    onClick,
    variant = "regular",
    surface = false,
    swap,
    swapped = false,
}) => {
    const { isApple } = useSkin()
    const isText = typeof children === "string"
    const hasRim = isApple && (variant === "regular" || variant === "overlay")
    const className = `${styles.button} ${styles[variant]} ${
        surface ? styles.surface : ""
    } ${isText ? styles.label : styles.icon}`

    const glyph = isText ? (
        <Text
            apple={{ variant: "body", weight: "medium" }}
            material={{ variant: "body", weight: "medium" }}
        >
            {children}
        </Text>
    ) : (
        children
    )

    const content = (
        <>
            {hasRim && <GlassBorder muted />}
            <span className={styles.content}>
                {swap ? (
                    <span className={styles.swap}>
                        <span className={swapped ? styles.swapHidden : ""}>
                            {glyph}
                        </span>
                        <span className={swapped ? "" : styles.swapHidden}>
                            {swap}
                        </span>
                    </span>
                ) : (
                    glyph
                )}
            </span>
        </>
    )

    const Root = isApple ? m.button : Tappable
    const rootProps = isApple
        ? {
              whileTap: { scale: 1.1 },
              transition: {
                  scale: { type: "spring", stiffness: 800, damping: 40 },
              },
          }
        : { as: "button" }

    return (
        <Root
            type="button"
            className={className}
            onClick={onClick}
            {...rootProps}
        >
            {content}
        </Root>
    )
}

HeaderButton.propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(HEADER_BUTTON_VARIANTS),
    surface: PropTypes.bool,
    swap: PropTypes.node,
    swapped: PropTypes.bool,
}

export default HeaderButton
