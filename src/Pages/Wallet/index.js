import React, { useState, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"

import * as styles from "./Wallet.module.scss"

import PageTransition from "../../Components/PageTransition"

import { apple } from "../../Components/DeviceProvider"
import Text from "../../Components/Text"
import SectionList from "../../Components/SectionList"
import Cell from "../../Components/Cell"
import NumberFlow from "@number-flow/react"
import { Spoiler } from "spoiled"
import { MultilineButton } from "../../Components/Button"

import { getAssetIcon } from "../../Components/AssetsMap"
import assets from "./data/assets.json"
import txHistory from "./data/transactions.json"

import { ReactComponent as ArrowUpCircleFill } from "../../Icons/28/Arrow Up Circle Fill.svg"
import { ReactComponent as ArrowLiftAndRightCircleFill28 } from "../../Icons/28/Arrow Left & Right Circle Fill.svg"
import { ReactComponent as PlusCircleFill28 } from "../../Icons/28/Plus Circle Fill.svg"
import { ReactComponent as CreditCardFill28 } from "../../Icons/28/Credit Card Fill.svg"

import HiddenEye from "../../Icons/Avatars/HiddenEyeIcon.svg"

import WebApp from "@twa-dev/sdk"

function Balance() {
    const [balance, setBalance] = useState("30.06")
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
        <div className={styles.balance}>
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
                Wallet Balance
            </Text>
            <Spoiler
                className={styles.amount}
                hidden={hidden}
                onClick={() => setHidden((s) => !s)}
            >
                <NumberFlow value={balance} prefix="$" />
            </Spoiler>
        </div>
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
                  src: getAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: "-6px" },
                      expanded: { scale: 1, opacity: 0, top: 0, left: 0 },
                  },
              },
              {
                  src: getAssetIcon("NOT"),
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
                  src: getAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: 0 },
                      expanded: { scale: 1, top: 0, left: "6px" },
                  },
              },
              {
                  src: getAssetIcon("NOT"),
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
                            initial={false}
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
                                initial={false}
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
    const AssetsRef = React.useRef(null)
    const [showSmallAssets, setShowSmallAssets] = useState(false)

    const formatNumbers = (number) => {
        return Number(number.toFixed(2))
    }

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
        <SectionList.Item ref={AssetsRef}>
            {largeAssets.map((asset, index) => (
                <Cell
                    start={
                        <Cell.Start
                            type="Image"
                            src={getAssetIcon(asset.ticker)}
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
                                className={styles.smallAssets}
                            >
                                {smallAssets.map((asset, index) => (
                                    <Cell
                                        start={
                                            <Cell.Start
                                                type="Image"
                                                src={getAssetIcon(asset.ticker)}
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
        if (WebApp.initData) {
            WebApp.setHeaderColor("secondary_bg_color")
            WebApp.setBackgroundColor("secondary_bg_color")
        } else {
            document.body.style.backgroundColor =
                "var(--tg-theme-secondary-bg-color)"
        }
    })

    return (
        <>
            <div className={styles.wallet}>
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
