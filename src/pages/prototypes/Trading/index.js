import { formatPercentage } from "../../../utils/number"

import Text from "../../../components/Text"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import Skeleton from "../../../components/Skeleton"

import useAssets from "../../../hooks/useAssets"

import * as styles from "./Trading.module.scss"

// Shown while loading. Same shape as the API response so the row markup is
// uniform; the varied mock lengths give the skeleton a realistic rhythm
// instead of identical bars.
const PLACEHOLDER_ASSETS = [
    { name: "Bitcoin", symbol: "btc", current_price: "64,120", pct: 2.4 },
    { name: "Ethereum", symbol: "eth", current_price: "3,180", pct: -1.1 },
    { name: "Toncoin", symbol: "ton", current_price: "5.42", pct: 0.8 },
    { name: "Solana", symbol: "sol", current_price: "142.6", pct: 3.9 },
    { name: "Notcoin", symbol: "not", current_price: "0.0091", pct: -2.2 },
    { name: "Tether", symbol: "usdt", current_price: "1.00", pct: 0.4 },
    { name: "Dogecoin", symbol: "doge", current_price: "0.121", pct: 1.5 },
    { name: "Polygon", symbol: "matic", current_price: "0.72", pct: -0.6 },
]

const assetIcon = (symbol) =>
    `https://s3-symbol-logo.tradingview.com/crypto/XTVC${symbol?.toUpperCase()}--big.svg`

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
                <SectionList.Item header="Today's lists">
                    <Skeleton active={loading}>
                        {rows.map((asset, index) => (
                            <Cell
                                key={index}
                                start={
                                    <ImageAvatar src={assetIcon(asset.symbol)} />
                                }
                                end={
                                    <Cell.Text
                                        title={`$${asset.current_price}`}
                                        description={formatPercentage(
                                            asset.price_change_percentage_24h ??
                                                asset.pct
                                        )}
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
