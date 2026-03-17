import { useEffect, useCallback, useRef } from "react"
import PropTypes from "prop-types"
import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

import * as styles from "./StoriesViewer.module.scss"
import ProgressBar from "./ProgressBar"
import StorySlide from "./StorySlide"
import useStoryNavigation from "./useStoryNavigation"

const LONG_PRESS_DELAY = 200

const StoriesViewer = ({ stories, onClose, duration = 5000 }) => {
    const { currentIndex, isPaused, goNext, goPrev, pause, resume } =
        useStoryNavigation({
            storiesCount: stories.length,
            onComplete: onClose,
            duration,
        })

    const story = stories[currentIndex]
    const prevHeaderColorRef = useRef(null)
    const pressTimerRef = useRef(null)
    const didLongPressRef = useRef(false)
    const pointerActiveRef = useRef(false)

    // Save original colors on mount, restore on unmount
    useEffect(() => {
        prevHeaderColorRef.current =
            WebApp.themeParams.secondary_bg_color || "#EFEFF4"
        WebApp.disableVerticalSwipes()

        return () => {
            clearTimeout(pressTimerRef.current)
            WebApp.enableVerticalSwipes()
            const color = prevHeaderColorRef.current
            if (color && WebApp.initData) {
                WebApp.setHeaderColor(
                    color.startsWith("#") ? color : `#${color}`
                )
            }
        }
    }, [])

    // Set header color per story
    useEffect(() => {
        if (story?.headerColor && WebApp.initData) {
            WebApp.setHeaderColor(story.headerColor)
        }
    }, [story?.headerColor])

    const handlePointerDown = useCallback(() => {
        pointerActiveRef.current = true
        didLongPressRef.current = false
        pressTimerRef.current = setTimeout(() => {
            didLongPressRef.current = true
            pause()
        }, LONG_PRESS_DELAY)
    }, [pause])

    const handlePointerUp = useCallback(
        (e) => {
            if (!pointerActiveRef.current) return
            pointerActiveRef.current = false
            clearTimeout(pressTimerRef.current)

            if (didLongPressRef.current) {
                didLongPressRef.current = false
                resume()
                return
            }

            // Tap navigation: left third = prev, rest = next
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            if (x < rect.width / 3) {
                goPrev()
            } else {
                goNext()
            }
        },
        [resume, goPrev, goNext]
    )

    return (
        <div
            className={styles.root}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <BackButton onClick={onClose} />

            <div className={styles.progress}>
                <ProgressBar
                    count={stories.length}
                    currentIndex={currentIndex}
                    isPaused={isPaused}
                    duration={duration}
                />
            </div>

            <div className={styles.slide}>
                <StorySlide
                    key={currentIndex}
                    story={story}
                    onButtonClick={
                        currentIndex === stories.length - 1
                            ? onClose
                            : goNext
                    }
                />
            </div>
        </div>
    )
}

StoriesViewer.propTypes = {
    stories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            buttonText: PropTypes.string,
            background: PropTypes.string,
            headerColor: PropTypes.string,
            focalImage: PropTypes.shape({
                type: PropTypes.oneOf(["lottie", "image"]),
                src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
                loop: PropTypes.bool,
            }),
        })
    ).isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number,
}

export default StoriesViewer
