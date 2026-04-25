import AMZNx from "@icons/coins/AMZNx.png"
import GOOGLx from "@icons/coins/GOOGLx.png"
import KOx from "@icons/coins/KOx.png"
import LITx from "@icons/coins/LITx.png"
import MCDx from "@icons/coins/MCDx.png"
import METAx from "@icons/coins/METAx.png"
import MON from "@icons/coins/MON.png"
import MSFTx from "@icons/coins/MSFTx.png"
import NFLx from "@icons/coins/NFLx.png"
import NVDAx from "@icons/coins/NVDAx.png"
import SOLx from "@icons/coins/SOLx.png"
import TONx from "@icons/coins/TONx.png"
import USDT from "@icons/coins/USDT.png"

export const SPIN_COST = 50

export const PHASE = {
    IDLE: "idle",
    SPINNING: "spinning",
    RESULT: "result",
}
export const PHASE_VALUES = Object.values(PHASE)

export const REWARD_TOKENS = [
    { ticker: "TONx", image: TONx },
    { ticker: "USDT", image: USDT },
    { ticker: "SOLx", image: SOLx },
    { ticker: "MSFTx", image: MSFTx },
    { ticker: "AMZNx", image: AMZNx },
    { ticker: "GOOGLx", image: GOOGLx },
    { ticker: "METAx", image: METAx },
    { ticker: "NVDAx", image: NVDAx },
    { ticker: "NFLx", image: NFLx },
    { ticker: "MCDx", image: MCDx },
    { ticker: "KOx", image: KOx },
    { ticker: "LITx", image: LITx },
    { ticker: "MON", image: MON },
]

export const PRIZE_TIERS = [
    { amount: 0.5, weight: 28 },
    { amount: 1, weight: 24 },
    { amount: 2, weight: 18 },
    { amount: 3, weight: 12 },
    { amount: 5, weight: 9 },
    { amount: 7.5, weight: 6 },
    { amount: 10, weight: 3 },
]

export const POINTS_BALANCE = 7400
