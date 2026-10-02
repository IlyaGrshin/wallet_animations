import { Suspense } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import LottieIcon from "../LottieIcon"
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
    ...rest
}) => (
    <m.div
        layout
        transition={{ type: "spring", stiffness: 800, damping: 50 }}
        {...rest}
        className={cx(styles.tab, isActive && styles.active, className)}
        onClick={onClick}
    >
        <m.div layout className={styles.icon}>
            {lottieIcon ? (
                <Suspense fallback={icon || null}>
                    <LottieIcon
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
        <m.span layout style={{ display: "inline-block" }}>
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
}

export default Tab
