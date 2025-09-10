import { useState, useEffect, useRef } from "react"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import Text from "../../../components/Text"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"
import NativePageTransition from "../../../components/NativePageTransition"

const NavigationBar = () => {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isVisibleBackButton, setBackButton] = useState(true)
    const [isSettingsButtonAvailable, setSettingsButtonAvailable] =
        useState(false)
    const [headerColor, setHeaderColor] = useState("#EFEFF4")
    const colorInputRef = useRef(null)

    useEffect(() => {
        let color = WebApp.themeParams.secondary_bg_color || "#EFEFF4"
        color = color.toUpperCase()
        setHeaderColor(color)
    }, [])

    const toggleFullscreen = () => {
        if (isFullscreen) {
            setIsFullscreen(false)
            WebApp.exitFullscreen()
        } else {
            setIsFullscreen(true)
            WebApp.requestFullscreen()
        }
    }

    const handleColorClick = () => {
        colorInputRef.current.click()
    }

    const handleColorChange = (event) => {
        let color = event.target.value.toUpperCase()
        setHeaderColor(color)
        WebApp.setHeaderColor(color)
    }

    const toggleBackButton = () => {
        if (isVisibleBackButton) {
            setBackButton(false)
            WebApp.BackButton.hide()
        } else {
            setBackButton(true)
            WebApp.BackButton.show()
        }
    }

    const toggleSettingsButton = () => {
        if (isSettingsButtonAvailable) {
            setSettingsButtonAvailable(false)
            WebApp.SettingsButton.hide()
        } else {
            setSettingsButtonAvailable(true)
            WebApp.SettingsButton.show()
        }
    }

    return (
        <Page>
            <NativePageTransition>
                <BackButton />
                <SectionList>
                    <SectionList.Item header="Navigation Bar">
                        <Cell
                            onClick={handleColorClick}
                            end={
                                <Cell.Part
                                    type="ColorPicker"
                                    value={headerColor}
                                    onChange={handleColorChange}
                                    inputRef={colorInputRef}
                                    id="header-color"
                                />
                            }
                        >
                            <Cell.Text title="Header Color" />
                        </Cell>
                        <Cell
                            end={<Cell.Part type="Chevron" />}
                            onClick={toggleBackButton}
                        >
                            <Cell.Text
                                title={
                                    isVisibleBackButton
                                        ? "Hide Back Button"
                                        : "Show Back Button"
                                }
                            />
                        </Cell>
                        <Cell
                            end={<Cell.Part type="Chevron" />}
                            onClick={toggleFullscreen}
                        >
                            <Cell.Text
                                title={
                                    isFullscreen
                                        ? "Exit Fullscreen"
                                        : "Enter Fullscreen"
                                }
                            />
                        </Cell>
                        <Cell end={<Cell.Part type="Chevron" />}>
                            <Cell.Text title="Expand WebView" />
                        </Cell>
                        <Cell
                            end={<Cell.Part type="Chevron" />}
                            onClick={toggleSettingsButton}
                        >
                            <Cell.Text
                                title={
                                    isSettingsButtonAvailable
                                        ? "Turn Off Settings"
                                        : "Turn On Settings"
                                }
                            />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
            </NativePageTransition>
        </Page>
    )
}

export default NavigationBar
