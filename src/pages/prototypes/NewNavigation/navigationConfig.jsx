import { TRANSITIONS } from "../../../utils/animations"
import Wallet from "../Wallet"
import TONWallet from "../TS"
import Trading from "../Trading"
import History from "./History"
import Earn from "./Earn"
import Rewards, { HERO_COLOR } from "./Rewards"
import StockList from "./Asset/StockList"

import WalletIcon from "../../../icons/tabbar/Wallet.svg?react"
import TradeIcon from "../../../icons/tabbar/Chartline.svg?react"
import HistoryIcon from "../../../icons/tabbar/Clock.svg?react"

// `onOpenAsset(ticker)` pushes that asset's page over the tabs: Walt opens
// what the user holds, Trade the catalog.
export const getTabsConfig = (onOpenTonWallet, onOpenAsset) => ({
    wallet: [
        {
            label: "Walt",
            icon: <WalletIcon />,
            view: (
                <Wallet
                    onOpenTonWallet={onOpenTonWallet}
                    onOpenAsset={onOpenAsset}
                />
            ),
            lottieIcon: "wallet",
            activeSegment: [0, 50],
        },
        {
            label: "Trade",
            icon: <TradeIcon />,
            view: (
                <Trading onOpenAsset={onOpenAsset}>
                    <StockList onOpen={onOpenAsset} />
                </Trading>
            ),
            lottieIcon: "chartline",
            activeSegment: [0, 50],
        },
        {
            label: "Earn",
            view: <Earn />,
            lottieIcon: "bag",
            activeSegment: [0, 45],
        },
        {
            label: "Rewards",
            view: <Rewards />,
            // Opens on a blue hero: the search bar starts in its overlay look.
            heroColor: HERO_COLOR,
            lottieIcon: "reward",
            activeSegment: [0, 24],
        },
    ],
    ton: [
        {
            label: "TON Space",
            icon: <WalletIcon />,
            view: <TONWallet />,
            lottieIcon: "wallet",
        },
        {
            label: "Activity",
            icon: <HistoryIcon />,
            view: <History />,
            lottieIcon: "clock",
        },
        {
            label: "Browser",
            icon: <TradeIcon />,
            view: <Trading />,
            lottieIcon: "chartline",
        },
    ],
})

const measureAppleRestScale = () =>
    (window.innerHeight - 3.0 * window.devicePixelRatio) / window.innerHeight

let cachedAppleRestScale = measureAppleRestScale()
window.addEventListener("resize", () => {
    cachedAppleRestScale = measureAppleRestScale()
})

const appleRestScale = () => cachedAppleRestScale

const enterFrom = ({ isSegmentSwitch, direction, isApple }) => {
    if (isSegmentSwitch) return { opacity: 0, scale: 1.006, x: 0 }
    if (isApple) return { opacity: 0, scale: appleRestScale(), x: 0 }
    return { opacity: 0, x: `${-3 * direction}%`, scale: 1 }
}

export const pageVariants = {
    initial: enterFrom,
    animate: (custom) => {
        // A resumed layer starts from its current values (null keyframes);
        // otherwise the authored entrance pose, since a fully exited layer
        // still holds the opposite side's exit pose.
        const from = custom.resume
            ? { opacity: null, scale: null, x: null }
            : enterFrom(custom)
        const keyframes = {
            opacity: [from.opacity, 1],
            scale: [from.scale, 1],
            x: [from.x, 0],
        }

        if (custom.isSegmentSwitch) {
            return {
                ...keyframes,
                transition: { duration: 0.2, ease: "easeOut" },
            }
        }

        if (custom.isApple) {
            return {
                ...keyframes,
                transition: {
                    scale: { duration: 0.15, ease: [0.38, 0.7, 0.125, 1.0] },
                    opacity: { duration: 0.1, ease: "easeInOut" },
                },
            }
        }
        return { ...keyframes, transition: TRANSITIONS.MATERIAL_STANDARD }
    },
    exit: ({ isSegmentSwitch, direction, isApple }) => {
        if (isSegmentSwitch) {
            return {
                opacity: 0,
                scale: 1.01,
                x: 0,
                transition: { duration: 0.2, ease: "easeOut" },
            }
        }

        if (isApple) {
            return {
                opacity: 0,
                scale: appleRestScale(),
                x: 0,
                transition: {
                    scale: { duration: 0.15, ease: [0.38, 0.7, 0.125, 1.0] },
                    opacity: { duration: 0.1, ease: "easeInOut" },
                },
            }
        }
        return {
            opacity: 0,
            x: `${3 * direction}%`,
            scale: 1,
            transition: TRANSITIONS.MATERIAL_STANDARD,
        }
    },
}
