// US equity session of a tokenized stock, read off the New York clock:
// regular 9:30-16:00, extended 4:00-9:30 and 16:00-20:00 on weekdays,
// closed otherwise. Holidays are not modelled.
const NEW_YORK = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
})

export const MARKET_STATUS = {
    OPEN: "open",
    EXTENDED: "extended",
    CLOSED: "closed",
}

export default function getMarketStatus(date = new Date()) {
    const parts = Object.fromEntries(
        NEW_YORK.formatToParts(date).map(({ type, value }) => [type, value])
    )
    if (parts.weekday === "Sat" || parts.weekday === "Sun") {
        return MARKET_STATUS.CLOSED
    }

    const minutes = Number(parts.hour) * 60 + Number(parts.minute)
    if (minutes >= 9 * 60 + 30 && minutes < 16 * 60) return MARKET_STATUS.OPEN
    if (minutes >= 4 * 60 && minutes < 20 * 60) return MARKET_STATUS.EXTENDED
    return MARKET_STATUS.CLOSED
}
