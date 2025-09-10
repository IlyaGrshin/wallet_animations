import { useRef } from "react"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import { useState, useCallback, useEffect } from "react"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"
import NativePageTransition from "../../../components/NativePageTransition"

import Picker from "../../../components/Picker"
import Collapsible from "../../../components/Collapsible"
import Switch from "../../../components/Switch"
import Text from "../../../components/Text"

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

    const [shine, setShine] = useState(false)

    const handleShineChange = useCallback(
        (value) => {
            setShine(value)
            MainButton.setParams({ has_shine_effect: value })
        },
        [MainButton]
    )

    const toggleShine = useCallback(() => {
        setShine((prev) => {
            const next = !prev
            MainButton.setParams({ has_shine_effect: next })
            return next
        })
    }, [MainButton])

    useEffect(() => {
        const handleBack = () => {
            MainButton.hide()
            SecondaryButton.hide()
        }
        WebApp.onEvent("backButtonClicked", handleBack)
        return () => {
            WebApp.offEvent("backButtonClicked", handleBack)
            MainButton.hide()
            SecondaryButton.hide()
        }
    }, [])

    const colorInputRef = useRef(null)
    const textColorInputRef = useRef(null)
    const [buttonBgColor, setButtonBgColor] = useState(
        WebApp.themeParams.button_color
    )
    const [textColor, setTextColor] = useState(
        WebApp.themeParams.button_text_color
    )

    const handleColorClick = () => {
        colorInputRef.current.click()
    }
    const handleTextColorClick = () => {
        textColorInputRef.current.click()
    }

    const handleButtonBgColorChange = (event) => {
        let color = event.target.value.toUpperCase()
        setButtonBgColor(color)
        WebApp.MainButton.setParams({ color: color })
    }
    const handleTextColorChange = (event) => {
        let color = event.target.value.toUpperCase()
        setTextColor(color)
        WebApp.MainButton.setParams({ text_color: color })
    }

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
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
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
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </Cell>
                </SectionList.Item>
                <Collapsible open={!!label}>
                    <SectionList.Item header={"Main Button"}>
                        <Cell
                            onClick={handleColorClick}
                            end={
                                <Cell.Part
                                    type="ColorPicker"
                                    value={buttonBgColor}
                                    onChange={handleButtonBgColorChange}
                                    inputRef={colorInputRef}
                                    id="main-button-color"
                                />
                            }
                        >
                            Background Color
                        </Cell>
                        <Cell
                            onClick={handleTextColorClick}
                            end={
                                <Cell.Part
                                    type="ColorPicker"
                                    value={textColor}
                                    onChange={handleTextColorChange}
                                    inputRef={textColorInputRef}
                                    id="main-button-text-color"
                                />
                            }
                        >
                            Text Color
                        </Cell>
                        <Cell
                            onClick={toggleShine}
                            end={
                                <Switch
                                    value={shine}
                                    onChange={handleShineChange}
                                />
                            }
                        >
                            Shine Effect
                        </Cell>
                    </SectionList.Item>
                </Collapsible>
                <Collapsible open={!!labelSecondary}>
                    <SectionList.Item header={"Secondary Button"}>
                        <Cell
                            end={
                                <Cell.Part type="Picker">
                                    {position[pickerIndex]}
                                </Cell.Part>
                            }
                        >
                            <Cell.Text title="Button Position" />
                        </Cell>
                        <Picker
                            items={position}
                            onPickerIndex={handlePickerIndex}
                        />
                    </SectionList.Item>
                </Collapsible>
            </SectionList>
        </Page>
    )
}

export default BottomBar
