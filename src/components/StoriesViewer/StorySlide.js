import { lazy, Suspense, useRef, useState, useEffect, useMemo, useCallback } from "react"
import PropTypes from "prop-types"
import WebApp from "@twa-dev/sdk"
import { RegularButton } from "../Button"
import Text from "../Text"
import * as styles from "./StorySlide.module.scss"

const Lottie = lazy(() => import("lottie-react"))

const buttonStyle = { backgroundColor: "#fff", color: "#000" }
const stopPropagation = (e) => e.stopPropagation()

const StorySlide = ({ story, onButtonClick }) => {
    const {
        title,
        description,
        buttonText,
        background,
        focalImage,
    } = story
    const lottieRef = useRef(null)
    const firedFramesRef = useRef(new Set())
    const [animationData, setAnimationData] = useState(
        typeof focalImage?.src === "function" ? null : focalImage?.src
    )

    useEffect(() => {
        if (typeof focalImage?.src === "function") {
            focalImage.src().then((mod) => setAnimationData(mod.default))
        }
    }, [focalImage?.src])

    const hapticMap = useMemo(() => {
        if (!focalImage?.haptics) return null
        const map = new Map()
        focalImage.haptics.forEach((h) => map.set(h.frame, h.style || "medium"))
        return map
    }, [focalImage?.haptics])

    const handleEnterFrame = useCallback(
        (e) => {
            const frame = Math.round(e.currentTime)
            if (firedFramesRef.current.has(frame)) return
            const style = hapticMap.get(frame)
            if (style) {
                firedFramesRef.current.add(frame)
                WebApp.HapticFeedback.impactOccurred(style)
            }
        },
        [hapticMap]
    )

    useEffect(() => {
        lottieRef.current?.play?.()
    }, [])

    return (
        <div className={styles.root}>
            <img
                className={styles.background}
                src={background}
                alt=""
                aria-hidden="true"
                draggable="false"
                width={430}
                height={932}
            />

            <div className={styles.content}>
                <div className={`${styles.focalArea} ${animationData ? styles.loaded : ""}`}>
                    {focalImage?.type === "lottie" && animationData ? (
                        <Suspense fallback={null}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={animationData}
                                loop={Boolean(focalImage.loop)}
                                autoplay
                                className={styles.focalImage}
                                onEnterFrame={hapticMap ? handleEnterFrame : undefined}
                            />
                        </Suspense>
                    ) : focalImage?.src ? (
                        <img
                            className={styles.focalImage}
                            src={focalImage.src}
                            alt=""
                            aria-hidden="true"
                            draggable="false"
                            width={280}
                            height={280}
                        />
                    ) : null}
                </div>

                <div className={styles.textArea}>
                    <Text
                        as="h2"
                        apple={{ variant: "title1", weight: "bold" }}
                        material={{ variant: "headline5" }}
                        className={styles.title}
                    >
                        {title}
                    </Text>
                    <Text
                        as="p"
                        apple={{ variant: "body" }}
                        material={{ variant: "body1" }}
                        className={styles.description}
                    >
                        {description}
                    </Text>
                </div>

                {buttonText && (
                    <RegularButton
                        isFill
                        label={buttonText}
                        onClick={onButtonClick}
                        onPointerDown={stopPropagation}
                        style={buttonStyle}
                    />
                )}
            </div>
        </div>
    )
}

StorySlide.propTypes = {
    story: PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        buttonText: PropTypes.string,
        background: PropTypes.string,
        focalImage: PropTypes.shape({
            type: PropTypes.oneOf(["lottie", "image"]),
            src: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]),
            loop: PropTypes.bool,
            haptics: PropTypes.arrayOf(
                PropTypes.shape({
                    frame: PropTypes.number.isRequired,
                    style: PropTypes.oneOf([
                        "light", "medium", "heavy", "rigid", "soft",
                    ]),
                })
            ),
        }),
    }).isRequired,
    onButtonClick: PropTypes.func,
}

export default StorySlide
