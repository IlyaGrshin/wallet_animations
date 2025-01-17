import React, { useEffect, useState } from "react"

import PageTransition from "../../Components/PageTransition"

import Text from "../../Components/Text"
import Cell from "../../Components/Cell"
import SectionList from "../../Components/SectionList"
import NumberFlow from "@number-flow/react"
import { Spoiler } from "spoiled"
import { getAssetIcon } from "../../Components/AssetsMap"
import { MultilineButton } from "../../Components/Button"

import { ReactComponent as ArrowUpCircleFill } from "../../Icons/28/Arrow Up Circle Fill.svg"
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from "../../Icons/28/Arrow Left & Right Circle Fill.svg"
import { ReactComponent as PlusCircleFill28 } from "../../Icons/28/Plus Circle Fill.svg"

import WebApp from "@twa-dev/sdk"

import * as styles from "./TS.module.scss"
import * as ButtonStyles from "../../Components/Button/MultilineButton/MultilineButton.module.scss"

import assets from "./data/assets.json"
import activityItems from "./data/activity.json"

function Profile() {
    const [balance, setBalance] = useState("261.69")
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const updateBalance = () => {
            if (!hidden) {
                const randomBalance = (Math.random() * 2000).toFixed(2)
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
                    <NumberFlow value={balance} prefix="$" />
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
            start={<Cell.Start type="Image" src={getAssetIcon(asset.ticker)} />}
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
    useEffect(() => {
        if (WebApp.initData) {
            WebApp.setHeaderColor("#131314")
            WebApp.setBackgroundColor("#131314")
        } else {
            document.body.style.backgroundColor = "#131314"
        }
    })

    return (
        <>
            <div className="ton-space">
                <PageTransition>
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
                </PageTransition>
            </div>
        </>
    )
}

export default React.memo(TONSpace)
