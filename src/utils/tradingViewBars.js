import { openTradingViewSocket, sessionId } from "./tradingViewSocket"

const SERIES = "s1"

// `value` mirrors `close` so a line series can take the bars as they are.
const toBar = ({ v: [time, open, high, low, close] }) => ({
    time,
    open,
    high,
    low,
    close,
    value: close,
})

// Streams `count` bars of `resolution` ("5", "60", "1D", "1W"...) for `symbol`
// ("CRYPTO:GRAMUSD", "NASDAQ:NVDA"). `onBars(bars)` gets the full history
// once per (re)connect; `onUpdate(bar)` then carries the forming bar (same
// time = replace, newer = append). Reconnects itself until `close()`.
export const openBarStream = ({
    symbol,
    resolution,
    count,
    onBars,
    onUpdate,
}) =>
    openTradingViewSocket({
        from: "chart",
        onOpen: (send) => {
            const session = sessionId("cs")
            send("chart_create_session", [session, ""])
            send("resolve_symbol", [
                session,
                "sym_1",
                `=${JSON.stringify({ symbol, adjustment: "splits" })}`,
            ])
            send("create_series", [
                session,
                SERIES,
                SERIES,
                "sym_1",
                resolution,
                count,
                "",
            ])
        },
        onMessage: (message) => {
            const series = message.p?.[1]?.[SERIES]?.s
            if (message.m === "timescale_update" && series) {
                onBars(series.map(toBar))
            } else if (message.m === "du" && series?.length) {
                onUpdate(toBar(series.at(-1)))
            }
        },
    })
