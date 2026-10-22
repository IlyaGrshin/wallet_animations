import cx from "clsx"

import * as styles from "./TransactionList.module.scss"
import SectionList from "../../../../../components/SectionList"
import Cell from "../../../../../components/Cells"
import { truncateMiddle } from "../../../../../utils/common"
import HiddenBalance from "../../../../../components/HiddenBalance"
import txHistory from "../../data/transactions.json"

const STATUS_TONE = {
    Received: styles.received,
    Failed: styles.failed,
}

export default function TransactionList() {
    if (txHistory.length === 0) return null

    return (
        <SectionList.Item
            header="Transaction History"
            className={styles.transactions}
        >
            {txHistory.map((tx, index) => (
                <Cell
                    start={<Cell.Start type="Icon" />}
                    end={
                        <div
                            className={cx(
                                styles.amount,
                                STATUS_TONE[tx.status]
                            )}
                        >
                            <Cell.Text
                                title={
                                    <HiddenBalance>{tx.value}</HiddenBalance>
                                }
                                description={tx.status}
                            />
                        </div>
                    }
                    key={`tx-${index}`}
                >
                    <Cell.Text
                        title={tx.name ?? truncateMiddle(tx.address)}
                        description={tx.date}
                        bold
                    />
                </Cell>
            ))}
        </SectionList.Item>
    )
}
