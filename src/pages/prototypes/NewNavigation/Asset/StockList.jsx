import PropTypes from "prop-types"

import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import ImageAvatar from "../../../../components/ImageAvatar"
import Calligraph from "../../../../components/Calligraph"
import usePriceHistory from "../../../../hooks/usePriceHistory"
import { CURATED, STOCKS } from "./data"
import { formatPrice } from "./format"
import { Delta } from "./Badges"

// Price and day change off the chart stream the stock's page reuses.
function StockRow({ id, onOpen }) {
    const stock = CURATED[id]
    const bars = usePriceHistory(stock.symbol)
    const price = bars?.at(-1)?.close
    const change = price ? ((price - bars[0].close) / bars[0].close) * 100 : 0

    return (
        <Cell
            onClick={() => onOpen(id)}
            start={<ImageAvatar src={stock.icon} size={40} />}
            end={
                <Cell.Text
                    title={
                        price ? (
                            <Calligraph variant="number" simple>
                                {formatPrice(price)}
                            </Calligraph>
                        ) : (
                            8
                        )
                    }
                    description={price ? <Delta value={change} /> : 5}
                />
            }
        >
            <Cell.Text title={stock.name} description={stock.ticker} bold />
        </Cell>
    )
}

StockRow.propTypes = {
    id: PropTypes.string.isRequired,
    onOpen: PropTypes.func.isRequired,
}

// Trade's listing of tokenized stocks, beside the coin catalog.
export default function StockList({ onOpen }) {
    return (
        <SectionList.Item header="Tokenized Stocks">
            {STOCKS.map((id) => (
                <StockRow key={id} id={id} onOpen={onOpen} />
            ))}
        </SectionList.Item>
    )
}

StockList.propTypes = {
    onOpen: PropTypes.func.isRequired,
}
