import { TON_DECIMALS } from "./constants"

const MAX_WHOLE_DIGITS = 9

export const GRAM = "gram"
export const USD = "usd"

export const other = (currency) => (currency === GRAM ? USD : GRAM)

const wholeFmt = new Intl.NumberFormat("en-US")

const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

const exactFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: TON_DECIMALS,
})

export const format = (value) => moneyFmt.format(value)

export const formatExact = (value) => exactFmt.format(value)

export const toEntry = (value) => value.toFixed(2)

export function sanitize(raw) {
    const digitsOnly = raw.replace(/,/g, ".").replace(/[^\d.]/g, "")
    const [rawWhole, ...rest] = digitsOnly.split(".")
    const whole = rawWhole.slice(0, MAX_WHOLE_DIGITS)
    if (rest.length === 0) return whole
    return `${whole}.${rest.join("").slice(0, TON_DECIMALS)}`
}

export function splitAmount(amount) {
    const [whole, fraction] = amount.split(".")
    return {
        whole: wholeFmt.format(Number(whole || 0)),
        fraction: amount.includes(".") ? `.${fraction}` : "",
    }
}
