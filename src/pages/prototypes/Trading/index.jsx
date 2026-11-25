import PropTypes from "prop-types"

import Text from "../../../components/Text"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"

import AssetHeatmap from "./components/AssetHeatmap"
import AssetList from "./components/AssetList"

import useAssets from "../../../hooks/useAssets"

import * as styles from "./Trading.module.scss"

function Trading({ onOpenAsset, children }) {
    const { error } = useAssets()

    if (error) {
        return (
            <Page>
                <div className={`${styles.center} ${styles.error}`}>
                    <Text variant="body">Error loading assets</Text>
                </div>
            </Page>
        )
    }

    return (
        <Page>
            <SectionList>
                <AssetHeatmap onOpen={onOpenAsset} />
                {children}
                <AssetList onOpen={onOpenAsset} />
            </SectionList>
        </Page>
    )
}

Trading.propTypes = {
    // Opens an asset's page by ticker; listings stay static without it.
    onOpenAsset: PropTypes.func,
    // Extra listings between the heatmap and the coin list.
    children: PropTypes.node,
}

export default Trading
