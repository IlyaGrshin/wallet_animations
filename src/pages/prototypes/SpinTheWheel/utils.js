import { PRIZE_TIERS, REWARD_TOKENS } from "./mockData"

const TOTAL_WEIGHT = PRIZE_TIERS.reduce((sum, tier) => sum + tier.weight, 0)

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
