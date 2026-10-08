import { use, useEffect, useId, useLayoutEffect, useRef } from "react"
import PropTypes from "prop-types"
import { useReducedMotion } from "motion/react"
import { useSkin } from "@hooks/DeviceProvider"
import { loadLottieIcons } from "@icons/lottie"

import { createPlayer } from "./player"
import * as styles from "./AnimatedIcon.module.scss"

const readMeta = (markup, name) =>
    Number(new RegExp(`data-${name}="([\\d.]+)"`).exec(markup)[1])

// Tab icon exported from Lottie to SMIL (scripts/lottie-to-smil). Keeps the
// Lottie playback contract: play [0, activeFrame] on activation, play
// [activeFrame, end] and rest at 0 on deactivation.
const AnimatedIcon = ({
    name,
    isActive,
    playKey,
    activeSegment,
    activeSegmentTime,
}) => {
    const { skin } = useSkin()
    const icons = use(loadLottieIcons(skin))
    const reduceMotion = useReducedMotion()
    // Two copies of an icon render at once (TabBar overlay), so mask / clip
    // ids inside the SVG get a per-instance prefix.
    const uid = useId().replace(/[^\w-]/g, "")
    const markup = icons[name].replaceAll("__UID__", `${uid}-`)

    const rootRef = useRef(null)
    const playerRef = useRef(null)
    const wasActiveRef = useRef(false)

    const fps = readMeta(markup, "fps")
    const lastFrame = readMeta(markup, "frames")
    const activeFrame = Math.min(
        lastFrame - 1,
        activeSegment
            ? activeSegment[1]
            : Math.round((activeSegmentTime || 0.5) * fps),
    )

    useLayoutEffect(() => {
        const svg = rootRef.current?.firstElementChild
        if (!svg) return

        let player = playerRef.current
        if (player?.svg !== svg) {
            player?.stop()
            player = createPlayer(svg, fps)
            playerRef.current = player
            player.seek(isActive ? activeFrame : 0)
            wasActiveRef.current = isActive
            return
        }

        if (isActive && !wasActiveRef.current) {
            if (activeFrame > 0 && !reduceMotion) {
                player.play(0, activeFrame)
            } else {
                player.seek(activeFrame)
            }
            wasActiveRef.current = true
        } else if (!isActive && wasActiveRef.current) {
            if (activeFrame < lastFrame && !reduceMotion) {
                player.play(activeFrame, lastFrame, () => player.seek(0))
            } else {
                player.seek(0)
            }
            wasActiveRef.current = false
        } else {
            player.seek(isActive ? activeFrame : 0)
        }
    }, [isActive, playKey, markup, fps, lastFrame, activeFrame, reduceMotion])

    useEffect(() => () => playerRef.current?.stop(), [])

    return (
        <div
            ref={rootRef}
            className={styles.root}
            dangerouslySetInnerHTML={{ __html: markup }}
        />
    )
}

AnimatedIcon.propTypes = {
    name: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    playKey: PropTypes.string,
    activeSegment: PropTypes.arrayOf(PropTypes.number),
    activeSegmentTime: PropTypes.number,
}

export default AnimatedIcon
