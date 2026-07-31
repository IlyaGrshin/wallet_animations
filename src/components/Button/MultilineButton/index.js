import PropTypes from "prop-types"
import * as m from "motion/react-m"
import Tappable from "../../Tappable"
import Text from "../../Text"
import Skeleton, {
    useSkeletonContext,
    useRedactionClassName,
    waveRef,
} from "../../Skeleton"
import * as styles from "./MultilineButton.module.scss"
import { useSkin } from "../../../hooks/DeviceProvider"

/**
 * Compact icon-over-label action tile (e.g. Send / Add). Extra props spread
 * onto the root element.
 * @param {"filled"|"plain"} props.variant
 * @param {import("react").ReactNode} props.icon
 * @param {string} props.label
 * @example
 * <MultilineButton variant="filled" icon={<ArrowUpIcon />} label="Send" />
 */
export function MultilineButton({ variant, icon, label, style, ...props }) {
    const { isApple } = useSkin()
    // Under a Skeleton provider the whole button becomes a neutral gray pill;
    // the icon and label stay in flow (for size) but are hidden.
    const skeleton = Boolean(useSkeletonContext())
    const redactionClassName = useRedactionClassName(skeleton)

    const label_ = (
        <Text
            apple={{ variant: "footnote", weight: "semibold" }}
            material={{ variant: "caption2", weight: "medium" }}
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
            style={style}
            {...props}
        >
            {icon}
            {skeleton ? <Skeleton active={false}>{label_}</Skeleton> : label_}
        </Root>
    )
}

MultilineButton.propTypes = {
    variant: PropTypes.string,
    icon: PropTypes.node,
    label: PropTypes.string,
    style: PropTypes.object,
}
