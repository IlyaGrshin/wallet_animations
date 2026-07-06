import PropTypes from "prop-types"
import Text from "../../Text"
import Skeleton, {
    useSkeletonContext,
    useRedactionClassName,
    waveRef,
} from "../../Skeleton"
import * as styles from "./MultilineButton.module.scss"

export function MultilineButton({ variant, icon, label, style, ...props }) {
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

    return (
        <div
            ref={skeleton ? waveRef : undefined}
            className={`${styles.button} ${styles[variant]} ${
                skeleton ? styles.skeleton : ""
            } ${redactionClassName}`}
            style={style}
            {...props}
        >
            {icon}
            {skeleton ? <Skeleton active={false}>{label_}</Skeleton> : label_}
        </div>
    )
}

MultilineButton.propTypes = {
    variant: PropTypes.string,
    icon: PropTypes.node,
    label: PropTypes.string,
    style: PropTypes.object,
}
