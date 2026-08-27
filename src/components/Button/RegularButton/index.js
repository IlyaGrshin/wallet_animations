import PropTypes from "prop-types"
import * as m from "motion/react-m"

import { GlassBorder } from "../../GlassEffect"
import Tappable from "../../Tappable"
import Text from "../../Text"
import Skeleton, {
    useSkeletonContext,
    useRedactionClassName,
    waveRef,
} from "../../Skeleton"
import * as styles from "./RegularButton.module.scss"
import { useSkin } from "../../../hooks/DeviceProvider"

/**
 * Pill button. Reuse instead of a raw <button>. Extra props (onClick, etc.)
 * spread onto the underlying motion element.
 * @param {"filled"|"outlined"} props.variant
 * @param {string} props.label
 * @param {boolean} [props.isShine] Sweep highlight; only affects `filled`.
 * @param {boolean} [props.isFill] Stretch to fill the container width.
 * @example
 * <RegularButton variant="filled" label="Pay" onClick={onPay} isFill />
 */
export const RegularButton = ({
    variant,
    label,
    isShine = false,
    isFill = false,
    ...props
}) => {
    const { isApple } = useSkin()
    // Under a Skeleton provider the whole button becomes a neutral gray pill
    // (redaction surface) with its label hidden — no inner text bar.
    const skeleton = Boolean(useSkeletonContext())
    const redactionClassName = useRedactionClassName(skeleton)

    const dynamicProps = {
        ...(isFill && { "data-fill": true }),
        ...(variant === "filled" &&
            isShine &&
            !skeleton && { "data-shine": true }),
    }

    const label_ = (
        <Text
            apple={{ variant: "body", weight: "semibold" }}
            material={{ variant: "subheadline1", weight: "medium" }}
        >
            {label}
        </Text>
    )

    // Press feedback matches the platform: an iOS scale, a Material ripple.
    const pressable = !skeleton
    const Root = isApple || !pressable ? m.div : Tappable
    const tapProps = isApple && pressable ? { whileTap: { scale: 1.02 } } : {}

    return (
        <Root
            ref={skeleton ? waveRef : undefined}
            className={`${styles.button} ${styles[variant]} ${
                skeleton ? styles.skeleton : ""
            } ${redactionClassName}`}
            {...tapProps}
            {...dynamicProps}
            {...props}
        >
            {variant === "filled" && !skeleton && <GlassBorder />}
            {skeleton ? (
                // Turn redaction off for the hidden label so it doesn't draw its
                // own bar inside the pill; it stays for width only.
                <Skeleton active={false}>{label_}</Skeleton>
            ) : (
                label_
            )}
        </Root>
    )
}

RegularButton.propTypes = {
    variant: PropTypes.string,
    label: PropTypes.string,
    isShine: PropTypes.bool,
    isFill: PropTypes.bool,
}
