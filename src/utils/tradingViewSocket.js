// Minimal client for TradingView's public websocket. Messages ride a
// length-prefixed framing (`~m~<len>~m~<json>`); `~h~N` heartbeats must be
// echoed back verbatim or the server drops the connection.
const ENDPOINT = "wss://data.tradingview.com/socket.io/websocket"
const RECONNECT_DELAY = 3_000

const FRAME_SPLIT = /~m~\d+~m~/

const wrap = (payload) => `~m~${payload.length}~m~${payload}`

/**
 * Opens an anonymous session and keeps it up until `close()`.
 * @param {string} props.from Client hint TradingView expects ("chart", "screener").
 * @param {(send: (method: string, params: Array) => void) => void} props.onOpen
 * Runs on every (re)connect, after auth: create sessions and subscribe here.
 * @param {(message: {m: string, p: Array}) => void} props.onMessage JSON messages.
 */
export const openTradingViewSocket = ({ from, onOpen, onMessage }) => {
    let ws = null
    let reconnectTimer = null
    let closed = false

    const connect = () => {
        ws = new WebSocket(`${ENDPOINT}?from=${from}`)
        const send = (m, p) => ws.send(wrap(JSON.stringify({ m, p })))

        ws.onopen = () => {
            send("set_auth_token", ["unauthorized_user_token"])
            onOpen(send)
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
                onMessage(message)
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

export const sessionId = (prefix) =>
    `${prefix}_${Math.random().toString(36).slice(2, 12)}`
