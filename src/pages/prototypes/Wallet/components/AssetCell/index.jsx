import PropTypes from "prop-types"

import * as styles from "./AssetCell.module.scss"
import Cell from "../../../../../components/Cells"
import ImageAvatar from "../../../../../components/ImageAvatar"
import InitialsAvatar from "../../../../../components/InitialsAvatar"
import { getAssetIcon } from "../../../../../utils/AssetsMap"
import {
    formatAmount,
    formatPrice,
    formatUsd,
} from "../../../../../utils/number"

export default function AssetCell({ asset }) {
    return (
        <Cell
            start={
                <ImageAvatar
                    src={getAssetIcon(asset.ticker)}
                    fallback={
                        <InitialsAvatar userId={asset.id} name={asset.ticker} />
                    }
                />
            }
            end={
                <Cell.Text
                    title={formatUsd(asset.rate * asset.value)}
                    description={`${formatAmount(asset.value)} ${asset.ticker}`}
                />
            }
        >
            <Cell.Text
                title={
                    <span className={styles.name} title={asset.name}>
                        {asset.name}
                    </span>
                }
                description={`$${formatPrice(Number(asset.rate))}`}
                bold
            />
        </Cell>
    )
}

AssetCell.propTypes = {
    asset: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        ticker: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        rate: PropTypes.string.isRequired,
    }).isRequired,
}
