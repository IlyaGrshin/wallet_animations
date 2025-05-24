import { useState, useEffect, useRef, use } from "react"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import Text from "../../../components/Text"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"
import PageTransition from "../../../components/PageTransition"

const NavigationBar = () => {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isVisibleBackButton, setBackButton] = useState(true)
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

    return (
        <Page>
            <PageTransition>
                <BackButton />
                <SectionList>
                    <SectionList.Item header="Navigation Bar">
                        <Cell
                            onClick={handleColorClick}
                            end={
                                <Cell.Part type="ColorPicker">
                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={headerColor}
                                        onChange={handleColorChange}
                                        name="color"
                                        id="color"
                                    />
                                    <label htmlFor="color">
                                        <Text
                                            apple={{
                                                variant: "body",
                                                weight: "regular",
                                            }}
                                            material={{
                                                variant: "body1",
                                                weight: "regular",
                                            }}
                                        >
                                            {headerColor}
                                        </Text>
                                    </label>
                                </Cell.Part>
                            }
                        >
                            <Cell.Text title="Header Color" />
                        </Cell>
                        <Cell
                            end={<Cell.Part type="Chevron" />}
                            onClick={toggleBackButton}
                        >
                            <Cell.Text title="Change Back / Close Button" />
                        </Cell>
                        <Cell
                            end={<Cell.Part type="Chevron" />}
                            onClick={toggleFullscreen}
                        >
                            <Cell.Text title="Toggle Fullscreen" />
                        </Cell>
                        <Cell end={<Cell.Part type="Chevron" />}>
                            <Cell.Text title="Expand WebView" />
                        </Cell>
                        <Cell end={<Cell.Part type="Chevron" />}>
                            <Cell.Text title="Turn On Settings" />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
            </PageTransition>
        </Page>
    )
}

export default NavigationBar
