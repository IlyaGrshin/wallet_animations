import { useLocation } from "wouter"
import StoriesViewer from "../../../components/StoriesViewer"
import bg from "./assets/bg.jpg"

const defaults = {
    buttonText: "Continue",
    background: bg,
    headerColor: "#11141D",
}

const demoStories = [
    {
        ...defaults,
        id: "perpetual-futures",
        title: "Perpetual Futures",
        description:
            "Trade with leverage and earn as asset prices rise or fall.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_1_opt.json"),
        },
    },
    {
        ...defaults,
        id: "long-position",
        title: "Think the price will rise? Open a long position",
        description:
            "As the price increases, so does your potential profit.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_2_opt.json"),
        },
    },
    {
        ...defaults,
        id: "short-position",
        title: "Think the price will fall? Open a short position",
        description:
            "If the price falls, your potential profits will rise.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_3_opt.json"),
        },
    },
    {
        ...defaults,
        id: "trade-with-leverage",
        title: "Trade with leverage",
        description:
            "Leverage increases the size of your trades, so even small trades carry weight.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_4_opt.json"),
        },
    },
    {
        ...defaults,
        id: "liquidation",
        title: "Liquidation",
        description:
            "Higher leverage means higher risk. If the price goes in the other direction, you will lose the entire position.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_5_opt.json"),
        },
    },
    {
        ...defaults,
        id: "take-profit-stop-loss",
        title: "Take profit, stop loss",
        description:
            "Use the built-in automatic trade closing tool to control risks.",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_6_opt.json"),
        },
    },
    {
        ...defaults,
        id: "high-risk",
        title: "Please note: Perpetuals carry high risk",
        description:
            "You can lose your entire investment quickly due to leverage and market swings. Positions may be liquidated automatically. Pricing is affected by funding rates and liquidity. Market data provided by Lighter.",
        buttonText: "Start Trading",
        focalImage: {
            type: "lottie",
            src: () => import("./assets/Stories_7_opt.json"),
        },
    },
]

const Stories = () => {
    const [, navigate] = useLocation()

    return (
        <StoriesViewer
            stories={demoStories}
            onClose={() => navigate("/")}
            duration={5000}
        />
    )
}

export default Stories
