import { TRANSITIONS } from "../../../utils/animations"
import Wallet from "../Wallet"
import TONWallet from "../TS"
import Trading from "../Trading"
import History from "../History"

import WalletIcon from "../../../icons/tabbar/Wallet.svg?react"
import TradeIcon from "../../../icons/tabbar/Chartline.svg?react"
import HistoryIcon from "../../../icons/tabbar/Clock.svg?react"

import lottieIconWallet from "../../../icons/lottie/wallet"
import lottieIconChartline from "../../../icons/lottie/chartline"
import lottieIconBag from "../../../icons/lottie/bag"
import lottieIconClock from "../../../icons/lottie/clock"

export const TABS_CONFIG = {
    wallet: [
        {
            label: "Wallet",
            icon: <WalletIcon />,
            view: <Wallet />,
            lottieIcon: lottieIconWallet,
            activeSegment: [0, 50],
        },
        {
            label: "Trade",
            icon: <TradeIcon />,
            view: <Trading />,
            lottieIcon: lottieIconChartline,
            activeSegment: [0, 50],
        },
        {
            label: "Earn",
            view: <Trading />,
            lottieIcon: lottieIconBag,
            activeSegment: [0, 45],
        },
        {
            label: "History",
            icon: <HistoryIcon />,
            view: <History />,
            lottieIcon: lottieIconClock,
            activeSegment: [0, 80],
        },
    ],
    ton: [
        {
            label: "TON Space",
            icon: <WalletIcon />,
            view: <TONWallet />,
            lottieIcon: lottieIconWallet,
        },
        {
            label: "Activity",
            icon: <HistoryIcon />,
            view: <History />,
            lottieIcon: lottieIconClock,
        },
        {
            label: "Browser",
            icon: <TradeIcon />,
            view: <Trading />,
            lottieIcon: lottieIconChartline,
        },
    ],
}

export const pageVariants = {
    initial: ({ isSegmentSwitch, direction, isApple }) => {
        if (isSegmentSwitch) return { opacity: 0, scale: 1.006, x: 0 }

        if (isApple) {
            return {
                opacity: 0,
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
                x: 0,
            }
        }
        return { opacity: 0, x: `${-3 * direction}%`, scale: 1 }
    },
    animate: ({ isSegmentSwitch, isApple }) => {
        if (isSegmentSwitch) {
            return {
                opacity: 1,
                scale: 1,
                x: 0,
                transition: { duration: 0.2, ease: "easeOut" },
            }
        }

        if (isApple) {
            return {
                opacity: 1,
                scale: 1,
                x: 0,
                transition: {
                    scale: { duration: 0.15, ease: [0.38, 0.7, 0.125, 1.0] },
                    opacity: { duration: 0.1, ease: "easeInOut" },
                },
            }
        }
        return {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: TRANSITIONS.MATERIAL_STANDARD,
        }
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
                scale:
                    (window.innerHeight - 3.0 * window.devicePixelRatio) /
                    window.innerHeight,
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
