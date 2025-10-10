import { memo } from "react"

import * as styles from "./Wallet.module.scss"
import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"

import Balance from "./components/Balance"
import ActionButtons from "./components/ActionButtons"
import Assets from "./components/Assets"
import TransactionList from "./components/TransactionList"

function ImagePlayground() {
    return (
        <SectionList.Item header="Image Playground">
            <div
                style={{
                    backgroundImage: "url(https://picsum.photos/1200/1200)",
                    width: "100%",
                    height: "400px",
                    backgroundSize: "cover",
                }}
            ></div>
        </SectionList.Item>
    )
}

function Spacer() {
    return <div className={styles.spacer}></div>
}

function Wallet() {
    return (
        <Page>
            <div className={styles.wallet}>
                <Balance />
                <ActionButtons />
                <Spacer />
                <SectionList>
                    <Assets />
                    <TransactionList />
                    <ImagePlayground />
                </SectionList>
            </div>
        </Page>
    )
}

export default memo(Wallet)
