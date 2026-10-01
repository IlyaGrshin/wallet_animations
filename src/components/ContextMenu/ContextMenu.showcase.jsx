import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Collapsible from "../Collapsible"
import ImageAvatar from "../ImageAvatar"
import ContextMenu from "../ContextMenu"
import { RegularButton, MultilineButton } from "../Button"
import { useSnackbar } from "../Snackbar"
import { useLongPress } from "../../hooks/useLongPress"

import { getAssetIcon } from "../../utils/AssetsMap"
import { BackButton } from "../../lib/twa"

import QRCodeIcon from "../../icons/28/QR Code.svg?react"
import XmarkIcon from "../../icons/24/Xmark.svg?react"
import TrashIcon from "../../icons/24/Trash.svg?react"
import ArrowUpIcon from "../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowDownIcon from "../../icons/28/Arrow Down Circle Fill.svg?react"

import * as styles from "./ContextMenu.showcase.module.scss"

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

    const notify = (title) => snackbar.show({ title })
    const bareLongPress = useLongPress({
        onLongPress: () => notify("Long press, no menu"),
    })

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
                                    surface
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

                    <SectionList.Item header="Buttons">
                        <div className={styles.buttons}>
                            <ContextMenu
                                items={["To Contact", "To Address", "Scan QR"]}
                                onSelect={(item) => notify(`Send ${item}`)}
                            >
                                <MultilineButton
                                    variant="filled"
                                    icon={<ArrowUpIcon />}
                                    label="Send"
                                    onClick={() => notify("Send")}
                                />
                            </ContextMenu>
                            <ContextMenu
                                items={["Show Address", "Copy Address"]}
                                onSelect={(item) => notify(item)}
                            >
                                <MultilineButton
                                    variant="filled"
                                    icon={<ArrowDownIcon />}
                                    label="Receive"
                                    onClick={() => notify("Receive")}
                                />
                            </ContextMenu>
                        </div>
                    </SectionList.Item>

                    <SectionList.Item header="Avatars">
                        <div className={styles.avatars}>
                            {ASSETS.slice(0, 4).map(({ ticker, name }) => (
                                <ContextMenu
                                    key={ticker}
                                    items={["Open", "Copy Ticker"]}
                                    onSelect={(item) =>
                                        notify(`${item}: ${name}`)
                                    }
                                >
                                    <ImageAvatar
                                        size={56}
                                        src={getAssetIcon(ticker)}
                                    />
                                </ContextMenu>
                            ))}
                        </div>
                    </SectionList.Item>

                    <SectionList.Item
                        header="Hook only"
                        description="useLongPress on its own: any element, no menu."
                    >
                        <div className={styles.buttons}>
                            <RegularButton
                                {...bareLongPress}
                                variant="outlined"
                                label="Tap or hold"
                                onClick={() => notify("Tap")}
                            />
                        </div>
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
