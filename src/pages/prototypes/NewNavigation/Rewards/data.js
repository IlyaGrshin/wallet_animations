// Mock Rewards state (Figma Walt 2030, 491:21921).

import perps from "../../../../images/rewards/Perps.svg"
import gold from "../../../../images/rewards/Gold.svg"
import pie from "../../../../images/rewards/Pie.svg"
import invite from "../../../../images/rewards/Invite.svg"
import gift1 from "../../../../images/rewards/Gift1.svg"
import gift2 from "../../../../images/rewards/Gift2.svg"
import gift3 from "../../../../images/rewards/Gift3.svg"
import samuel from "../../../../images/rewards/samuel.jpg"
import alicia from "../../../../images/rewards/alicia.jpg"
import bob from "../../../../images/rewards/bob.jpg"

export const POINTS = "3,567"

// The Buy Gold boost runs out 18:36:14 after the prototype loads; fixed at
// module load so leaving and reopening the tab doesn't restart the clock.
const GOLD_BOOST_ENDS_AT = Date.now() + (18 * 3600 + 36 * 60 + 14) * 1000

export const SQUAD = {
    name: "Wolf Street",
    avatar: samuel,
    place: "1000+",
}

export const QUALIFY = {
    endsIn: "Ends in 29 days",
    title: "Help your squad qualify",
    description: "Earn 10,000 points together to enter the prize pool.",
    points: "0",
    goal: "10K to qualify",
    members: [alicia, bob, samuel],
}

// Ways to earn. `icon` sits on a 15% tint of `tint`; `reward` uses the GRAM
// diamond when `gram` is set; `was` is a crossed-out old rate.
export const WAYS_TO_EARN = [
    {
        id: "perps",
        title: "Trade Perpetuals",
        icon: perps,
        tint: "#29c2a8",
        badge: { label: "5×", tone: "accent" },
        reward: "+50",
        was: "+10",
        rate: "for every $50 in volume",
    },
    {
        id: "gold",
        title: "Buy Gold",
        icon: gold,
        tint: "#fbd45e",
        badge: { endsAt: GOLD_BOOST_ENDS_AT, tone: "destructive" },
        reward: "+50",
        rate: "per every $50 volume",
    },
    {
        id: "exchange",
        title: "Exchange Assets",
        icon: pie,
        tint: "#aa6fff",
        reward: "+10",
        gram: true,
        rate: "per every $50 volume",
    },
    {
        id: "invite",
        title: "Invite Friends",
        icon: invite,
        tint: "#fb696c",
        reward: "+5%",
        gram: true,
        rate: "of the points friends earn",
    },
]

export const GIFTS = [
    { id: "sapphire", name: "Sapphire Box", image: gift1, price: "50" },
    { id: "topaz", name: "Topaz Box", image: gift2, price: "150" },
    { id: "ruby", name: "Ruby Box", image: gift3, price: "250" },
]

export const FAQ = [
    "How do I earn points?",
    "How do squads work?",
    "What happens when the season ends?",
]
