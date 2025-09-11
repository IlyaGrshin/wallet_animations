import { useEffect, useState, memo } from "react"

import Page from "../../../components/Page"
import Text from "../../../components/Text"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import SectionList from "../../../components/SectionList"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"
import { useAssetIcon } from "../../../utils/AssetsMap"
import { generateRandomBalance } from "../../../utils/number"
import { DURATION, COMPLEX_EASING } from "../../../utils/animations"
import { MultilineButton } from "../../../components/Button"

import ArrowUpCircleFill from "../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../icons/28/Plus Circle Fill.svg?react"

import WebApp from "@twa-dev/sdk"

import * as styles from "./TS.module.scss"
import * as ButtonStyles from "../../../components/Button/MultilineButton/MultilineButton.module.scss"

import assets from "./data/assets.json"
import activityItems from "./data/activity.json"

function Profile() {
    const [balance, setBalance] = useState("261.69")
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const updateBalance = () => {
            if (!hidden) {
                const randomBalance = generateRandomBalance()
                setBalance(randomBalance)
            }
        }

        const interval = setInterval(updateBalance, 1000)

        return () => clearInterval(interval)
    }, [hidden])

    return (
        <div className={styles.profile}>
            <div className={styles.data}>
                <Text
                    apple={{
                        variant: "body",
                        weight: "regular",
                    }}
                    material={{
                        variant: "body1",
                        weight: "regular",
                    }}
                    className={styles.label}
                >
                    TON Space Balance
                </Text>
                <Spoiler
                    className={styles.amount}
                    hidden={hidden}
                    onClick={() => setHidden((s) => !s)}
                >
                    <NumberFlow
                        value={balance}
                        prefix="$"
                        willChange
                        plugins={[continuous]}
                        spinTiming={{
                            duration: DURATION.BALANCE_ANIMATION,
                            easing: COMPLEX_EASING,
                        }}
                        opacityTiming={{
                            duration: DURATION.OPACITY,
                        }}
                    />
                </Spoiler>
            </div>
            <div className={styles.buttons}>
                <MultilineButton
                    variant="plain"
                    icon={<ArrowUpCircleFill />}
                    label="Send"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
                <MultilineButton
                    variant="plain"
                    icon={<PlusCircleFill28 />}
                    label="Deposit"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
                <MultilineButton
                    variant="plain"
                    icon={<ArrowLiftAndRightCircleFill28 />}
                    label="Swap"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
            </div>
        </div>
    )
}

function Assets() {
    return assets.map((asset, index) => (
        <Cell
            start={<ImageAvatar src={useAssetIcon(asset.ticker)} />}
            end={<Cell.Text title={asset.value} />}
            key={`tx-${index}`}
        >
            <Cell.Text title={asset.name} description={asset.price} bold />
        </Cell>
    ))
}

function Staking() {
    const assets = [
        {
            name: "Staking",
            subtitle: "APY up to 4.50%",
        },
    ]

    return assets.map((asset, index) => (
        <Cell
            start={<Cell.Start type="Icon" />}
            end={<Cell.Part type="Chevron" />}
            key={`tx-${index}`}
        >
            <Cell.Text title={asset.name} description={asset.subtitle} bold />
        </Cell>
    ))
}

function Collectibles() {
    return (
        <div className={styles.placeholder}>
            <Text
                apple={{
                    variant: "body",
                }}
                material={{
                    variant: "body1",
                }}
            >
                As you get collectibles, they will appear here.
            </Text>
        </div>
    )
}

function Activity() {
    return (
        <>
            {activityItems.map((item, index) => (
                <Cell
                    start={<Cell.Start type="Icon" />}
                    end={
                        <Cell.Text
                            title={item.amount}
                            description={item.time}
                        />
                    }
                    key={`tx-${index}`}
                >
                    <Cell.Text
                        title={item.name}
                        description={item.address}
                        bold
                    />
                </Cell>
            ))}
            <Cell end={<Cell.Part type="Chevron" />}>
                <Cell.Text title="Show All" />
            </Cell>
        </>
    )
}

function FAQ() {
    const questions = [
        "What is Wallet Earn? How does it work?",
        "How are rewards assigned? Can I withdraw them early?",
        "Can I withdraw only a part of my USDT from Wallet Earn and continue to use it?",
    ]

    return (
        <>
            {questions.map((question, index) => (
                <Cell end={<Cell.Part type="Chevron" />} key={`tx-${index}`}>
                    <Cell.Text title={question} />
                </Cell>
            ))}
            <Cell>
                <Cell.Text type="Accent" title="Learn More" />
            </Cell>
        </>
    )
}

function TONSpace() {
    return (
        <Page headerColor="131314" backgroundColor="131314">
            <div className="ton-space">
                <Profile />
                <SectionList>
                    <SectionList.Item header="Assets">
                        <Assets />
                    </SectionList.Item>
                    <SectionList.Item>
                        <Staking />
                    </SectionList.Item>
                    <SectionList.Item header="Collectibles">
                        <Collectibles />
                    </SectionList.Item>
                    <SectionList.Item header="Activity">
                        <Activity />
                    </SectionList.Item>
                    <SectionList.Item>
                        <FAQ />
                    </SectionList.Item>
                </SectionList>
            </div>
        </Page>
    )
}

export default memo(TONSpace)
