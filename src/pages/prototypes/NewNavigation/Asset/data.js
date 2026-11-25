// Hand-written parts of the asset pages (Figma Trading Assets, "New Asset
// Page" 9037:46228): product copy and links for the assets the design
// covers, and what CoinGecko can't describe (stocks). Market figures and the
// rest of the copy come live (utils/assetProfile).
import { getAssetIcon } from "../../../../utils/AssetsMap"

import aliciaUrl from "../../../../images/rewards/alicia.jpg"
import bobUrl from "../../../../images/rewards/bob.jpg"

const gram = getAssetIcon("GRAM")

// Mock history for a held asset.
export const transactionsFor = (ticker) => [
    {
        id: "alicia",
        name: "Alicia Torreaux",
        avatar: aliciaUrl,
        date: "July 3 at 11:24",
        amount: `+20 ${ticker}`,
        status: "Received",
    },
    {
        id: "bob",
        name: "Bob",
        avatar: bobUrl,
        date: "July 2 at 17:34",
        amount: `25 ${ticker}`,
        status: "Sent",
    },
    {
        id: "card",
        name: "Buy with a Bank Card",
        icon: "card",
        date: "July 3 at 11:24",
        amount: `+50 ${ticker}`,
        status: "Received",
    },
]

// Keyed by upper-case ticker. `earn` is the staked part of a holding, shown
// next to the wallet balance.
export const CURATED = {
    TON: {
        name: "Toncoin",
        icon: gram,
        // TradingView lists Toncoin as Gram now.
        symbol: "CRYPTO:GRAMUSD",
        earn: { amount: 29.538, delta: 1.45, apy: "3.66%" },
        about: {
            text: "Toncoin is TON's native cryptocurrency and deeply integrated into the Telegram ecosystem.",
            bullets: [
                "Send to contacts instantly – without fees.",
                "Use for Telegram Premium, TON collectibles and more.",
            ],
        },
        links: [
            {
                title: "TON Community in Telegram",
                subtitle: "@toncoin",
                icon: gram,
                url: "https://t.me/toncoin",
            },
            {
                title: "ton.org",
                subtitle: "website",
                glyph: "@",
                url: "https://ton.org",
            },
        ],
    },
    USDT: {
        kind: "dollars",
        name: "Dollars",
        icon: getAssetIcon("USDT"),
        earn: { amount: 63.95, delta: 1.45, apy: "9%" },
        actions: ["Deposit", "Transfer"],
    },
    NVDAX: {
        kind: "stock",
        name: "Nvidia",
        ticker: "NVDAx",
        icon: getAssetIcon("NVDAX"),
        symbol: "NASDAQ:NVDA",
        about: {
            text: "Nvidia is building the AI-powered future – a more intelligent, automated, and efficient technological landscape driven by artificial intelligence. The company started in 1993 as a maker of graphics chips for games and today designs the accelerated computing platforms behind most of modern AI.",
            clamp: true,
        },
        actions: ["Buy"],
    },
    XRP: {
        restricted: true,
        actions: ["Buy"],
    },
}

// Tokenized stocks listed in Trade next to the coin catalog.
export const STOCKS = ["NVDAX"]
