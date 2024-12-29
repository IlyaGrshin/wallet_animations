import React, { useState, useEffect } from "react"
import { AnimatePresence, motion } from "motion/react"

import PageTransition from "../../Components/PageTransition"

import { apple } from "../../Components/DeviceProvider"
import Card from "../../Components/Card"
import Text from "../../Components/Text"
import SectionList from "../../Components/SectionList"
import Cell from "../../Components/Cell"
import Morph from "../../Components/Morph"
import { Spoiler } from "spoiled"

import "./index.css"

import { ReactComponent as ArrowUpCircleFill } from "../../Icons/28/Arrow Up Circle Fill.svg"
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from "../../Icons/28/Arrow Left & Right Circle Fill.svg"
import { ReactComponent as PlusCircleFill28 } from "../../Icons/28/Plus Circle Fill.svg"
import { ReactComponent as CreditCardFill28 } from "../../Icons/28/Credit Card Fill.svg"

import DollarsLogo from "../../Icons/Avatars/Dollars.svg"
import BitcoinLogo from "../../Icons/Avatars/Bitcoin.svg"
import ToncoinLogo from "../../Icons/Avatars/Toncoin.svg"
import NotcoinLogo from "../../Icons/Avatars/Notcoin.svg"
import MajorLogo from "../../Icons/Avatars/Major.svg"
import HamsterLogo from "../../Icons/Avatars/Hamster.webp"
import XEmpireLogo from "../../Icons/Avatars/XEmpire.svg"
import CatizenLogo from "../../Icons/Avatars/Catizen.webp"
import HiddenEye from "../../Icons/Avatars/HiddenEyeIcon.svg"

import WebApp from "@twa-dev/sdk"

function Balance() {
    const [balance, setBalance] = useState("$30.06")
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const updateBalance = () => {
            if (!hidden) {
                const randomBalance = "$" + (Math.random() * 2000).toFixed(2)
                setBalance(randomBalance)
            }
        }

        const interval = setInterval(updateBalance, 1000)

        return () => clearInterval(interval)
    }, [hidden])

    return (
        <Card className="balance">
            <Text
                apple={{
                    variant: "body",
                    weight: "regular",
                }}
                material={{
                    variant: "body1",
                    weight: "regular",
                }}
                className="label"
            >
                Wallet Balance
            </Text>
            <Spoiler
                className="amount"
                hidden={hidden}
                onClick={() => setHidden((s) => !s)}
            >
                <Morph>{balance}</Morph>
            </Spoiler>
        </Card>
    )
}

function ActionButtons() {
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
        <Card className="buttons">
            {buttons.map((button, index) => (
                <motion.div
                    className="button"
                    key={`button-${index}`}
                    whileTap={{ scale: 0.9 }}
                >
                    {button.icon}
                    <Text
                        apple={{
                            variant: "caption2",
                            weight: "medium",
                        }}
                        material={{
                            variant: "subtitle2",
                            weight: "medium",
                        }}
                    >
                        {button.name}
                    </Text>
                </motion.div>
            ))}
        </Card>
    )
}

function AnimatedCellMoreButton({ onClick, state }) {
    const transition = { ease: [0.26, 0.08, 0.25, 1], duration: 0.2 }

    const jettonsSize = apple
        ? { position: "relative", width: "40px", height: "40px" }
        : {
              position: "relative",
              width: "42px",
              height: "42px",
              marginLeft: "-6px",
          }

    const jettonsMotion = apple
        ? [
              {
                  src: HamsterLogo,
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: "-6px" },
                      expanded: { scale: 1, opacity: 0, top: 0, left: 0 },
                  },
              },
              {
                  src: NotcoinLogo,
                  variants: {
                      collapsed: {
                          scale: 0.6,
                          opacity: 1,
                          top: "6px",
                          left: "6px",
                      },
                      expanded: { scale: 0, opacity: 0, top: 0, left: 0 },
                  },
              },
          ]
        : [
              {
                  src: HamsterLogo,
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: 0 },
                      expanded: { scale: 1, top: 0, left: "6px" },
                  },
              },
              {
                  src: NotcoinLogo,
                  variants: {
                      collapsed: {
                          scale: 0.6,
                          opacity: 1,
                          top: "6px",
                          left: "12px",
                      },
                      expanded: { scale: 0, opacity: 0, top: 0, left: "18px" },
                  },
              },
          ]

    const HiddenEyeMotion = apple
        ? {
              variants: {
                  collapsed: {
                      scale: 0.6,
                      opacity: 0,
                      top: "-6px",
                      left: "-6px",
                  },
                  expanded: { scale: 1, opacity: 1, top: 0, left: 0 },
              },
          }
        : {
              variants: {
                  collapsed: { scale: 0.6, opacity: 0, top: "-6px", left: 0 },
                  expanded: { scale: 1, opacity: 1, top: 0, left: "6px" },
              },
          }

    const variants = {
        TextMoreAssets: {
            collapsed: { opacity: 1, top: "calc(50% - 11px)" },
            expanded: { opacity: 0, top: "calc(50% - 20px)" },
        },
        TextHideLowBalances: {
            collapsed: { opacity: 0, top: "calc(50% - 20px)" },
            expanded: { opacity: 1, top: "calc(50% - 11px)" },
        },
    }

    return (
        <motion.div onClick={onClick}>
            <div className="Cell">
                <div className="start">
                    <div className="assetIcon" style={jettonsSize}>
                        <motion.div
                            className="image"
                            variants={HiddenEyeMotion.variants}
                            transition={transition}
                            animate={state ? "expanded" : "collapsed"}
                            style={{
                                backgroundImage: `url(${HiddenEye})`,
                                position: "absolute",
                                zIndex: 3,
                            }}
                            key={`stack-asset-3`}
                        ></motion.div>
                        {jettonsMotion.map((jetton, index) => (
                            <motion.div
                                className="image"
                                variants={jetton.variants}
                                transition={transition}
                                animate={state ? "expanded" : "collapsed"}
                                style={{
                                    backgroundImage: `url(${jetton.src})`,
                                    position: "absolute",
                                    zIndex: 2 - index,
                                }}
                                key={`stack-asset-${index}`}
                            ></motion.div>
                        ))}
                    </div>
                </div>
                <div className="body" style={{ position: "relative" }}>
                    <motion.div
                        variants={variants.TextMoreAssets}
                        transition={transition}
                        animate={state ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "medium" }}
                            material={{ variant: "body1", weight: "medium" }}
                        >
                            More Assets
                        </Text>
                    </motion.div>
                    <motion.div
                        variants={variants.TextHideLowBalances}
                        transition={transition}
                        animate={state ? "expanded" : "collapsed"}
                        style={{
                            transformOrigin: "0% 50%",
                            position: "absolute",
                        }}
                    >
                        <Text
                            apple={{ variant: "body", weight: "medium" }}
                            material={{ variant: "body1", weight: "medium" }}
                        >
                            Hide Low Balances
                        </Text>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

function Assets() {
    const [showSmallAssets, setShowSmallAssets] = useState(false)

    const formatNumbers = (number) => {
        return Number(number.toFixed(2))
    }

    const assets = [
        {
            id: 0,
            name: "Dollars",
            image: DollarsLogo,
            ticker: "USDT",
            value: "25",
            rate: "1.00",
            delta: "+0%",
        },
        {
            id: 1,
            name: "Toncoin",
            image: ToncoinLogo,
            ticker: "TON",
            value: "5.061",
            rate: "5.26",
            delta: "-3.61%",
        },
        {
            id: 2,
            name: "Bitcoin",
            image: BitcoinLogo,
            ticker: "BTC",
            value: "0",
            rate: "97614.03",
            delta: "-3.53%",
        },
        {
            id: 3,
            name: "Notcoin",
            image: NotcoinLogo,
            ticker: "NOT",
            value: "0.00633",
            rate: "0.000523",
            delta: "-10.66%",
        },
        {
            id: 4,
            name: "Major",
            image: MajorLogo,
            ticker: "MAJOR",
            value: "5",
            rate: "0.582",
            delta: "-7.56%",
        },
        {
            id: 5,
            name: "Hamster Kombar",
            image: HamsterLogo,
            ticker: "HMSTR",
            value: "52.182",
            rate: "0.00255",
            delta: "-9.95%",
        },
        {
            id: 6,
            name: "X Empire",
            image: XEmpireLogo,
            ticker: "X",
            value: "0",
            rate: "0.0001573",
            delta: "-11.5%",
        },
        {
            id: 7,
            name: "Catizen",
            image: CatizenLogo,
            ticker: "CATI",
            value: "0",
            rate: "0.374",
            delta: "-7.15%",
        },
    ]

    const priorityAssets = assets.filter(
        (asset) => asset.id === 0 || asset.id === 1
    )
    const otherAssets = assets.filter(
        (asset) => asset.id !== 0 && asset.id !== 1
    )

    const largeAssets = [
        ...priorityAssets,
        ...otherAssets
            .filter((asset) => asset.rate * asset.value >= 1)
            .sort((a, b) => b.rate * b.value - a.rate * a.value),
    ]

    const smallAssets = [
        ...otherAssets
            .filter((asset) => asset.rate * asset.value < 1)
            .sort((a, b) => b.rate * b.value - a.rate * a.value),
    ]

    return (
        <SectionList.Item>
            {largeAssets.map((asset, index) => (
                <Cell
                    start={<Cell.Start type="Image" src={asset.image} />}
                    end={
                        <Cell.Text
                            title={`$${formatNumbers(asset.rate * asset.value)}`}
                            description={`${asset.value} ${asset.ticker}`}
                        />
                    }
                    key={`asset-${index}`}
                >
                    <Cell.Text
                        title={asset.name}
                        description={`$${asset.rate}`}
                        bold
                    />
                </Cell>
            ))}

            {smallAssets.length > 0 && (
                <>
                    <AnimatePresence>
                        {showSmallAssets && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, scale: 0.97 }}
                                animate={{
                                    height: "auto",
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{ height: 0, opacity: 0, scale: 0.97 }}
                                transition={{
                                    duration: 0.25,
                                    ease: [0.26, 0.08, 0.25, 1],
                                }}
                                className="smallAssets"
                            >
                                {smallAssets.map((asset, index) => (
                                    <Cell
                                        start={
                                            <Cell.Start
                                                type="Image"
                                                src={asset.image}
                                            />
                                        }
                                        end={
                                            <Cell.Text
                                                title={`$${formatNumbers(asset.rate * asset.value)}`}
                                                description={`${asset.value} ${asset.ticker}`}
                                            />
                                        }
                                        key={`asset-${index}`}
                                    >
                                        <Cell.Text
                                            title={asset.name}
                                            description={`$${asset.rate}`}
                                            bold
                                        />
                                    </Cell>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatedCellMoreButton
                        state={showSmallAssets}
                        onClick={() =>
                            setShowSmallAssets((s) => {
                                WebApp.HapticFeedback.selectionChanged()
                                return !s
                            })
                        }
                    />
                </>
            )}
        </SectionList.Item>
    )
}

function TransactionList() {
    const txHistory = [
        {
            name: "Alicia Torreaux",
            date: "July 3 at 11:24",
            value: "+200 TON",
            status: "Received",
        },
        {
            name: "Bob",
            date: "July 3 at 11:24",
            value: "25 TON",
            status: "Sent",
        },
        {
            name: "Purchased",
            date: "July 3 at 11:24",
            value: "100 TON",
            status: "Received",
        },
        {
            name: "Ilya G",
            date: "July 3 at 11:24",
            value: "5 TON",
            status: "Sent",
        },
    ]

    return (
        <SectionList.Item
            header="Transaction History"
            footer="Section Description"
        >
            {txHistory.map((tx, index) => (
                <Cell
                    start={<Cell.Start type="Icon" />}
                    end={<Cell.Text title={tx.value} description={tx.status} />}
                    key={`tx-${index}`}
                >
                    <Cell.Text title={tx.name} description={tx.date} bold />
                </Cell>
            ))}
        </SectionList.Item>
    )
}

function Wallet() {
    useEffect(() => {
        WebApp.setHeaderColor("secondary_bg_color")
        WebApp.setBackgroundColor("secondary_bg_color")
    })

    return (
        <>
            <div className="wallet">
                <PageTransition>
                    <Balance />
                    <ActionButtons />
                    <SectionList>
                        <Assets />
                        <TransactionList />
                    </SectionList>
                </PageTransition>
            </div>
        </>
    )
}

export default React.memo(Wallet)
