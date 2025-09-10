import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import { useState, useCallback } from "react"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"
import NativePageTransition from "../../../components/NativePageTransition"

import Picker from "../../../components/Picker"

const BottomBar = () => {
    const [label, setLabel] = useState("")
    const [labelSecondary, setLabelSecondary] = useState("")

    const MainButton = WebApp.MainButton
    const SecondaryButton = WebApp.SecondaryButton

    const setMainButton = useCallback((buttonLabel) => {
        setLabel(buttonLabel)
        if (buttonLabel) {
            MainButton.setText(buttonLabel)
            MainButton.show()
        } else {
            MainButton.hide()
        }
    }, [])

    const setSecondaryButton = useCallback((buttonLabel) => {
        setLabelSecondary(buttonLabel)
        if (buttonLabel) {
            SecondaryButton.setText(buttonLabel)
            SecondaryButton.show()
        } else {
            SecondaryButton.hide()
        }
    }, [])

    const [pickerIndex, setPickerValue] = useState(0)

    const position = ["Left", "Top", "Right", "Bottom"]

    const handlePickerIndex = useCallback((page) => {
        SecondaryButton.position = position[page].toLowerCase()
        setPickerValue(page)
    }, [])

    return (
        <Page>
            <BackButton />
            <NativePageTransition />
            <SectionList title="Main Button">
                <SectionList.Item>
                    <Cell>
                        <Cell.Editable
                            label="Main Button Label"
                            value={label}
                            onChange={setMainButton}
                            onClear={() => {
                                setLabel("")
                                WebApp.MainButton.hide()
                            }}
                            autoFocus
                        />
                    </Cell>
                    <Cell>
                        <Cell.Editable
                            label="Secondary Button Label"
                            value={labelSecondary}
                            onChange={setSecondaryButton}
                            onClear={() => {
                                setLabelSecondary("")
                                WebApp.SecondaryButton.hide()
                            }}
                        />
                    </Cell>
                </SectionList.Item>
                {labelSecondary && (
                    <SectionList.Item>
                        <Cell
                            end={
                                <Cell.Part type="Picker">
                                    {position[pickerIndex]}
                                </Cell.Part>
                            }
                        >
                            <Cell.Text title="Secondary Button Position" />
                        </Cell>
                        <Picker
                            items={position}
                            onPickerIndex={handlePickerIndex}
                        />
                    </SectionList.Item>
                )}
            </SectionList>
        </Page>
    )
}

export default BottomBar
