import { lazy, Suspense, useEffect, useRef, useMemo } from "react"
import PropTypes from "prop-types"

import * as styles from "./Tab.module.scss"

const Lottie = lazy(() => import("lottie-react"))

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

    useEffect(() => {
        const lottie = lottieRef.current
        if (!showLottie || !lottie) return

        const handleComplete = () => {
            if (!isActive) lottie.goToAndStop?.(0, true)
        }

        lottie.addEventListener?.("complete", handleComplete)

        if (isActive && !wasActiveRef.current) {
            // Activate: play from 0 to activeFrame
            lottie.stop?.()
            if (activeFrame > 0 && lottie.playSegments) {
                lottie.playSegments([0, activeFrame], true)
            } else {
                lottie.goToAndStop?.(activeFrame, true)
            }
            wasActiveRef.current = true
        } else if (!isActive && wasActiveRef.current) {
            // Deactivate: play from activeFrame to end
            if (activeFrame < totalFrames - 1 && lottie.playSegments) {
                lottie.playSegments([activeFrame, totalFrames - 1], true)
            } else {
                lottie.goToAndStop?.(0, true)
            }
            wasActiveRef.current = false
        } else if (isActive) {
            // Stay active: show activeFrame
            lottie.stop?.()
            lottie.goToAndStop?.(activeFrame, true)
        } else {
            // Stay inactive: show frame 0
            lottie.stop?.()
            lottie.goToAndStop?.(0, true)
        }

        return () => lottie.removeEventListener?.("complete", handleComplete)
    }, [isActive, playKey, showLottie, activeFrame, totalFrames])

    return (
        <div
            {...rest}
            className={`${styles.tab} ${isActive ? styles.active : ""} ${className}`.trim()}
            onClick={onClick}
        >
            <div className={styles.icon}>
                {showLottie ? (
                    <Suspense fallback={icon || null}>
                        <Lottie
                            lottieRef={lottieRef}
                            animationData={lottieIcon}
                            autoplay={false}
                            loop={false}
                        />
                    </Suspense>
                ) : (
                    icon
                )}
            </div>
            <span>{label}</span>
        </div>
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
