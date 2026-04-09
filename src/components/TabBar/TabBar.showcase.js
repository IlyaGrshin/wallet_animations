import Page from "../Page"
import SectionList from "../SectionList"
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

const TabBarShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <SectionList.Item header="TabBar">
                    <div style={{ position: "relative", height: 80 }}>
                        <TabBar tabs={tabs} />
                    </div>
                </SectionList.Item>
            </SectionList>
        </Page>
    </>
)

export default TabBarShowcase
