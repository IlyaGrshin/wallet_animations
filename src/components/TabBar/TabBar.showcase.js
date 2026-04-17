import Page from "../Page"
import TabBar from "../TabBar"

import { BackButton } from "../../lib/twa"

import WalletIcon from "../../icons/tabbar/Wallet.svg?react"
import ChartlineIcon from "../../icons/tabbar/Chartline.svg?react"
import ClockIcon from "../../icons/tabbar/Clock.svg?react"

const tabs = [
    { label: "Wallet", icon: <WalletIcon /> },
    { label: "Trade", icon: <ChartlineIcon /> },
    { label: "History", icon: <ClockIcon /> },
]

const wrapperStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    pointerEvents: "none",
}

const TabBarShowcase = () => (
    <>
        <BackButton />
        <Page backgroundColor="E86A5D" headerColor="E86A5D">
            <div style={wrapperStyle}>
                <div style={{ pointerEvents: "auto" }}>
                    <TabBar tabs={tabs} />
                </div>
            </div>
        </Page>
    </>
)

export default TabBarShowcase
