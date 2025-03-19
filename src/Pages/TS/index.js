import React, { useEffect, useState } from "react"

import PageTransition from "../../components/PageTransition"

import Text from "../../components/Text"
import Cell from "../../components/Cells"
import SectionList from "../../components/SectionList"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"
import { useAssetIcon } from "../../utlis/AssetsMap"
import { MultilineButton } from "../../components/Button"

import { ReactComponent as ArrowUpCircleFill } from "../../icons/28/Arrow Up Circle Fill.svg"
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from "../../icons/28/Arrow Left & Right Circle Fill.svg"
import { ReactComponent as PlusCircleFill28 } from "../../icons/28/Plus Circle Fill.svg"

import WebApp from "@twa-dev/sdk"

import * as styles from "./TS.module.scss"
import * as ButtonStyles from "../../components/Button/MultilineButton/MultilineButton.module.scss"

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
                    <NumberFlow
                        value={balance}
                        prefix="$"
                        willChange
                        plugins={[continuous]}
                        spinTiming={{
                            duration: 850,
                            easing: "linear(0, 0.0013 0.5%, 0.0062 1.11%, 0.0233 2.21%, 0.0518 3.42%, 0.0951 4.82%, 0.1855 7.23%, 0.4176 12.76%, 0.525 15.47%, 0.6247, 0.7105 21.1%, 0.7844, 0.8439 26.92%, 0.8695 28.43%, 0.8934, 0.9139, 0.9314, 0.9463 34.86%, 0.9595 36.57%, 0.9709 38.37%, 0.9805 40.28%, 0.9884 42.29%, 0.9948 44.5%, 1.003 49.42%, 1.0057 53.34%, 1.0063 58.16%, 1.0014 80.77%, 1.0001 99.95%)",
                        }}
                        opacityTiming={{
                            duration: 200,
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
            start={<Cell.Start type="Image" src={useAssetIcon(asset.ticker)} />}
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
        </>
    )
}

export default React.memo(TONSpace)
