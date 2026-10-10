import { TON_DECIMALS } from "./constants"

const MAX_WHOLE_DIGITS = 9
const DIGIT_EM = 0.62
const COMMA_EM = 0.3
const FRACTION_RATIO = 2 / 3

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

const SINGLE_GROUP = /^[1-9]\d{0,2},\d{3}$/

function normalizePasted(raw) {
    const text = raw.replace(/[^\d.,]/g, "")
    const lastDot = text.lastIndexOf(".")
    const lastComma = text.lastIndexOf(",")
    if (lastDot >= 0 && lastComma >= 0) {
        const group = lastDot > lastComma ? "," : "."
        return text.split(group).join("").replace(/,/g, ".")
    }
    const separator = lastComma >= 0 ? "," : "."
    const parts = text.split(separator)
    const grouped = parts.length > 2 || SINGLE_GROUP.test(text)
    return parts.join(grouped ? "" : ".")
}

export function sanitize(raw, pasted = false) {
    const text = pasted ? normalizePasted(raw) : raw
    const digitsOnly = text.replace(/,/g, ".").replace(/[^\d.]/g, "")
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

export function amountEm(amount) {
    const { whole, fraction } = splitAmount(amount)
    const digits = whole.replace(/\D/g, "").length
    const commas = whole.length - digits
    return (
        digits * DIGIT_EM +
        commas * COMMA_EM +
        fraction.length * DIGIT_EM * FRACTION_RATIO
    )
}
