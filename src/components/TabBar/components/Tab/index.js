import { lazy, Suspense, useEffect, useRef, useMemo } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"

import * as styles from "./Tab.module.scss"

const Lottie = lazy(() => import("./lottieLight.js"))

const settleAt = (lottie, frame) => {
    lottie.resetSegments()
    lottie.stop()
    lottie.seek(frame)
}

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
}) => {
    const showLottie = Boolean(lottieIcon)
    const lottieRef = useRef(null)
    const wasActiveRef = useRef(false)

    const activeFrame = useMemo(() => {
        if (activeSegment) return activeSegment[1]
        if (!lottieIcon) return 0
        const frameRate = lottieIcon.fr || 60
        return Math.round((activeSegmentTime || 0.5) * frameRate)
    }, [lottieIcon, activeSegmentTime, activeSegment])

    const totalFrames = useMemo(() => {
        if (!lottieIcon) return 0
        return (lottieIcon.op || 0) - (lottieIcon.ip || 0) + 1
    }, [lottieIcon])

    const handleReady = () => {
        const lottie = lottieRef.current
        if (!lottie) return
        settleAt(lottie, isActive ? activeFrame : 0)
        wasActiveRef.current = isActive
    }

    const handleComplete = () => {
        const lottie = lottieRef.current
        if (!lottie || isActive) return
        settleAt(lottie, 0)
    }

    useEffect(() => {
        const lottie = lottieRef.current
        if (!showLottie || !lottie) return

        if (isActive && !wasActiveRef.current) {
            lottie.resetSegments()
            lottie.stop()
            if (activeFrame > 0) {
                lottie.playSegments([0, activeFrame])
            } else {
                lottie.seek(activeFrame)
            }
            wasActiveRef.current = true
        } else if (!isActive && wasActiveRef.current) {
            lottie.resetSegments()
            if (activeFrame < totalFrames - 1) {
                lottie.playSegments([activeFrame, totalFrames - 1])
            } else {
                lottie.seek(0)
            }
            wasActiveRef.current = false
        } else if (isActive) {
            settleAt(lottie, activeFrame)
        } else {
            settleAt(lottie, 0)
        }
    }, [isActive, playKey, showLottie, activeFrame, totalFrames])

    return (
        <m.div
            layout
            transition={{ type: "spring", stiffness: 800, damping: 50 }}
            {...rest}
            className={`${styles.tab} ${isActive ? styles.active : ""} ${className}`.trim()}
            onClick={onClick}
        >
            <m.div layout className={styles.icon}>
                {showLottie ? (
                    <Suspense fallback={icon || null}>
                        <Lottie
                            lottieRef={lottieRef}
                            src={lottieIcon}
                            subscriptions={{
                                ready: handleReady,
                                complete: handleComplete,
                            }}
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
}

Tab.propTypes = {
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    label: PropTypes.string,
    icon: PropTypes.node,
    lottieIcon: PropTypes.object,
    playKey: PropTypes.string,
    className: PropTypes.string,
    activeSegmentTime: PropTypes.number, // Время в секундах, когда иконка становится активной
    activeSegment: PropTypes.arrayOf(PropTypes.number), // Ручная настройка сегмента [startFrame, endFrame]
}

export default Tab
