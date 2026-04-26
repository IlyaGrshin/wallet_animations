import { rand } from "../../utils"

// Кривые ускорения для cruise-tween-ов.
const ACCEL_EASE = [0, 0, 0.3, 1]
const PULL_EASE = [0.2, 0, 0.4, 1]

// Профиль «классический перелёт + пружина»: барабан проскакивает цель на
// 10..50px и пружина возвращает его без ручной коррекции — самый частый и
// мягкий вариант.
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

// «Жёсткий перелёт-возврат»: проскок на 70..140px, потом доводка обратно
// к цели — даёт ощущение упругого, но контролируемого торможения.
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

// «Мягкий перелёт + пружина»: едва заметный проскок на 2..10px, далее
// пружина — ощущение «почти промахнулся», самый деликатный из перелётных
// вариантов.
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

// «Недолёт-пауза-перелёт-пружина»: барабан недотягивает 40..90px, на
// мгновение замирает, проскакивает на 6..18px и осаживается пружиной.
// Самый драматичный «вот-вот остановится» сценарий.
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

// Веса соответствуют исходным порогам (0.30 / 0.45 / 0.65 / 1.0) в
// прежней процедурной реализации.
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
