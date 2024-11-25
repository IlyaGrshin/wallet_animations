import { motion } from 'motion/react';
import { apple } from '../DeviceProvider'

export let pageTransitionDuration = 0.2

if (typeof window !== 'undefined') {
    window.pageTransitionDuration = pageTransitionDuration;
}

const blurValue = apple ? 'blur(2px)' : 'blur(0px)'

const PageTransition = ({ children }) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            scale: 1.006,
            filter: blurValue
        },
        in: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)'
        },
        out: {
            opacity: 0,
            scale: 1.01,
            filter: blurValue
        },
    };

    const pageTransition = {
        get duration() {
            return window.pageTransitionDuration || 0.2;
        },
        // ease: [0.26, 0.08, 0.25, 1],
        ease: 'linear',
        delay: 0,
    };

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
