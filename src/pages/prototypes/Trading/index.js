import PropTypes from "prop-types"
import { Calligraph } from "calligraph"

import { formatPercentage, formatPrice } from "../../../utils/number"

import Text from "../../../components/Text"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import Skeleton from "../../../components/Skeleton"

import AssetHeatmap from "./components/AssetHeatmap"

import useAssets from "../../../hooks/useAssets"

import * as styles from "./Trading.module.scss"

// Shown while loading. Same shape as the API response so the row markup is
// uniform; the varied mock lengths give the skeleton a realistic rhythm
// instead of identical bars.
const PLACEHOLDER_ASSETS = [
    { name: "Bitcoin", symbol: "btc", current_price: 64120, pct: 2.4 },
    { name: "Ethereum", symbol: "eth", current_price: 3180, pct: -1.1 },
    { name: "Toncoin", symbol: "ton", current_price: 5.42, pct: 0.8 },
    { name: "Solana", symbol: "sol", current_price: 142.6, pct: 3.9 },
    { name: "Notcoin", symbol: "not", current_price: 0.0091, pct: -2.2 },
    { name: "Tether", symbol: "usdt", current_price: 1.0, pct: 0.4 },
    { name: "Dogecoin", symbol: "doge", current_price: 0.121, pct: 1.5 },
    { name: "Polygon", symbol: "matic", current_price: 0.72, pct: -0.6 },
]

// Live rows carry a resolved `image` from the shared catalog, so icons always
// match the coin. The XTVC guess only backs the local placeholder rows, which
// predate the live catalog.
const assetIcon = (asset) =>
    asset.image ??
    `https://s3-symbol-logo.tradingview.com/crypto/XTVC${asset.symbol?.toUpperCase()}--big.svg`

// 24h move with a direction arrow instead of a sign, tinted by the app's
// semantic tokens; the arrow sits outside the odometer so a sign flip swaps
// it instantly instead of morphing through the digit animation.
const Delta = ({ value }) => {
    const up = value >= 0
    return (
        <span className={`${styles.delta} ${up ? styles.up : styles.down}`}>
            {up ? "↑" : "↓"}
            <Calligraph variant="number" animation="smooth">
                {formatPercentage(Math.abs(value))}
            </Calligraph>
        </span>
    )
}

Delta.propTypes = {
    value: PropTypes.number.isRequired,
}

function Trading() {
    const { assets, error } = useAssets()
    const loading = !assets && !error

    if (error) {
        return (
            <Page>
                <div className={`${styles.center} ${styles.error}`}>
                    <Text variant="body">Error loading assets</Text>
                </div>
            </Page>
        )
    }

    // Keyed by index (not id) so the placeholder rows and the real rows share
    // element identity: when data lands, each bar reveals in place instead of
    // the whole list remounting.
    const rows = assets ?? PLACEHOLDER_ASSETS

    return (
        <Page>
            <SectionList>
                <AssetHeatmap />
                <SectionList.Item header="Today's lists">
                    <Skeleton active={loading}>
                        {rows.map((asset, index) => (
                            <Cell
                                key={index}
                                start={
                                    <ImageAvatar src={assetIcon(asset)} />
                                }
                                end={
                                    <Cell.Text
                                        title={
                                            <>
                                                $
                                                <Calligraph
                                                    variant="number"
                                                    animation="smooth"
                                                >
                                                    {formatPrice(
                                                        asset.current_price
                                                    )}
                                                </Calligraph>
                                            </>
                                        }
                                        description={
                                            <Delta
                                                value={
                                                    asset.price_change_percentage_24h ??
                                                    asset.pct
                                                }
                                            />
                                        }
                                    />
                                }
                            >
                                <Cell.Text
                                    title={asset.name}
                                    description={asset.symbol?.toUpperCase()}
                                    bold
                                />
                            </Cell>
                        ))}
                    </Skeleton>
                </SectionList.Item>
            </SectionList>
        </Page>
    )
}

export default Trading
