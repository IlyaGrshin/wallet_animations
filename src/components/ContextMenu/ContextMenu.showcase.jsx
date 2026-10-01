import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Collapsible from "../Collapsible"
import ImageAvatar from "../ImageAvatar"
import ContextMenu from "../ContextMenu"
import { useSnackbar } from "../Snackbar"

import { getAssetIcon } from "../../utils/AssetsMap"
import { BackButton } from "../../lib/twa"

import QRCodeIcon from "../../icons/28/QR Code.svg?react"
import XmarkIcon from "../../icons/24/Xmark.svg?react"
import TrashIcon from "../../icons/24/Trash.svg?react"

const ASSETS = [
    { ticker: "TON", name: "Toncoin", amount: "100 TON" },
    { ticker: "BTC", name: "Bitcoin", amount: "0.001 BTC" },
    { ticker: "USDT", name: "Tether", amount: "250 USDT" },
    { ticker: "NOT", name: "Notcoin", amount: "12,000 NOT" },
    { ticker: "MAJOR", name: "Major", amount: "48 MAJOR" },
    { ticker: "HMSTR", name: "Hamster Kombat", amount: "3,400 HMSTR" },
]

const ContextMenuShowcase = () => {
    const snackbar = useSnackbar()
    const [deleted, setDeleted] = useState(() => new Set())

    const handleSelect = (ticker, name) => (item) => {
        if (item.destructive) {
            setDeleted((prev) => new Set(prev).add(ticker))
            return
        }
        snackbar.show({ title: `${item.label}: ${name}` })
    }

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item
                        header="Assets"
                        description="Touch and hold a row, or right-click it on desktop."
                    >
                        {ASSETS.map(({ ticker, name, amount }) => (
                            <Collapsible
                                key={ticker}
                                open={!deleted.has(ticker)}
                            >
                                <ContextMenu
                                    items={[
                                        {
                                            label: "Show QR Code",
                                            icon: <QRCodeIcon />,
                                        },
                                        { label: "Hide", icon: <XmarkIcon /> },
                                        {
                                            label: "Delete",
                                            icon: <TrashIcon />,
                                            destructive: true,
                                        },
                                    ]}
                                    onSelect={handleSelect(ticker, name)}
                                >
                                    <Cell
                                        start={
                                            <ImageAvatar
                                                src={getAssetIcon(ticker)}
                                            />
                                        }
                                        onClick={() =>
                                            snackbar.show({ title: name })
                                        }
                                    >
                                        <Cell.Text
                                            title={name}
                                            description={amount}
                                            bold
                                        />
                                    </Cell>
                                </ContextMenu>
                            </Collapsible>
                        ))}
                    </SectionList.Item>

                    <SectionList.Item>
                        <Cell onClick={() => setDeleted(new Set())}>
                            <Cell.Text type="Accent" title="Restore All" />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default ContextMenuShowcase
