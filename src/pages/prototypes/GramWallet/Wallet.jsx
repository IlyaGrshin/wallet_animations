import { useEffect, useRef, useState } from "react"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"
import { useLocation } from "wouter"
import WalletCard from "../../../components/WalletCard"
import useDeviceTilt from "../../../components/WalletCard/useDeviceTilt"
import Page from "../../../components/Page"
import { RegularButton } from "../../../components/Button"
import Tabs from "../../../components/Tabs"
import TabContent from "../../../components/Tabs/TabContent"
import SectionList from "../../../components/SectionList"
import { BackButton, getUser } from "../../../lib/twa"

import { MY_ADDRESS, SEND_PATH } from "./constants"
import Collectibles from "./components/Collectibles"
import Feedback from "./components/Feedback"
import Transactions from "./components/Transactions"
import Header from "./Header"
import useWalletData from "./useWalletData"
import useWalletFlight from "./useWalletFlight"
import * as styles from "./GramWallet.module.scss"

const tgUser = getUser()
const tgName =
    tgUser?.id === 38304776
        ? "Alicia Torreaux"
        : tgUser
          ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
          : ""

const TABS = ["Transactions", "Collectibles"]

const Wallet = () => {
    const [, navigate] = useLocation()
    const [tabIndex, setTabIndex] = useState(0)
    const {
        transactions,
        collectibles,
        tonAmount,
        balance,
        hasMoreTransactions,
        loadMoreTransactions,
        loadCollectibles,
        error,
    } = useWalletData(MY_ADDRESS)
    const [cardEl, setCardEl] = useState(null)
    const [amountEl, setAmountEl] = useState(null)
    const [balanceEl, setBalanceEl] = useState(null)
    const [gramLineEl, setGramLineEl] = useState(null)
    const [fiatLineEl, setFiatLineEl] = useState(null)
    const flight = useWalletFlight({
        cardEl,
        gramAnchor: amountEl,
        fiatAnchor: balanceEl,
        gramEl: gramLineEl,
        fiatEl: fiatLineEl,
    })

    const tiltScopeRef = useRef(null)
    const tiltDamp = useTransform(flight.progress, (p) => 1 - p)
    useDeviceTilt(tiltScopeRef, tiltDamp)

    useEffect(() => {
        if (tabIndex === 1) loadCollectibles()
    }, [tabIndex, loadCollectibles])

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

    function renderTabContent() {
        if (error) return <Feedback>{error}</Feedback>
        if (tabIndex === 0) {
            return (
                <Transactions
                    items={transactions}
                    hasMore={hasMoreTransactions}
                    loadMore={loadMoreTransactions}
                />
            )
        }
        return <Collectibles items={collectibles} />
    }

    return (
        <>
            <BackButton />
            <Page>
                <div ref={tiltScopeRef} className={styles.tiltScope}>
                    <Header
                        gramAmount={tonAmount || "0.00"}
                        balance={balance || "$0.00"}
                        flight={flight}
                        gramRef={setGramLineEl}
                        fiatRef={setFiatLineEl}
                    />
                    <div className={styles.wrapper}>
                        <m.div
                            ref={setCardEl}
                            className={styles.cardShell}
                            style={{
                                scale: flight.card.scale,
                                "--wallet-card-fade": flight.card.fade,
                            }}
                        >
                            <WalletCard
                                name={tgName || undefined}
                                address={MY_ADDRESS}
                                gramAmount={tonAmount || "0.00"}
                                balance={balance || "$0.00"}
                                amountRef={setAmountEl}
                                balanceRef={setBalanceEl}
                                valuesHidden
                                tilt={false}
                            />
                        </m.div>
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
                                    onClick={() => navigate(SEND_PATH)}
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
                                    hug
                                />
                            </div>
                            <div className={styles.sectionContainer}>
                                <TabContent activeIndex={tabIndex}>
                                    {renderTabContent()}
                                </TabContent>
                            </div>
                        </section>
                    </SectionList>
                </div>
            </Page>
        </>
    )
}

export default Wallet
