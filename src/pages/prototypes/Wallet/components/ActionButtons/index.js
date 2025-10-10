import * as styles from "./ActionButtons.module.scss"
import { MultilineButton } from "../../../../../components/Button"

import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../../../icons/28/Plus Circle Fill.svg?react"
import CreditCardFill28 from "../../../../../icons/28/Credit Card Fill.svg?react"

export default function ActionButtons() {
    const buttons = [
        {
            icon: <ArrowUpCircleFill />,
            name: "Send",
        },
        {
            icon: <PlusCircleFill28 />,
            name: "Add Crypto",
        },
        {
            icon: <ArrowLiftAndRightCircleFill28 />,
            name: "Exchange",
        },
        {
            icon: <CreditCardFill28 />,
            name: "Sell",
        },
    ]

    return (
        <div className={styles.buttons}>
            {buttons.map((button, index) => (
                <MultilineButton
                    variant="plain"
                    icon={button.icon}
                    label={button.name}
                    key={index}
                />
            ))}
        </div>
    )
}
