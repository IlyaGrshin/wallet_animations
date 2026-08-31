import Page from "../../../components/Page"
import PanelHeader from "../../../components/PanelHeader"
import { RegularButton } from "../../../components/Button"
import SectionList from "../../../components/SectionList"
import Skeleton, { SkeletonBlock } from "../../../components/Skeleton"
import Tabs from "../../../components/Tabs"

import ListSkeleton from "./components/ListSkeleton"

import * as styles from "./GramWallet.module.scss"
import * as skeletonStyles from "./GramWallet.skeleton.module.scss"

const TABS = ["Transactions", "Collectibles"]

const GramWalletSkeleton = () => (
    <Page>
        <PanelHeader
            pin="sticky"
            left={<PanelHeader.BackIcon />}
            right={<PanelHeader.MoreIcon />}
        />
        <div className={styles.wrapper}>
            <SkeletonBlock className={skeletonStyles.card} />
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
