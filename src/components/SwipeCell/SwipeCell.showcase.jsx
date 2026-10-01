import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Collapsible from "../Collapsible"
import InitialsAvatar from "../InitialsAvatar"
import SwipeCell from "../SwipeCell"
import { useSnackbar } from "../Snackbar"

import { BackButton } from "../../lib/twa"

import TrashIcon from "../../icons/24/Trash.svg?react"
import EllipsisIcon from "../../icons/24/Elipsis.svg?react"

const CONTACTS = [
    { id: 1, name: "Ilya Grishin", note: "Sent 12 TON" },
    { id: 2, name: "Alice Cooper", note: "Received $50.00" },
    { id: 3, name: "Thomas Andersson", note: "Sent 0.001 BTC" },
    { id: 4, name: "Maria Lopez", note: "Received 100 USDT" },
    { id: 5, name: "Kenji Sato", note: "Sent 3 TON" },
]

const SwipeCellShowcase = () => {
    const snackbar = useSnackbar()
    const [deleted, setDeleted] = useState(() => new Set())

    const remove = (id) => setDeleted((prev) => new Set(prev).add(id))

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item
                        header="Recent"
                        description="Swipe left for actions. Keep pulling to delete in one gesture."
                    >
                        {CONTACTS.map(({ id, name, note }) => (
                            <Collapsible key={id} open={!deleted.has(id)}>
                                <SwipeCell
                                    actions={[
                                        {
                                            key: "more",
                                            label: "More",
                                            icon: <EllipsisIcon />,
                                            color: "var(--tg-theme-subtitle-text-color)",
                                            onClick: () =>
                                                snackbar.show({
                                                    title: `More for ${name}`,
                                                }),
                                        },
                                        {
                                            key: "delete",
                                            label: "Delete",
                                            icon: <TrashIcon />,
                                            color: "var(--tg-theme-destructive-text-color)",
                                            destructive: true,
                                            onClick: () => remove(id),
                                        },
                                    ]}
                                >
                                    <Cell
                                        start={
                                            <InitialsAvatar
                                                userId={id}
                                                name={name}
                                            />
                                        }
                                    >
                                        <Cell.Text
                                            title={name}
                                            description={note}
                                            bold
                                        />
                                    </Cell>
                                </SwipeCell>
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

export default SwipeCellShowcase
