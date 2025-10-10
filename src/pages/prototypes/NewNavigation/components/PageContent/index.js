import { useMemo } from "react"
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
        <div
            className={styles.pageView}
            style={{ viewTransitionName: "page-content" }}
        >
            {content}
        </div>
    )
}
