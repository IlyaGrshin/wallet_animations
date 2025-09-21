import { useState, useEffect, useRef, memo } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import * as styles from "./Wallet.module.scss"
import * as cellStyles from "../../../components/Cells/Cell.module.scss"

import { useApple } from "../../../hooks/DeviceProvider"

import Page from "../../../components/Page"
import Text from "../../../components/Text"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import ImageAvatar from "../../../components/ImageAvatar"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"
import { MultilineButton } from "../../../components/Button"

import { useAssetIcon } from "../../../utils/AssetsMap"
import {
    generateRandomBalance,
    formatToTwoDecimals,
} from "../../../utils/number"
import {
    DURATION,
    COMPLEX_EASING,
    TRANSITIONS,
} from "../../../utils/animations"
import assets from "./data/assets.json"
import txHistory from "./data/transactions.json"

import ArrowUpCircleFill from "../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../icons/28/Plus Circle Fill.svg?react"
import CreditCardFill28 from "../../../icons/28/Credit Card Fill.svg?react"

import HiddenEye from "../../../icons/avatars/HiddenEyeIcon.svg"
import WebApp from "@twa-dev/sdk"

function Balance() {
    const [balance, setBalance] = useState("30.06")
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
                Total Balance
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
    const transition = TRANSITIONS.MATERIAL_STANDARD

    const jettonsSize = useApple
        ? { position: "relative", width: "40px", height: "40px" }
        : {
              position: "relative",
              width: "42px",
              height: "42px",
              marginLeft: "-6px",
          }

    const jettonsMotion = useApple
        ? [
              {
                  src: useAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: "-6px" },
                      expanded: { scale: 1, opacity: 0, top: 0, left: 0 },
                  },
              },
              {
                  src: useAssetIcon("NOT"),
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
                  src: useAssetIcon("HMSTR"),
                  variants: {
                      collapsed: { scale: 0.6, top: "-6px", left: 0 },
                      expanded: { scale: 1, top: 0, left: "6px" },
                  },
              },
              {
                  src: useAssetIcon("NOT"),
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

    const HiddenEyeMotion = useApple
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
        <m.div onClick={onClick}>
            <div className={cellStyles.root}>
                <div className={cellStyles.start}>
                    <div className="assetIcon" style={jettonsSize}>
                        <m.div
                            className={cellStyles.image}
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
                        ></m.div>
                        {jettonsMotion.map((jetton, index) => (
                            <m.div
                                className={cellStyles.image}
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
                            ></m.div>
                        ))}
                    </div>
                </div>
                <div
                    className={cellStyles.body}
                    style={{ position: "relative" }}
                >
                    <m.div
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
                    </m.div>
                    <m.div
                        variants={variants.TextHideLowBalances}
                        transition={transition}
                        animate={state ? "expanded" : "collapsed"}
                        initial={false}
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
                    </m.div>
                </div>
            </div>
        </m.div>
    )
}

function Assets() {
    const AssetsRef = useRef(null)
    const [showSmallAssets, setShowSmallAssets] = useState(false)

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
                    start={<ImageAvatar src={useAssetIcon(asset.ticker)} />}
                    end={
                        <Cell.Text
                            title={`$${formatToTwoDecimals(asset.rate * asset.value)}`}
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
                    <AnimatePresence inherit={false}>
                        {showSmallAssets && (
                            <m.div
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
                                                src={useAssetIcon(asset.ticker)}
                                            />
                                        }
                                        end={
                                            <Cell.Text
                                                title={`$${formatToTwoDecimals(asset.rate * asset.value)}`}
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
                            </m.div>
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
            description="Section Description"
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

function ImagePlayground() {
    return (
        <SectionList.Item header="Image Playground">
            <div
                style={{
                    backgroundImage: "url(https://picsum.photos/1200/1200)",
                    width: "100%",
                    height: "400px",
                    backgroundSize: "cover",
                }}
            ></div>
        </SectionList.Item>
    )
}

function Spacer() {
    return <div className={styles.spacer}></div>
}

function Wallet() {
    return (
        <Page>
            <div className={styles.wallet}>
                <Balance />
                <ActionButtons />
                <Spacer />
                <SectionList>
                    <Assets />
                    <TransactionList />
                    <ImagePlayground />
                </SectionList>
            </div>
        </Page>
    )
}

export default memo(Wallet)
