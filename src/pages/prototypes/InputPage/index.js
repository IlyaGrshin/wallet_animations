import { BackButton } from "@twa-dev/sdk/react"
import { motion } from "motion/react"

import Page from "../../../components/Page"
import NativePageTransition from "../../../components/NativePageTransition"
import TextField from "../../../components/TextField"
import GlassContainer from "../../../components/GlassEffect"

import { useViewportHeight } from "./useViewportHeight"
import { usePreventScroll } from "./usePreventScroll"
import * as styles from "./InputPage.module.scss"

function InputPage() {
    const viewportHeight = useViewportHeight()

    usePreventScroll()

    return (
        <Page headerColor={"9BBF86"}>
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
