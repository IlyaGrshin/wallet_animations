import { use, Suspense } from "react"
import { formatPercentage } from "../../../utils/number"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import Spinner from "../../../components/Spinner"
import CryptoHeatmap from "../../../components/CryptoHeatmap"
import { createResource } from "../../../hooks/useCache"

const fetchAssets = async () => {
    const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
    )
    return response.json()
}

const assetsResource = createResource("crypto-assets", fetchAssets)

const AssetsList = () => {
    const assets = use(assetsResource)

    return (
        <SectionList>
            <SectionList.Item header="Market heatmap" description="Sized by 24h volume">
                <CryptoHeatmap assets={assets} />
            </SectionList.Item>
            <SectionList.Item header="Today's lists">
                {assets.map((asset) => (
                    <Cell
                        start={<ImageAvatar src={asset.image} />}
                        end={
                            <Cell.Text
                                title={`$${asset.current_price}`}
                                description={formatPercentage(
                                    asset.price_change_percentage_24h
                                )}
                            />
                        }
                        key={`tx-${asset.id}`}
                    >
                        <Cell.Text
                            title={asset.name}
                            description={asset.symbol?.toUpperCase()}
                            bold
                        />
                    </Cell>
                ))}
            </SectionList.Item>
        </SectionList>
    )
}

// No need for memo with React 19's automatic memoization
function Trading() {
    return (
        <Page>
            <Suspense
                fallback={
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                        }}
                    >
                        <Spinner />
                    </div>
                }
            >
                <AssetsList />
            </Suspense>
        </Page>
    )
}

export default Trading
