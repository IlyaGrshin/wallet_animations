import PropTypes from "prop-types"
import { useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import * as styles from "./PageContent.module.scss"
import Wallet from "../../../Wallet"
import TONSpace from "../../../TS"

export default function PageContent({ view }) {
    const content = useMemo(() => {
        switch (view) {
            case "wallet":
                return (
                    // <Suspense>
                    <Wallet />
                    // </Suspense>
                )
            case "tonspace":
                return (
                    // <Suspense fallback={<TonSpaceSkeleton />}>
                    <TONSpace />
                    // </Suspense>
                )
            default:
                return <Wallet />
        }
    }, [view])

    return (
        <AnimatePresence
            mode="popLayout"
            initial={false}
            custom={view}
            inherit={false}
        >
            <motion.div
                initial={{ opacity: 0, scale: 1.006 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.01 }}
                key={view}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className={styles.pageView}
            >
                {content}
            </motion.div>
        </AnimatePresence>
    )
}

PageContent.propTypes = {
    view: PropTypes.string,
}
