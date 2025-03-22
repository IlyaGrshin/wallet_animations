import { useEffect, useCallback, useState } from "react"

import * as styles from "./PickerPage.module.scss"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Picker from "../../../components/Picker"
import Cell from "../../../components/Cells"
import PageTransition from "../../../components/PageTransition"

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

    return (
        <>
            <BackButton />
            <Page>
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
            </Page>
        </>
    )
}

export default PickerPage
