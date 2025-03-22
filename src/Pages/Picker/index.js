import { useEffect, useCallback, useState } from "react"

import * as styles from "./PickerPage.module.scss"

import SectionList from "../../components/SectionList"
import Picker from "../../components/Picker"
import Cell from "../../components/Cells"
import PageTransition from "../../components/PageTransition"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

const PickerPage = () => {
    const [pickerIndex, setPickerValue] = useState(0)

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const handlePickerIndex = useCallback((page) => {
        setPickerValue(page)
    }, [])

    useEffect(() => {
        if (WebApp.initData) {
            const handleBackButton = () => {
                WebApp.setHeaderColor("secondary_bg_color")
                WebApp.setBackgroundColor("secondary_bg_color")
            }

            WebApp.onEvent("backButtonClicked", handleBackButton)

            return () => {
                WebApp.offEvent("backButtonClicked", handleBackButton)
            }
        } else {
            document.body.style.backgroundColor =
                "var(--tg-theme-secondary-bg-color)"
        }
    }, [])

    return (
        <>
            <BackButton />
            <PageTransition>
                <SectionList>
                    <SectionList.Item>
                        <Cell
                            end={
                                <Cell.Part type="Picker">
                                    {months[pickerIndex]}
                                </Cell.Part>
                            }
                        >
                            <Cell.Text title="Picker" />
                        </Cell>
                        <Picker
                            items={months}
                            onPickerIndex={handlePickerIndex}
                        />
                    </SectionList.Item>
                </SectionList>
            </PageTransition>
        </>
    )
}

export default PickerPage
