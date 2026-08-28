import BalanceCard from "../../../Wallet/components/BalanceCard"
import * as balanceCardStyles from "../../../Wallet/components/BalanceCard/BalanceCard.module.scss"
import * as ButtonStyles from "../../../../../components/Button/MultilineButton/MultilineButton.module.scss"
import { MultilineButton } from "../../../../../components/Button"

import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../../../icons/28/Plus Circle Fill.svg?react"

export default function Profile() {
    return (
        <BalanceCard
            label="TON Wallet Balance"
            initialBalance="261.69"
            variant="overlay"
            actions={
                <>
                    <MultilineButton
                        variant="plain"
                        icon={<ArrowUpCircleFill />}
                        label="Send"
                        className={`${ButtonStyles.button} ${balanceCardStyles.overlayButton}`}
                    />
                    <MultilineButton
                        variant="plain"
                        icon={<PlusCircleFill28 />}
                        label="Deposit"
                        className={`${ButtonStyles.button} ${balanceCardStyles.overlayButton}`}
                    />
                    <MultilineButton
                        variant="plain"
                        icon={<ArrowLiftAndRightCircleFill28 />}
                        label="Swap"
                        className={`${ButtonStyles.button} ${balanceCardStyles.overlayButton}`}
                    />
                </>
            }
        />
    )
}
