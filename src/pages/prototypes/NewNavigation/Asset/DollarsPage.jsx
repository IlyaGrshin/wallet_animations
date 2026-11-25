import { useRef } from "react"
import PropTypes from "prop-types"

import Page from "../../../../components/Page"
import SectionList from "../../../../components/SectionList"
import { Holdings, Transactions } from "./Holdings"
import { DepositCard, DollarsFacts, EarnBanner } from "./Dollars"
import AssetHeader from "./AssetHeader"
import BottomBar from "./BottomBar"
import { buildHoldings } from "./pages"

import * as styles from "./Asset.module.scss"

// No balance yet: the card still shows "$0.00".
const ZERO = { total: 0, change: 0, changePct: 0, rows: [] }

// Dollars: no chart, the balance comes first. Until the user earns on them a
// promo invites to; until they hold any, a card shows how to deposit.
export default function DollarsPage({ page }) {
    const titleRef = useRef(null)
    // Dollars hold their value: priced at 1.
    const holdings = buildHoldings(page, 1) ?? ZERO
    const isEarning = Boolean(page.balance && page.earn)

    return (
        <Page>
            <div className={styles.root}>
                <AssetHeader title={page.name} titleRef={titleRef} />
                <div className={styles.dollars}>
                    <SectionList ref={titleRef}>
                        <Holdings
                            title="Dollars"
                            holdings={holdings}
                            icon={page.icon}
                            labelled
                        />
                    </SectionList>
                    {!isEarning && <EarnBanner apy={page.earn.apy} />}
                    <SectionList>
                        {!page.balance && <DepositCard />}
                        {page.transactions.length > 0 && (
                            <Transactions items={page.transactions} />
                        )}
                        <DollarsFacts />
                    </SectionList>
                </div>
                <BottomBar page={page} />
            </div>
        </Page>
    )
}

DollarsPage.propTypes = {
    page: PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string,
        balance: PropTypes.object,
        earn: PropTypes.shape({ apy: PropTypes.string.isRequired }).isRequired,
        transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
    }).isRequired,
}
