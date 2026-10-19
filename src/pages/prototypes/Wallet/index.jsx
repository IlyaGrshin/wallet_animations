import PropTypes from "prop-types"

import * as styles from "./Wallet.module.scss"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import HiddenBalance from "../../../components/HiddenBalance"
import { getAssetIcon } from "../../../utils/AssetsMap"

import Balance from "./components/Balance"
import ActionButtons from "./components/ActionButtons"
import Assets from "./components/Assets"
import TransactionList from "./components/TransactionList"

function ImagePlayground() {
    return (
        <SectionList.Item header="Image Playground">
            <div className={styles.imagePlayground}></div>
        </SectionList.Item>
    )
}

function Spacer() {
    return <div className={styles.spacer}></div>
}

function Wallet({ onOpenTonWallet, balancesHidden = false }) {
    return (
        <Page>
            <HiddenBalance.Provider defaultHidden={balancesHidden}>
                <div className={styles.wallet}>
                    <Balance />
                    <ActionButtons />
                    <Spacer />
                    <SectionList>
                        <Assets />
                        {onOpenTonWallet && (
                            <SectionList.Item>
                                <Cell
                                    start={
                                        <ImageAvatar
                                            src={getAssetIcon("TON")}
                                        />
                                    }
                                    end={<Cell.Part type="Chevron" />}
                                    onClick={onOpenTonWallet}
                                >
                                    <Cell.Text title="TON Wallet" bold />
                                </Cell>
                            </SectionList.Item>
                        )}
                        <TransactionList />
                        <ImagePlayground />
                    </SectionList>
                </div>
            </HiddenBalance.Provider>
        </Page>
    )
}

Wallet.propTypes = {
    onOpenTonWallet: PropTypes.func,
    // Start with every balance hidden (e.g. a "hide balances" user setting).
    balancesHidden: PropTypes.bool,
}

export default Wallet
