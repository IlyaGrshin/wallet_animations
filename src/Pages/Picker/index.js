import { useCallback, useState } from "react"

import * as styles from "./PickerPage.module.scss"

import SectionList from "../../components/SectionList"
import Picker from "../../components/Picker"
import Cell from "../../components/Cell"

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
    )
}

export default PickerPage
