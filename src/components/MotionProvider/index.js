import { LazyMotion, domAnimation } from "motion/react"

const MotionProvider = ({ children }) => {
    return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

export default MotionProvider
