import { LazyMotion, domAnimation } from "motion"

const MotionProvider = ({ children }) => {
    return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

export default MotionProvider
