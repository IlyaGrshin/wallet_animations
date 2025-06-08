import * as m from "motion/react-m"
import { EASING } from "../../utils/animations"
import { useApple } from "../../hooks/DeviceProvider"

export let pageTransitionDuration = 0.2

if (typeof window !== "undefined") {
    window.pageTransitionDuration = pageTransitionDuration
}

const blurValue = useApple ? "blur(2px)" : "blur(0px)"

const PageTransition = ({ children, slide = "none" }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            scale: 1.006,
            filter: blurValue,
        },
        in: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
        },
        out: {
            opacity: 0,
            scale: 1.01,
            filter: blurValue,
        },
    }

    const pageTransition = {
        get duration() {
            return window.pageTransitionDuration || 0.2
        },
        ease: EASING.MATERIAL_STANDARD,
        delay: 0,
    }

    return (
        <m.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </m.div>
    )
}

export default PageTransition
