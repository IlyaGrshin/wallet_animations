import { rand } from "../../utils"

// Easing curves for cruise tweens.
const ACCEL_EASE = [0, 0, 0.3, 1]
const PULL_EASE = [0.2, 0, 0.4, 1]

// "Classic overshoot + spring": the drum overshoots the target by 10..50px
// and a spring brings it back without a manual correction — the most
// common and gentle profile.
function buildOvershootSpring({ direction }) {
    return [
        {
            kind: "tween",
            offset: direction * rand(10, 50),
            durationFraction: rand(0.55, 0.7),
            ease: ACCEL_EASE,
        },
        {
            kind: "spring",
            offset: 0,
            spring: { stiffness: rand(220, 360), damping: rand(14, 22) },
        },
    ]
}

// "Hard overshoot + return": overshoot by 70..140px, then pull back to
// target — feels like a firm but controlled braking.
function buildOvershootHard({ direction }) {
    return [
        {
            kind: "tween",
            offset: direction * rand(70, 140),
            durationFraction: rand(0.45, 0.55),
            ease: ACCEL_EASE,
        },
        {
            kind: "tween",
            offset: 0,
            durationFraction: rand(0.22, 0.32),
            ease: PULL_EASE,
        },
    ]
}

// "Soft overshoot + spring": a barely visible 2..10px overshoot, then a
// spring — feels like "almost missed", the most delicate of the overshoot
// variants.
function buildOvershootSoft({ direction }) {
    return [
        {
            kind: "tween",
            offset: direction * rand(2, 10),
            durationFraction: rand(0.5, 0.7),
            ease: ACCEL_EASE,
        },
        {
            kind: "spring",
            offset: 0,
            spring: { stiffness: rand(320, 440), damping: rand(22, 32) },
        },
    ]
}

// "Undershoot + pause + overshoot + spring": the drum undershoots by
// 40..90px, freezes for a beat, then overshoots by 6..18px before a
// spring settles it. The most dramatic "about to stop" profile.
function buildBackoffPunch({ direction }) {
    const undershoot = -direction * rand(40, 90)
    const overshoot = direction * rand(6, 18)
    return [
        {
            kind: "tween",
            offset: undershoot,
            durationFraction: rand(0.45, 0.55),
            ease: ACCEL_EASE,
        },
        {
            kind: "wait",
            offset: undershoot,
            durationFraction: rand(0.04, 0.08),
        },
        {
            kind: "tween",
            offset: overshoot,
            durationFraction: rand(0.16, 0.24),
            ease: PULL_EASE,
        },
        {
            kind: "spring",
            offset: 0,
            spring: { stiffness: 320, damping: 22 },
        },
    ]
}

// Weights mirror the original thresholds (0.30 / 0.45 / 0.65 / 1.0) from
// the previous procedural implementation.
const PROFILES = [
    { weight: 30, build: buildOvershootHard },
    { weight: 15, build: buildOvershootSoft },
    { weight: 20, build: buildBackoffPunch },
    { weight: 35, build: buildOvershootSpring },
]

const TOTAL_WEIGHT = PROFILES.reduce((sum, p) => sum + p.weight, 0)

export function pickCruiseProfile({ direction }) {
    let roll = Math.random() * TOTAL_WEIGHT
    for (const p of PROFILES) {
        roll -= p.weight
        if (roll <= 0) return p.build({ direction })
    }
    return PROFILES[PROFILES.length - 1].build({ direction })
}
