import { PRIZE_TIERS, REWARD_TOKENS } from "./mockData"

const TOTAL_WEIGHT = PRIZE_TIERS.reduce((sum, tier) => sum + tier.weight, 0)
const imagePreloadCache = new Map()

export const forceGpuTransform = (_latest, generated) =>
    generated ? `${generated} translateZ(0)` : "translateZ(0)"

export function pickPrizeAmount() {
    let roll = Math.random() * TOTAL_WEIGHT
    for (const tier of PRIZE_TIERS) {
        roll -= tier.weight
        if (roll <= 0) return tier.amount
    }
    return PRIZE_TIERS[0].amount
}

export function pickToken() {
    return REWARD_TOKENS[Math.floor(Math.random() * REWARD_TOKENS.length)]
}

export function pickReward() {
    return { token: pickToken(), amount: pickPrizeAmount() }
}

export function preloadRewardImages() {
    if (typeof Image === "undefined") return

    for (const { image } of REWARD_TOKENS) {
        if (imagePreloadCache.has(image)) continue

        const img = new Image()
        img.decoding = "async"
        img.src = image
        const decode =
            typeof img.decode === "function"
                ? img.decode().catch(() => undefined)
                : Promise.resolve()
        imagePreloadCache.set(image, { img, decode })
    }
}

let nextId = 1
export function buildItems(length) {
    return Array.from({ length }, () => ({
        id: nextId++,
        ...pickReward(),
    }))
}

export function formatPrice(amount) {
    return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`
}
