import React, { Suspense } from "react"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import Spinner from "../../../components/Spinner"
import { createResource } from "../../../hooks/useCache"

const fetchAssets = async () => {
    const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1"
    )
    return response.json()
}

const assetsResource = createResource("crypto-assets", fetchAssets)

const AssetsList = () => {
    const assets = assetsResource.read()

    return (
        <SectionList>
            <SectionList.Item header="Today's lists">
                {assets.map((asset) => (
                    <Cell
                        start={<ImageAvatar src={asset.image} />}
                        end={
                            <Cell.Text
                                title={`$${asset.current_price}`}
                                description={`${asset.price_change_percentage_24h?.toFixed(2)}%`}
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

const Trading = () => {
    return (
        <Page>
            <Suspense fallback={<Spinner />}>
                <AssetsList />
            </Suspense>
        </Page>
    )
}

export default React.memo(Trading)
