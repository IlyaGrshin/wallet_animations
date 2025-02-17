import { useCallback, useState } from "react"

import * as styles from "./PickerPage.module.scss"

import SectionList from "../../Components/SectionList"
import Picker from "../../Components/Picker"
import Cell from "../../Components/Cell"
import PageTransition from "../../Components/PageTransition"

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
                    <Picker items={months} onPickerIndex={handlePickerIndex} />
                </SectionList.Item>
            </SectionList>
        </PageTransition>
    )
}

export default PickerPage
