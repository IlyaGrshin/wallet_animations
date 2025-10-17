import * as styles from "./ActionButtons.module.scss"
import { MultilineButton } from "../../../../../components/Button"

import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../../../icons/28/Plus Circle Fill.svg?react"
import ArrowUpCircleFill28 from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"

export default function ActionButtons() {
    const buttons = [
        {
            icon: <ArrowUpCircleFill />,
            name: "Transfer",
        },
        {
            icon: <PlusCircleFill28 />,
            name: "Deposit",
        },
        {
            icon: <ArrowUpCircleFill28 />,
            name: "Withdraw",
        },
        {
            icon: <ArrowLiftAndRightCircleFill28 />,
            name: "Exchange",
        },
    ]

    return (
        <div className={styles.buttons}>
            {buttons.map((button, index) => (
                <MultilineButton
                    variant="tinted"
                    icon={button.icon}
                    label={button.name}
                    key={index}
                />
            ))}
        </div>
    )
}
