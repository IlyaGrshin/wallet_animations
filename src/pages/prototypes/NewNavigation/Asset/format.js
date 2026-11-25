// Money on the asset pages, in USD. Formatters are built once: these run on
// every tick and every pan frame of the chart.
const MINUS = "−"

const fixed = (digits) =>
    new Intl.NumberFormat("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
const CENTS = fixed(2)
const MILLS = fixed(3)

// Quotes under 10 keep a third decimal: "2.165", "204.74".
export const formatScale = (price) => (price < 10 ? MILLS : CENTS).format(price)

export const formatPrice = (price) => `$${formatScale(price)}`

export const formatMoney = (usd) => `$${CENTS.format(Math.abs(usd))}`

// "+$0.82" / "−$0.17"
export const formatChange = (usd) =>
    `${usd < 0 ? MINUS : "+"}${formatMoney(usd)}`

export const formatPercent = (value) => `${CENTS.format(Math.abs(value))}%`
