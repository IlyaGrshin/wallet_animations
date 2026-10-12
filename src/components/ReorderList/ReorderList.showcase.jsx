import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import InitialsAvatar from "../InitialsAvatar"
import ReorderList from "../ReorderList"
import { useSnackbar } from "../Snackbar"

import { BackButton } from "../../lib/twa"

const ASSETS = {
    1: { name: "Toncoin", balance: "1,240.50 TON" },
    2: { name: "Tether", balance: "830.00 USDT" },
    3: { name: "Bitcoin", balance: "0.0142 BTC" },
    4: { name: "Ethereum", balance: "0.85 ETH" },
    5: { name: "Notcoin", balance: "52,000 NOT" },
    6: { name: "Dogs", balance: "1,000,000 DOGS" },
}

const ReorderListShowcase = () => {
    const snackbar = useSnackbar()
    const [order, setOrder] = useState(() => Object.keys(ASSETS).map(Number))
    const [editing, setEditing] = useState(false)

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item>
                        <Cell.Switch value={editing} onChange={setEditing}>
                            <Cell.Text title="Edit Mode" />
                        </Cell.Switch>
                    </SectionList.Item>

                    <SectionList.Item
                        header="Assets"
                        description={
                            editing
                                ? "Drag a handle to reorder. Arrow keys move the focused row."
                                : "Touch and hold an asset, then drag it to a new place."
                        }
                    >
                        <ReorderList
                            values={order}
                            onReorder={setOrder}
                            editing={editing}
                        >
                            {order.map((id) => {
                                const { name, balance } = ASSETS[id]
                                return (
                                    <ReorderList.Item
                                        key={id}
                                        value={id}
                                        label={name}
                                    >
                                        <Cell
                                            start={
                                                <InitialsAvatar
                                                    userId={id}
                                                    name={name}
                                                />
                                            }
                                            onClick={() =>
                                                snackbar.show({
                                                    title: `Opened ${name}`,
                                                })
                                            }
                                        >
                                            <Cell.Text
                                                title={name}
                                                description={balance}
                                                bold
                                            />
                                        </Cell>
                                    </ReorderList.Item>
                                )
                            })}
                        </ReorderList>
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default ReorderListShowcase
