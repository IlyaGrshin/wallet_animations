import { useState } from "react"
import PropTypes from "prop-types"

import Text from "../../../../components/Text"
import Train from "../../../../components/Train"
import ImageAvatar from "../../../../components/ImageAvatar"
import PriceChart from "../../../../components/PriceChart"
import Tappable from "../../../../components/Tappable"
import usePriceHistory, {
    CANDLE_INTERVALS,
    PRICE_RANGES,
} from "../../../../hooks/usePriceHistory"
import Readout, { readout } from "./Readout"
import ChartControls from "./ChartControls"
import { formatScale } from "./format"

import * as styles from "./Hero.module.scss"

// The two chart views and the periods each one offers.
const VIEWS = {
    line: PRICE_RANGES,
    candles: CANDLE_INTERVALS,
}

const DEFAULT_PERIOD = { line: "1D", candles: "1H" }

// Hero card: logo and status chip, name, live price with its change over the
// picked period, the chart (line or candles) and its controls.
export default function Hero({ page, chip, titleRef }) {
    const [view, setView] = useState("line")
    const [periods, setPeriods] = useState(DEFAULT_PERIOD)
    const [scrubbed, setScrubbed] = useState(null)
    // What was on screen when the series was switched: it stays up while the
    // next one loads, the chart dimmed and the figures grey, instead of
    // dropping to a skeleton.
    const [held, setHeld] = useState(null)
    const spec = VIEWS[view][periods[view]]
    const fresh = usePriceHistory(page.symbol, spec)

    const shown = fresh ? { bars: fresh, view, caption: spec.caption } : held
    const pending = !fresh && held !== null
    const candles = shown?.view === "candles"
    const data = readout(shown?.bars, {
        scrubbed,
        candles,
        caption: shown?.caption,
    })

    const switchTo = (nextView, nextPeriods) => {
        if (shown) setHeld(shown)
        setView(nextView)
        setPeriods(nextPeriods)
        setScrubbed(null)
    }

    return (
        <div className={styles.root}>
            <div className={styles.top}>
                <ImageAvatar src={page.icon} size={48} />
                {chip}
            </div>
            <Train ref={titleRef} className={styles.name}>
                <Text
                    apple={{ variant: "callout", weight: "semibold" }}
                    material={{ variant: "callout", weight: "medium" }}
                >
                    {page.name}
                </Text>
                <span className={styles.caption}>
                    <Text
                        apple={{ variant: "callout", weight: "regular" }}
                        material={{ variant: "callout", weight: "regular" }}
                    >
                        {page.ticker}
                    </Text>
                </span>
            </Train>
            <Readout data={data} pending={pending} />
            <PriceChart
                className={styles.chart}
                bars={shown?.bars ?? null}
                type={candles ? "candles" : "line"}
                pending={pending}
                formatPrice={formatScale}
                onScrub={setScrubbed}
            />
            <ChartControls
                periods={Object.keys(VIEWS[view])}
                period={periods[view]}
                onPeriodChange={(period) =>
                    switchTo(view, { ...periods, [view]: period })
                }
                candles={view === "candles"}
                onCandlesChange={(on) =>
                    switchTo(on ? "candles" : "line", periods)
                }
            />
            {page.kind === "stock" && (
                <Tappable
                    as="button"
                    type="button"
                    mode="opacity"
                    className={styles.note}
                >
                    <Text
                        as="span"
                        apple={{ variant: "footnote", weight: "regular" }}
                        material={{ variant: "footnote", weight: "regular" }}
                    >
                        This asset is a
                    </Text>
                    <span className={styles.link}>
                        <Text
                            as="span"
                            apple={{
                                variant: "footnote",
                                weight: "regular",
                                chevron: true,
                            }}
                            material={{
                                variant: "footnote",
                                weight: "regular",
                            }}
                        >
                            tokenized stock
                        </Text>
                    </span>
                </Tappable>
            )}
        </div>
    )
}

Hero.propTypes = {
    page: PropTypes.shape({
        kind: PropTypes.string,
        name: PropTypes.string.isRequired,
        ticker: PropTypes.string.isRequired,
        icon: PropTypes.string,
        symbol: PropTypes.string.isRequired,
    }).isRequired,
    chip: PropTypes.node,
    // Set on the name row, for the pinned bar's title handover.
    titleRef: PropTypes.shape({ current: PropTypes.any }),
}
