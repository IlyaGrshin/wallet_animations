import { use, useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { useSkin } from "@hooks/DeviceProvider"
import { loadLottieIcons } from "@icons/lottie"

const pending = new Map()

const loadPlayerAndIcons = (skin) => {
    if (!pending.has(skin)) {
        pending.set(
            skin,
            Promise.all([
                import("@lib/lottie.js").then((module) => module.default),
                loadLottieIcons(skin),
            ]).then(([Player, icons]) => ({ Player, icons })),
        )
    }

    return pending.get(skin)
}

const settleAt = (lottie, frame) => {
    lottie.resetSegments()
    lottie.stop()
    lottie.seek(frame)
}

const LottieIcon = ({
    name,
    isActive,
    playKey,
    activeSegment,
    activeSegmentTime,
}) => {
    const { skin } = useSkin()
    const { Player, icons } = use(loadPlayerAndIcons(skin))
    const src = icons[name]

    const lottieRef = useRef(null)
    const wasActiveRef = useRef(false)

    const activeFrame = activeSegment
        ? activeSegment[1]
        : Math.round((activeSegmentTime || 0.5) * (src.fr || 60))
    const totalFrames = (src.op || 0) - (src.ip || 0) + 1

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
        if (!lottie) return

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
    }, [isActive, playKey, activeFrame, totalFrames])

    return (
        <Player
            lottieRef={lottieRef}
            src={src}
            subscriptions={{ ready: handleReady, complete: handleComplete }}
        />
    )
}

LottieIcon.propTypes = {
    name: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    playKey: PropTypes.string,
    activeSegment: PropTypes.arrayOf(PropTypes.number),
    activeSegmentTime: PropTypes.number,
}

export default LottieIcon
