import { Suspense } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import AnimatedIcon from "../AnimatedIcon"
import * as styles from "./Tab.module.scss"

const Tab = ({
    isActive,
    onClick,
    label,
    icon,
    lottieIcon,
    playKey,
    className = "",
    activeSegmentTime,
    activeSegment,
    layoutDependency,
    ...rest
}) => (
    <m.div
        layout
        layoutDependency={layoutDependency}
        transition={{ type: "spring", stiffness: 800, damping: 50 }}
        {...rest}
        className={cx(styles.tab, isActive && styles.active, className)}
        onClick={onClick}
    >
        <m.div
            layout
            layoutDependency={layoutDependency}
            className={styles.icon}
        >
            {lottieIcon ? (
                <Suspense fallback={icon || null}>
                    <AnimatedIcon
                        name={lottieIcon}
                        isActive={isActive}
                        playKey={playKey}
                        activeSegment={activeSegment}
                        activeSegmentTime={activeSegmentTime}
                    />
                </Suspense>
            ) : (
                icon
            )}
        </m.div>
        <m.span
            layout
            layoutDependency={layoutDependency}
            style={{ display: "inline-block" }}
        >
            {label}
        </m.span>
    </m.div>
)

Tab.propTypes = {
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    label: PropTypes.string,
    icon: PropTypes.node,
    lottieIcon: PropTypes.string,
    playKey: PropTypes.string,
    className: PropTypes.string,
    activeSegmentTime: PropTypes.number,
    activeSegment: PropTypes.arrayOf(PropTypes.number),
    layoutDependency: PropTypes.string,
}

export default Tab
