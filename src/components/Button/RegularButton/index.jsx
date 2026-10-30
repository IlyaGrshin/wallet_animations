import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import { GlassBorder } from "../../GlassEffect"
import Tappable from "../../Tappable"
import Text from "../../Text"
import Spinner from "../../Spinner"
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
 * @param {boolean} [props.disabled] Drop press feedback and mark aria-disabled.
 * @param {boolean} [props.isLoading] Swap the label for a spinner and block
 * taps. Pass `false` (not omit) on buttons that toggle it, so the spinner is
 * mounted up front and can crossfade both ways.
 * @example
 * <RegularButton variant="filled" label="Pay" onClick={onPay} isFill />
 */
export const RegularButton = ({
    variant,
    label,
    isShine = false,
    isFill = false,
    disabled = false,
    isLoading,
    ...props
}) => {
    const { isApple } = useSkin()
    // Under a Skeleton provider the whole button becomes a neutral gray pill
    // (redaction surface) with its label hidden — no inner text bar.
    const skeleton = Boolean(useSkeletonContext())
    const redactionClassName = useRedactionClassName(skeleton)

    const hasLoader = isLoading !== undefined && !skeleton
    const loading = hasLoader && isLoading

    const dynamicProps = {
        ...(isFill && { "data-fill": true }),
        ...(disabled && { "aria-disabled": true }),
        ...(variant === "filled" &&
            isShine &&
            !skeleton && { "data-shine": true }),
        ...(loading && { "data-loading": true, "aria-busy": true }),
    }

    // The label stays in the flow while loading so the button keeps its width.
    const label_ = (
        <span className={styles.label}>
            <Text
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "subheadline1", weight: "medium" }}
            >
                {label}
            </Text>
        </span>
    )

    // Press feedback matches the platform: an iOS scale, a Material ripple.
    // A disabled button keeps its <button> semantics (aria-disabled) but
    // loses the press feedback.
    const pressable = !skeleton && !disabled
    const actionable = !skeleton && typeof props.onClick === "function"
    const isMotion = isApple || !pressable
    const MotionRoot = actionable ? m.button : m.div
    const Root = isMotion ? MotionRoot : Tappable
    const tapProps = isApple && pressable ? { whileTap: { scale: 1.02 } } : {}
    const semanticProps = actionable
        ? { type: "button", ...(!isMotion && { as: "button" }) }
        : {}

    return (
        <Root
            ref={skeleton ? waveRef : undefined}
            className={cx(
                styles.button,
                styles[variant],
                skeleton && styles.skeleton,
                redactionClassName
            )}
            {...semanticProps}
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
            {hasLoader && (
                <span className={styles.loader} aria-hidden={!loading}>
                    <Spinner className={styles.spinner} isLinear />
                </span>
            )}
        </Root>
    )
}

RegularButton.propTypes = {
    variant: PropTypes.string,
    label: PropTypes.string,
    isShine: PropTypes.bool,
    isFill: PropTypes.bool,
    disabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    onClick: PropTypes.func,
}
