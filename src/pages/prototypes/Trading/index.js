import { use, Suspense } from "react"
import { formatPercentage } from "../../../utils/number"
import { ErrorBoundary } from "react-error-boundary"

import Text from "../../../components/Text"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import Spinner from "../../../components/Spinner"

const fetchAssets = async () => {
    const response = await fetch("https://ilyagrshn.com/coingeckoApi/index.php")
    return response.json()
}

const assetsResource = fetchAssets()

const AssetsList = () => {
    const assets = use(assetsResource)
    return (
        <SectionList>
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

function Trading() {
    return (
        <Page>
            <ErrorBoundary
                fallback={
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                        }}
                    >
                        <Text
                            apple={{ variant: "body" }}
                            material={{ variant: "body1" }}
                            style={{
                                color: "var(--tg-theme-subtitle-text-color)",
                            }}
                        >
                            Error loading assets
                        </Text>
                    </div>
                }
            >
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
            </ErrorBoundary>
        </Page>
    )
}

export default Trading
