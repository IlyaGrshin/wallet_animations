import PropTypes from "prop-types"
import { useLocation } from "wouter"

import { BackButton } from "../../../../lib/twa"
import PageSkeleton from "../../../../components/PageSkeleton"
import useAssets from "../../../../hooks/useAssets"
import wallet from "../../Wallet/data/assets.json"
import AssetPage from "./AssetPage"
import DollarsPage from "./DollarsPage"
import { CURATED } from "./data"
import { canonicalTicker, resolvePage } from "./pages"
import { NAVIGATION_PATH } from "./constants"

// Asset route of the Navigation prototype, opened from a Walt balance or a
// Trade listing; back returns to the tabs.
export default function Asset({ id }) {
    const [, navigate] = useLocation()
    const ticker = canonicalTicker(id)
    const { assets, error } = useAssets()

    // Only the listing's identity matters here. Picked as primitives, the
    // page resolves again when the coin's listing changes, not on every
    // price flush of the hundred-coin catalog.
    const row = assets?.find((asset) => asset.symbol?.toUpperCase() === ticker)
    const name = row?.name
    const image = row?.image
    const quoteSymbol = row?.quoteSymbol
    const page = resolvePage(ticker, {
        listing: { name, image, quoteSymbol },
        wallet,
    })

    // An uncurated coin waits for its listing rather than charting a guessed
    // symbol and swapping it under the user.
    const waiting = !CURATED[ticker]?.symbol && assets === null && !error

    return (
        <>
            <BackButton onClick={() => navigate(NAVIGATION_PATH)} />
            {waiting ? (
                <PageSkeleton />
            ) : page.kind === "dollars" ? (
                <DollarsPage page={page} />
            ) : (
                <AssetPage page={page} />
            )}
        </>
    )
}

Asset.propTypes = {
    id: PropTypes.string.isRequired,
}
