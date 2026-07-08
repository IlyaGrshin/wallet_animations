// Minimal client for TradingView's public quote websocket — the same feed
// their charts and screener pages use. Messages ride a length-prefixed
// framing (`~m~<len>~m~<json>`); `~h~N` frames are heartbeats the server
// expects echoed back verbatim, or it drops the connection.
const ENDPOINT = "wss://data.tradingview.com/socket.io/websocket?from=screener"
const RECONNECT_DELAY = 3_000

const FRAME_SPLIT = /~m~\d+~m~/

const wrap = (payload) => `~m~${payload.length}~m~${payload}`

// Opens a quote session for `symbols` (e.g. "CRYPTO:BTCUSD") streaming the
// given `fields` (e.g. ["lp", "chp"]). `onTick(name, values)` fires per
// update with only the fields that changed. Reconnects itself until
// `close()` is called.
export const openQuoteStream = ({ symbols, fields, onTick }) => {
    let ws = null
    let reconnectTimer = null
    let closed = false

    const connect = () => {
        ws = new WebSocket(ENDPOINT)
        const send = (m, p) => ws.send(wrap(JSON.stringify({ m, p })))
        const session = `qs_${Math.random().toString(36).slice(2, 12)}`

        ws.onopen = () => {
            send("set_auth_token", ["unauthorized_user_token"])
            send("quote_create_session", [session])
            send("quote_set_fields", [session, ...fields])
            send("quote_add_symbols", [session, ...symbols])
        }

        ws.onmessage = (event) => {
            for (const part of String(event.data).split(FRAME_SPLIT)) {
                if (!part) continue
                if (part.startsWith("~h~")) {
                    ws.send(wrap(part))
                    continue
                }
                let message
                try {
                    message = JSON.parse(part)
                } catch {
                    continue // session banner and other non-JSON frames
                }
                if (message.m !== "qsd") continue
                const quote = message.p?.[1]
                if (quote?.s === "ok" && quote.v) onTick(quote.n, quote.v)
            }
        }

        ws.onclose = () => {
            if (closed) return
            reconnectTimer = setTimeout(connect, RECONNECT_DELAY)
        }

        // onclose fires afterwards and schedules the reconnect
        ws.onerror = () => ws.close()
    }

    connect()

    return {
        close: () => {
            closed = true
            clearTimeout(reconnectTimer)
            ws?.close()
        },
    }
}
