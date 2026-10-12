import { useRef } from "react"
import cx from "clsx"
import { useSmoothCorners } from "@lisse/react"

import Page from "../../../components/Page"
import PanelHeader from "../../../components/PanelHeader"
import { RegularButton } from "../../../components/Button"
import SectionList from "../../../components/SectionList"
import Skeleton, {
    useRedactionClassName,
    waveRef,
} from "../../../components/Skeleton"
import Tabs from "../../../components/Tabs"

import {
    CORNER_RADIUS,
    CORNER_SMOOTHING,
} from "../../../components/WalletCard/corners"
import ListSkeleton from "./components/ListSkeleton"

import * as styles from "./GramWallet.module.scss"
import * as skeletonStyles from "./GramWallet.skeleton.module.scss"

const TABS = ["Transactions", "Collectibles"]

const CardBlock = () => {
    const ref = useRef(null)
    useSmoothCorners(
        ref,
        { radius: CORNER_RADIUS, smoothing: CORNER_SMOOTHING },
        { autoEffects: false }
    )
    const redaction = useRedactionClassName(true)
    return (
        <div
            ref={(node) => {
                ref.current = node
                waveRef(node)
            }}
            className={cx(skeletonStyles.card, redaction)}
        />
    )
}

const GramWalletSkeleton = () => (
    <Page>
        <PanelHeader
            pin="sticky"
            left={<PanelHeader.BackIcon />}
            right={<PanelHeader.MoreIcon />}
        />
        <div className={styles.wrapper}>
            <CardBlock />
            <Skeleton active>
                <div className={styles.actions}>
                    <div className={styles.action}>
                        <RegularButton
                            variant="filled"
                            label="Add Funds"
                            isFill
                        />
                    </div>
                    <div className={styles.action}>
                        <RegularButton variant="filled" label="Send" isFill />
                    </div>
                </div>
            </Skeleton>
        </div>
        <SectionList>
            <section>
                <div className={styles.glassHeader}>
                    <Tabs
                        tabs={TABS}
                        activeTabIndex={0}
                        variant="glass"
                        hug
                    />
                </div>
                <div className={styles.sectionContainer}>
                    <ListSkeleton caption />
                </div>
            </section>
        </SectionList>
    </Page>
)

export default GramWalletSkeleton
