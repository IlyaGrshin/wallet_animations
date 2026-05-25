import { useEffect, useRef, useState } from "react"
import WalletCard from "../../../components/WalletCard"
import Page from "../../../components/Page"
import { RegularButton } from "../../../components/Button"
import Tabs from "../../../components/Tabs"
import TabContent from "../../../components/Tabs/TabContent"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import InitialsAvatar from "../../../components/InitialsAvatar"
import ImageAvatar from "../../../components/ImageAvatar"
import Spinner from "../../../components/Spinner"
import { BackButton, getUser } from "../../../lib/twa"

import useWalletData from "./useWalletData"
import * as styles from "./GramWallet.module.scss"

const MY_ADDRESS = "UQDYzZmfsrGzhObKJUw4gzdeIxEai3jAFbiGKGwxvxHinf4K"

const tgUser = getUser()
const tgName = tgUser?.id === 38304776
    ? "Alicia Torreaux"
    : tgUser
        ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
        : ""

function hashToUserId(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
    return Math.abs(h)
}

const TABS = ["Transactions", "Collectibles"]

const GramWallet = () => {
    const [tabIndex, setTabIndex] = useState(0)
    const {
        transactions,
        collectibles,
        tonAmount,
        usdtAmount,
        balance,
        hasMoreTransactions,
        isLoadingMoreTransactions,
        loadMoreTransactions,
        isLoading,
        error,
    } = useWalletData(MY_ADDRESS)
    const sentinelRef = useRef(null)

    useEffect(() => {
        if (tabIndex !== 0 || !hasMoreTransactions) return
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadMoreTransactions()
            },
            { rootMargin: "200px" }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [tabIndex, hasMoreTransactions, loadMoreTransactions])

    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        const locks = [
            [html, "overflow", "hidden"],
            [body, "overflow", "hidden"],
            [html, "touchAction", "none"],
            [body, "touchAction", "none"],
            [body, "overscrollBehavior", "none"],
        ]
        const restores = locks.map(([el, prop, val]) => {
            const prev = el.style[prop]
            el.style[prop] = val
            return [el, prop, prev]
        })
        return () => {
            for (const [el, prop, prev] of restores) el.style[prop] = prev
        }
    }, [])

    function renderTransactionAvatar(tx) {
        if (tx.icon) return <ImageAvatar src={tx.icon} />
        return (
            <InitialsAvatar userId={hashToUserId(tx.name)} name={tx.name} />
        )
    }

    function renderTabContent() {
        if (isLoading) {
            return (
                <div className={styles.feedback}>
                    <Spinner centered />
                </div>
            )
        }
        if (error) {
            return <div className={styles.feedback}>{error}</div>
        }
        if (tabIndex === 0) {
            return (
                <>
                    <div className={styles.cellList}>
                        {transactions.map((tx) => (
                            <Cell
                                key={tx.id}
                                start={renderTransactionAvatar(tx)}
                                end={<Cell.End label={tx.amount} />}
                            >
                                <Cell.Text
                                    title={tx.name}
                                    description={tx.description}
                                    caption={tx.caption}
                                    bold
                                />
                            </Cell>
                        ))}
                    </div>
                    {hasMoreTransactions && (
                        <div ref={sentinelRef} className={styles.sentinel}>
                            {isLoadingMoreTransactions && <Spinner />}
                        </div>
                    )}
                </>
            )
        }
        return (
            <div className={styles.cellList}>
                {collectibles.map((item) => (
                    <Cell
                        key={item.id}
                        start={<ImageAvatar src={item.image} shape="rounded" />}
                        end={<Cell.Part type="Chevron" />}
                    >
                        <Cell.Text
                            title={item.name}
                            description={item.description}
                            bold
                        />
                    </Cell>
                ))}
            </div>
        )
    }

    return (
        <>
            <BackButton />
            <Page>
                <div className={styles.wrapper}>
                    <WalletCard
                        name={tgName || undefined}
                        address={MY_ADDRESS}
                        usdtAmount={usdtAmount || "0.00"}
                        gramAmount={tonAmount || "0.00"}
                        balance={balance || "$0.00"}
                    />
                    <div className={styles.actions}>
                        <div className={styles.action}>
                            <RegularButton
                                variant="filled"
                                label="Add Funds"
                                isFill
                            />
                        </div>
                        <div className={styles.action}>
                            <RegularButton
                                variant="filled"
                                label="Send"
                                isFill
                            />
                        </div>
                    </div>
                </div>
                <SectionList>
                    <section>
                        <div className={styles.glassHeader}>
                            <Tabs
                                tabs={TABS}
                                activeTabIndex={tabIndex}
                                onChange={setTabIndex}
                                variant="glass"
                                scrollable
                            />
                        </div>
                        <div className={styles.sectionContainer}>
                            <TabContent activeIndex={tabIndex}>
                                {renderTabContent()}
                            </TabContent>
                        </div>
                    </section>
                </SectionList>
            </Page>
        </>
    )
}

export default GramWallet
