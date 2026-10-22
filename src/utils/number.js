const usdFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const amountFormat = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 6,
})

export function formatUsd(value) {
    const number = Number(value)
    if (number > 0 && number < 0.01) return "< $0.01"
    return `$${usdFormat.format(number)}`
}

export function formatAmount(value) {
    return amountFormat.format(Number(value))
}

export function formatBalance(value) {
    return usdFormat.format(Number(value))
}

export function generateRandomBalance(max = 2000) {
    return (Math.random() * max).toFixed(2)
}

export function formatPercentage(percentage) {
    return `${percentage?.toFixed(2)}%`
}

// Cents from $1, four significant digits below (micro-cap prices).
const CENTS_FORMAT = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})
const SIGNIFICANT_FORMAT = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
})

export function formatPrice(price) {
    if (typeof price !== "number") return price
    return (price >= 1 ? CENTS_FORMAT : SIGNIFICANT_FORMAT).format(price)
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
