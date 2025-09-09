import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import TextField from "../../../components/TextField"
import { useState, useCallback } from "react"

import WebApp from "@twa-dev/sdk"
import NativePageTransition from "../../../components/NativePageTransition"

const MainButton = () => {
    const [label, setLabel] = useState("")
    const [label2, setLabel2] = useState("")

    const setMainButton = useCallback(() => {
        const btn = window?.Telegram?.WebApp?.MainButton
        if (!btn) return
        btn.setText(label || " ")
        btn.show()
    }, [label])

    return (
        <Page>
            <NativePageTransition />
            <SectionList title="Main Button">
                <SectionList.Item>
                    <Cell>
                        <Cell.Editable
                            label="Enter Label 1"
                            value={label}
                            onChange={setLabel}
                            onClear={() => setLabel("")}
                        />
                    </Cell>
                    <Cell>
                        <Cell.Editable
                            label="Enter Label 1"
                            value={label2}
                            onChange={setLabel2}
                            onClear={() => setLabel2("")}
                        />
                    </Cell>
                </SectionList.Item>
                <SectionList.Item>
                    <Cell end={<Cell.Part type="Picker">Vertical</Cell.Part>}>
                        <Cell.Text
                            type="Accent"
                            title="Change Button Position"
                        />
                    </Cell>
                </SectionList.Item>
                <SectionList.Item>
                    <Cell onClick={setMainButton}>
                        <Cell.Text type="Accent" title="Set Main Button Text" />
                    </Cell>
                </SectionList.Item>
            </SectionList>
        </Page>
    )
}

export default MainButton
