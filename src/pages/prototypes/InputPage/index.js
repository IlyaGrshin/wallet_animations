import { BackButton } from "@twa-dev/sdk/react"
import { motion } from "motion/react"
import WebApp from "@twa-dev/sdk"

import Page from "../../../components/Page"
import NativePageTransition from "../../../components/NativePageTransition"
import TextField from "../../../components/TextField"
import GlassContainer from "../../../components/GlassEffect"
import GradientBackground from "../../../components/GradientBackground"

import patternSvg from "../../../images/pattern.svg"
import { useColorScheme } from "../../../hooks/useColorScheme"
import { useViewportHeight } from "./useViewportHeight"
import { usePreventScroll } from "./usePreventScroll"
import * as styles from "./InputPage.module.scss"

function InputPage() {
    const viewportHeight = useViewportHeight()
    const colorScheme = useColorScheme()

    // Используем стабильную начальную высоту для фона
    const stableHeight =
        WebApp.viewportHeight || window.innerHeight || window.screen.height

    usePreventScroll()

    const gradientColors = ["#d5d88d", "#d5d88d", "#88b884", "#88b884"]
    const gradientColorsDark = ["#fec496", "#dd6cb9", "#962fbf", "#4f5bd5"]

    // Цвет header в зависимости от темы
    const headerColor = colorScheme === "dark" ? "000000" : "88b884"

    return (
        <Page headerColor={headerColor}>
            <GradientBackground
                colors={gradientColors}
                colorsDark={gradientColorsDark}
                patternUrl={patternSvg}
                patternIntensity={0.5}
                className={styles.background}
                style={{ height: `${stableHeight}px` }}
                rotation={0}
                intensity={1}
            />
            <motion.div
                className={styles.container}
                animate={{ height: viewportHeight }}
                transition={{
                    type: "spring",
                    bounce: 0,
                    damping: 35,
                    stiffness: 500,
                }}
            >
                <BackButton />
                <NativePageTransition>
                    <div className={styles.input}>
                        <GlassContainer style={{ borderRadius: "36px" }}>
                            <TextField label="Message" />
                        </GlassContainer>
                    </div>
                </NativePageTransition>
            </motion.div>
        </Page>
    )
}

export default InputPage
