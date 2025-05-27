export function formatToTwoDecimals(number) {
    return Number(number.toFixed(2))
}

export function generateRandomBalance(max = 2000) {
    return (Math.random() * max).toFixed(2)
}

export function formatPercentage(percentage) {
    return `${percentage?.toFixed(2)}%`
}
