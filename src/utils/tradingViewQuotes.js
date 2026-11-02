import { openTradingViewSocket, sessionId } from "./tradingViewSocket"

// Streams `fields` (e.g. ["lp", "chp"]) for `symbols` ("CRYPTO:BTCUSD");
// `onTick(name, values)` carries only the fields that changed. Reconnects
// itself until `close()`.
export const openQuoteStream = ({ symbols, fields, onTick }) =>
    openTradingViewSocket({
        from: "screener",
        onOpen: (send) => {
            const session = sessionId("qs")
            send("quote_create_session", [session])
            send("quote_set_fields", [session, ...fields])
            send("quote_add_symbols", [session, ...symbols])
        },
        onMessage: (message) => {
            if (message.m !== "qsd") return
            const quote = message.p?.[1]
            if (quote?.s === "ok" && quote.v) onTick(quote.n, quote.v)
        },
    })
