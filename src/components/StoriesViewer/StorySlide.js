import { lazy, Suspense, useRef, useEffect } from "react"
import PropTypes from "prop-types"
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
                <div className={styles.focalArea}>
                    {focalImage?.type === "lottie" ? (
                        <Suspense fallback={null}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={focalImage.src}
                                loop={Boolean(focalImage.loop)}
                                autoplay
                                className={styles.focalImage}
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
            src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
            loop: PropTypes.bool,
        }),
    }).isRequired,
    onButtonClick: PropTypes.func,
}

export default StorySlide
