import TransferIcon from "../../../../icons/22/Transfer.svg?react"
import QrIcon from "../../../../icons/22/QR Code.svg?react"
import WithdrawIcon from "../../../../icons/22/Arrow Up Circle.svg?react"
import TonWalletIcon from "../../../../icons/22/TON Circle Logo.svg?react"

// Items behind the Fake Main Button's "more" (Figma "Context Menus").
export const menuFor = (page) => {
    if (page.restricted) return []
    if (page.kind === "stock") {
        return [{ label: `Receive ${page.ticker}`, icon: <QrIcon /> }]
    }

    const isDollars = page.kind === "dollars"
    const menu = [
        { label: "Transfer to a friend", icon: <TransferIcon /> },
        {
            label: isDollars
                ? "Receive Dollars (USDT)"
                : `Receive ${page.name}`,
            icon: <QrIcon />,
        },
        { label: "Withdraw", icon: <WithdrawIcon /> },
    ]
    if (isDollars) {
        menu.push({
            label: "Transfer to TON Wallet",
            icon: <TonWalletIcon />,
            separator: true,
        })
    }
    return menu
}
