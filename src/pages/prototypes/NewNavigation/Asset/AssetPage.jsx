import { useRef } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import WebApp from "../../../../lib/twa"
import Page from "../../../../components/Page"
import SectionList from "../../../../components/SectionList"
import Text from "../../../../components/Text"
import { useLatestPrice } from "../../../../hooks/usePriceHistory"
import useAssetProfile from "../../../../hooks/useAssetProfile"
import AssetHeader from "./AssetHeader"
import Hero from "./Hero"
import { Chip } from "./Badges"
import { Holdings, Transactions } from "./Holdings"
import { About, Links, Overview } from "./Info"
import BottomBar from "./BottomBar"
import { buildHoldings, overviewRows, profileLinks } from "./pages"

import * as styles from "./Asset.module.scss"

const SOURCES = "Market data by TradingView, description by CoinGecko."

// Hero's status chip: the market session for a stock, the earn rate for an
// asset that can be staked.
const chipFor = (page) => {
    if (page.kind === "stock") return <Chip kind={page.market} />
    if (page.earn)
        return <Chip kind="earn" label={`Earn ${page.earn.apy} APY`} />
    return null
}

function RestrictedNotice({ ticker }) {
    return (
        <div className={styles.notice}>
            <Text
                apple={{ variant: "subheadline2", weight: "regular" }}
                material={{ variant: "subheadline2", weight: "regular" }}
            >
                Currently, {ticker} can only be purchased, held and sold within
                Wallet. It is not possible to transfer, receive or withdraw{" "}
                {ticker} externally.
            </Text>
        </div>
    )
}

RestrictedNotice.propTypes = {
    ticker: PropTypes.string.isRequired,
}

// Holdings at the live price: subscribes to the price alone, so ticks
// repaint this card and leave the rest of the page be.
function LiveHoldings({ page }) {
    const price = useLatestPrice(page.balance ? page.symbol : null)
    if (!price) return null
    return (
        <Holdings
            title="Your Portfolio"
            holdings={buildHoldings(page, price)}
            icon={page.icon}
        />
    )
}

LiveHoldings.propTypes = {
    page: PropTypes.object.isRequired,
}

// A tradable asset: live chart hero, then what the user holds and what the
// asset is. Live data stays inside Hero and LiveHoldings.
export default function AssetPage({ page }) {
    const titleRef = useRef(null)
    // Stocks keep their curated copy: the coin sources don't cover them.
    const { stats, profile } = useAssetProfile(
        page.ticker,
        page.symbol,
        page.kind !== "stock"
    )
    const about =
        page.about ??
        (profile?.description
            ? { text: profile.description, clamp: true }
            : null)
    const overview = overviewRows(stats)
    const links = page.links ?? profileLinks(page, profile)

    return (
        <Page headerColor={WebApp.themeParams.section_bg_color?.slice(1)}>
            <div className={cx(styles.root, styles.cardTop)}>
                <AssetHeader title={page.name} titleRef={titleRef} overCard />
                {page.restricted && <RestrictedNotice ticker={page.ticker} />}
                <Hero page={page} chip={chipFor(page)} titleRef={titleRef} />
                <div className={styles.sections}>
                    <SectionList>
                        <LiveHoldings page={page} />
                        {page.transactions.length > 0 && (
                            <Transactions items={page.transactions} />
                        )}
                        {about && <About about={about} />}
                        {overview && (
                            <Overview rows={overview} footnote={SOURCES} />
                        )}
                        {links && <Links links={links} />}
                    </SectionList>
                </div>
                <BottomBar page={page} />
            </div>
        </Page>
    )
}

AssetPage.propTypes = {
    page: PropTypes.object.isRequired,
}
