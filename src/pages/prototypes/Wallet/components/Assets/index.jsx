import { useState, useRef } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import WebApp from "../../../../../lib/twa"

import * as styles from "./Assets.module.scss"
import SectionList from "../../../../../components/SectionList"
import Cell from "../../../../../components/Cells"
import AnimatedCellMoreButton from "../AnimatedCellMoreButton"
import AssetCell from "../AssetCell"
import assets from "../../data/assets.json"

const PRIORITY_TICKERS = ["USDT", "TON"]

export default function Assets() {
    const AssetsRef = useRef(null)
    const [showSmallAssets, setShowSmallAssets] = useState(false)

    const priorityAssets = assets.filter((asset) =>
        PRIORITY_TICKERS.includes(asset.ticker)
    )
    const otherAssets = assets.filter(
        (asset) => !PRIORITY_TICKERS.includes(asset.ticker)
    )

    const largeAssets = [
        ...priorityAssets,
        ...otherAssets
            .values()
            .filter((asset) => asset.rate * asset.value >= 1)
            .toArray()
            .toSorted((a, b) => b.rate * b.value - a.rate * a.value),
    ]

    const smallAssets = otherAssets
        .values()
        .filter((asset) => asset.rate * asset.value < 1)
        .toArray()
        .toSorted((a, b) => b.rate * b.value - a.rate * a.value)

    return (
        <SectionList.Item ref={AssetsRef}>
            {largeAssets.length === 0 && (
                <Cell>
                    <Cell.Text
                        title="No assets yet"
                        description="Deposit crypto to get started"
                        bold
                    />
                </Cell>
            )}
            {largeAssets.map((asset) => (
                <AssetCell asset={asset} key={asset.ticker} />
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
                                {smallAssets.map((asset) => (
                                    <AssetCell
                                        asset={asset}
                                        key={asset.ticker}
                                    />
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
