// Port of DiamondAnimation.swift: rotation physics, entrance timing, the facet light sweep and the
// surface sparkle timeline. Reference (Lottie comparison) mode is not ported.

import { REFERENCE_PITCH } from "./geometry.js"

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))
const smooth = (x) => {
    const t = clamp(x, 0, 1)
    return t * t * (3 - 2 * t)
}
const mix = (a, b, t) => a + (b - a) * t
const mix4 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

/** Cubic-bezier easing (CSS/After Effects style) with control points `out` and `into`. */
export function easing(progress, out, into) {
    const x = clamp(progress, 0, 1)
    if (x === 0 || x === 1) return x
    let low = 0,
        high = 1
    for (let i = 0; i < 18; i++) {
        const t = (low + high) * 0.5,
            s = 1 - t
        const bx = 3 * s * s * t * out[0] + 3 * s * t * t * into[0] + t * t * t
        if (bx < x) low = t
        else high = t
    }
    const t = (low + high) * 0.5,
        s = 1 - t
    return 3 * s * s * t * out[1] + 3 * s * t * t * into[1] + t * t * t
}

export const Appearance = { blue: 0, white: 1, cool: 2 }

// MARK: - Entrance timing

export const Entrance = {
    spinBoost: 12.6,
    spinDecay: 0.95 / 1.4,
    steadyStarCount: 240,
    burstStarCount: 144,
    extraAngle(time) {
        return (
            this.spinBoost *
            this.spinDecay *
            (1 - Math.exp(-Math.max(0, time) / this.spinDecay))
        )
    },
    angularTravel(start, end, speed) {
        if (speed === 0) return 0
        return (
            speed * Math.max(0, end - start) +
            Math.sign(speed) * (this.extraAngle(end) - this.extraAngle(start))
        )
    },
    highlightTime(time, entrance) {
        const t = Math.max(0, time)
        return entrance
            ? t + 4 * this.spinDecay * (1 - Math.exp(-t / this.spinDecay))
            : t
    },
    particleTime(time, entrance) {
        const t = Math.max(0, time)
        return entrance ? t + 2.2 * (1 - Math.exp(-t)) : t
    },
}

export const STAR_BURST_LIFETIME = 6.4

// MARK: - Motion

const PITCH_LIMIT = 1.1
const SPRING_FREQUENCY = 3 * 2 * Math.PI
const SPRING_DAMPING = 0.8
const TAP_UNLOCK_SPEED_MULTIPLIER = 1.4
const HELD_SPIN_DECAY = 0.15

class TapRotation {
    constructor(velocity, boost, decayTime, responseTime, isFast) {
        Object.assign(this, {
            velocity,
            boost,
            decayTime,
            responseTime,
            isFast,
        })
    }
    step(dt, speed) {
        const previous = this.velocity
        this.boost *= Math.exp(-dt / this.decayTime)
        const target = speed + this.boost
        this.velocity +=
            (target - this.velocity) * (1 - Math.exp(-dt / this.responseTime))
        if (
            Math.abs(this.boost) < 0.001 &&
            Math.abs(this.velocity - speed) < 0.001
        ) {
            this.boost = 0
            this.velocity = speed
        }
        return (previous + this.velocity) * 0.5 * dt
    }
}

/** Yaw/pitch springs, automatic rotation, drags, taps and release spin. Times in seconds. */
export class DiamondMotion {
    constructor() {
        this.yaw = 0
        this.pitch = REFERENCE_PITCH
        this.isDragging = false
        this.zoom = 1
        this.targetYaw = 0
        this.targetPitch = REFERENCE_PITCH
        this.rawPitchOffset = 0
        this.yawSpringVelocity = 0
        this.pitchSpringVelocity = 0
        this.yawVelocity = 0
        this.tilt = 0
        this.releaseDecay = 0
        this.releaseTilt = 0
        this.spinVelocity = 0
        this.spinDecay = 0.7
        this.lastDragTime = 0
        this.timeSinceRelease = 10
        this.tapRotation = null
        this.entranceInterrupted = false
        /** Extra spin when the current touch began, so quick taps can build on it. */
        this.spinAtPress = 0
    }

    clone() {
        const copy = Object.assign(new DiamondMotion(), this)
        if (this.tapRotation)
            copy.tapRotation = Object.assign(
                new TapRotation(),
                this.tapRotation
            )
        return copy
    }

    tap(direction, speed, mode, time) {
        if (this.isDragging) return null
        const unlock = Math.abs(speed) * TAP_UNLOCK_SPEED_MULTIPLIER
        let burst
        const tr = this.tapRotation
        if (tr) {
            const remainingBoost = Math.max(
                Math.abs(tr.boost),
                Math.abs(tr.velocity - speed)
            )
            const fastSpinSpeed = Math.max(
                Math.abs(tr.velocity),
                Math.abs(speed + tr.boost)
            )
            if (tr.isFast && fastSpinSpeed > unlock) return null
            burst = !tr.isFast && remainingBoost > 0.12
        } else {
            if (
                mode === "entrance" &&
                !this.entranceInterrupted &&
                speed !== 0
            ) {
                const remainingBoost =
                    Entrance.spinBoost *
                    Math.exp(-Math.max(0, time) / Entrance.spinDecay)
                if (Math.abs(speed) + remainingBoost > unlock) return null
            }
            burst = false
        }
        const interval = 1 / 120
        const current = tr
            ? tr.velocity
            : (this.automaticTravel(time, time + interval, speed, mode) /
                  interval) *
              Math.min(this.timeSinceRelease / 0.75, 1)
        this.startRotation(direction, current + this.yawVelocity, burst)
        return burst
    }

    /** Shifts the rotation without touching its momentum, e.g. to follow device tilt. */
    offsetYaw(angle) {
        this.yaw += angle
        this.targetYaw += angle
    }

    setSpin(velocity, decay) {
        if (this.isDragging) return
        this.tapRotation = null
        this.spinVelocity = velocity
        this.spinDecay = Math.max(decay, 0.05)
    }

    spin(velocity, decay) {
        this.spinVelocity += velocity
        this.spinDecay = Math.max(decay, 0.05)
    }

    fling(direction) {
        if (this.isDragging) return
        const current = this.yawSpringVelocity
        this.targetYaw = this.yaw
        this.yawSpringVelocity = 0
        this.startRotation(direction, current, true)
    }

    startRotation(direction, velocity, isFast) {
        this.tapRotation = new TapRotation(
            velocity,
            direction * (isFast ? Entrance.spinBoost : 3.36),
            isFast ? Entrance.spinDecay : 0.85,
            isFast ? 0.08 : 0.16,
            isFast
        )
        this.entranceInterrupted = true
        this.yawVelocity = 0
        this.timeSinceRelease = 0.75
    }

    begin(time) {
        this.isDragging = true
        this.tapRotation = null
        this.targetYaw = this.yaw
        this.targetPitch = this.pitch
        const offset = clamp(
            this.pitch - REFERENCE_PITCH,
            -PITCH_LIMIT + 0.001,
            PITCH_LIMIT - 0.001
        )
        this.rawPitchOffset = offset / (1 - Math.abs(offset) / PITCH_LIMIT)
        this.yawSpringVelocity = 0
        this.pitchSpringVelocity = 0
        this.yawVelocity = 0
        // The finger brakes the spin quickly instead of stopping it dead, so taps don't stutter.
        this.spinAtPress = this.spinVelocity
        this.spinDecay = HELD_SPIN_DECAY
        this.lastDragTime = time
    }

    /** dx/dy in CSS pixels; `scale` is the smaller side of the view. */
    drag(dx, dy, scale, time) {
        if (!this.isDragging) return
        const sensitivity = Math.PI / Math.max(scale, 100)
        const deltaYaw = dx * sensitivity
        this.targetYaw += deltaYaw
        this.rawPitchOffset += dy * sensitivity
        this.targetPitch =
            REFERENCE_PITCH +
            this.rawPitchOffset /
                (1 + Math.abs(this.rawPitchOffset) / PITCH_LIMIT)
        const dt = clamp(time - this.lastDragTime, 1 / 240, 0.1)
        this.yawVelocity = clamp(deltaYaw / dt, -5, 5)
        this.lastDragTime = time
    }

    end(time, { cancelled = false, releaseVelocity = null } = {}) {
        this.isDragging = false
        this.timeSinceRelease = 0
        this.targetPitch = REFERENCE_PITCH
        if (!cancelled) {
            this.pitchSpringVelocity -= this.releaseTilt
            if (this.releaseDecay > 0 && time - this.lastDragTime <= 0.12) {
                this.spinVelocity += releaseVelocity ?? this.yawVelocity
                this.spinDecay = Math.max(this.releaseDecay, 0.05)
                this.yawVelocity = 0
            }
        }
        if (cancelled || time - this.lastDragTime > 0.12) this.yawVelocity = 0
        if (cancelled) {
            this.targetYaw = this.yaw
            this.yawSpringVelocity = 0
            this.pitchSpringVelocity = 0
        }
    }

    step(dt, speed, reduceMotion, mode = "continuous", time = 0) {
        dt = clamp(dt, 0, 0.05)
        if (reduceMotion) {
            this.tapRotation = null
            if (this.isDragging) {
                this.yaw = this.targetYaw
                this.pitch = this.targetPitch
            } else {
                this.targetYaw = this.yaw
                this.pitch = REFERENCE_PITCH
                this.targetPitch = this.pitch
            }
            this.yawSpringVelocity =
                this.pitchSpringVelocity =
                this.yawVelocity =
                this.spinVelocity =
                    0
            return
        }
        let remaining = dt
        while (remaining > 0) {
            const step = Math.min(remaining, 1 / 120)
            const stepTime = Math.max(0, time - remaining + step)
            if (this.spinVelocity !== 0) {
                const fade = Math.exp(-step / this.spinDecay)
                const travel = this.spinVelocity * this.spinDecay * (1 - fade)
                this.spinVelocity *= fade
                if (Math.abs(this.spinVelocity) < 0.002) this.spinVelocity = 0
                this.targetYaw += travel
                this.yaw += travel
            }
            if (!this.isDragging) {
                this.timeSinceRelease += step
                const decay = Math.exp(-4.2 * step)
                this.targetYaw += (this.yawVelocity * (1 - decay)) / 4.2
                this.yawVelocity *= decay
                const automatic = this.tapRotation
                    ? this.tapRotation.step(step, speed)
                    : this.automaticTravel(
                          Math.max(0, stepTime - step),
                          stepTime,
                          speed,
                          mode
                      )
                const travel =
                    automatic * Math.min(this.timeSinceRelease / 0.75, 1)
                this.targetYaw += travel
                this.yaw += travel
                this.targetPitch = REFERENCE_PITCH + this.tilt
            }
            const stiffness = SPRING_FREQUENCY * SPRING_FREQUENCY
            const damping = 2 * SPRING_DAMPING * SPRING_FREQUENCY
            this.yawSpringVelocity +=
                ((this.targetYaw - this.yaw) * stiffness -
                    damping * this.yawSpringVelocity) *
                step
            this.pitchSpringVelocity +=
                ((this.targetPitch - this.pitch) * stiffness -
                    damping * this.pitchSpringVelocity) *
                step
            this.yaw += this.yawSpringVelocity * step
            this.pitch += this.pitchSpringVelocity * step
            remaining = Math.max(0, remaining - step)
        }
        const fullTurns = Math.trunc(this.yaw / (2 * Math.PI))
        this.yaw -= fullTurns * 2 * Math.PI
        this.targetYaw -= fullTurns * 2 * Math.PI
        if (
            !this.isDragging &&
            this.tilt === 0 &&
            Math.abs(this.pitch - REFERENCE_PITCH) < 0.0001 &&
            Math.abs(this.pitchSpringVelocity) < 0.0001
        ) {
            this.pitch = REFERENCE_PITCH
            this.pitchSpringVelocity = 0
        }
    }

    automaticTravel(start, end, speed, mode) {
        if (mode === "entrance" && !this.entranceInterrupted)
            return Entrance.angularTravel(start, end, speed)
        return speed * (end - start)
    }
}

// MARK: - Facet lighting

function lightEasing(x) {
    if (x === 0 || x === 1) return x
    let low = 0,
        high = 1
    for (let i = 0; i < 16; i++) {
        const t = (low + high) * 0.5,
            s = 1 - t
        const bx = 1.5 * s * s * t + 1.5 * s * t * t + t * t * t
        if (bx < x) low = t
        else high = t
    }
    const t = (low + high) * 0.5
    return t * t * (3 - 2 * t)
}

function facetSweep(frame, times) {
    const a = [-115.8, 40.3, -279.3, 240.6]
    const b = [317, -341.9, 188, -131.9]
    for (let i = 1; i < times.length; i++) {
        if (frame < times[i]) {
            const t = easing(
                (frame - times[i - 1]) / (times[i] - times[i - 1]),
                [0.333, 0],
                [0.667, 1]
            )
            return i % 2 === 1 ? mix4(a, b, t) : mix4(b, a, t)
        }
    }
    return times.length % 2 === 0 ? b : a
}

/** Authored crown/pavilion gradients and light sweeps, on a 3-second (180-frame) loop. */
export function lightState(time) {
    const frame = Math.max(0, time * 60) % 180
    const sweepFrame = Math.max(0, time * 60 * 0.5) % 180
    const times = [0, 39, 99, 179]
    const crown = [
        [-53.8, 112.9, 50.5, -54.2],
        [12, 53.4, 143.3, -112.9],
        [-126.9, 168.8, 190.3, -192.8],
        [-53.8, 112.9, 50.5, -54.2],
    ]
    const pavilion = [
        [-53.8, 80.7, 10.8, -165.2],
        [-34.2, 23.1, 104.6, -191],
        [-147.9, 125.5, -9.9, -106.1],
        [-53.8, 80.7, 10.8, -165.2],
    ]
    const sweep = [-0.05, 0.84, -0.88, -0.05]
    const segment = frame < 39 ? 0 : frame < 99 ? 1 : 2
    const t = lightEasing(
        clamp(
            (frame - times[segment]) / (times[segment + 1] - times[segment]),
            0,
            1
        )
    )
    let transmission
    if (frame < 25) transmission = (0.45 * frame) / 25
    else if (frame < 142) transmission = 0.45
    else transmission = 0.45 * Math.max(0, (166 - frame) / 24)
    return {
        crown: mix4(crown[segment], crown[segment + 1], t),
        pavilion: mix4(pavilion[segment], pavilion[segment + 1], t),
        sweep: [
            mix(sweep[segment], sweep[segment + 1], t),
            (frame / 180) * 2 * Math.PI,
            transmission,
            0,
        ],
        crownSweep: facetSweep(sweepFrame, [11, 49, 127, 179]),
        rightCrownSweep: facetSweep(sweepFrame, [6, 44, 88]),
        leftCrownSweep: facetSweep(sweepFrame, [0, 38, 118, 167]),
        pavilionSweep: facetSweep(sweepFrame, [0, 38, 103, 163]),
        rightPavilionSweep: facetSweep(sweepFrame, [5, 43, 92]),
        leftPavilionSweep: facetSweep(sweepFrame, [0, 38, 112, 168]),
    }
}

// MARK: - Surface sparkles

const key = (frame, value, out = [0.333, 0], into = [0.667, 1]) => ({
    frame,
    value,
    out,
    into,
})
function sampleKeys(keys, frame) {
    if (frame <= keys[0].frame) return keys[0].value
    for (let i = 1; i < keys.length; i++) {
        if (frame < keys[i].frame) {
            const a = keys[i - 1],
                b = keys[i]
            return (
                a.value +
                (b.value - a.value) *
                    easing(
                        (frame - a.frame) / (b.frame - a.frame),
                        a.out,
                        a.into
                    )
            )
        }
    }
    return keys[keys.length - 1].value
}

// Generated from the white Lottie reference.
const WHITE_MAIN_SCALE = [
    key(0, 1, [0.333, 0], [0.833, 0.833]),
    key(22.123, 0, [0.167, 0], [0.833, 1]),
    key(83, 0, [0.41, 0], [0.12, 1]),
    key(120, 1),
]
const WHITE_MORPH = [
    key(0, 0, [0.167, 0.167], [0.833, 0.833]),
    key(12, 1, [0.167, 0.167], [0.833, 0.833]),
    key(102, 1, [0.167, 0.167], [0.4, 1]),
    key(120, 0),
]
const WHITE_CORE_SCALE = [
    key(0, 1),
    key(12.066, 1),
    key(23.463, 0.8),
    key(33.52, 1),
    key(43.576, 0.8),
    key(60.336, 1),
    key(70.391, 0.8),
    key(80.447, 1),
    key(90.502, 0.8),
    key(114.637, 1),
]
const WHITE_HALO_SCALE = [
    key(5.363, 1),
    key(17.43, 1),
    key(28.826, 0.8),
    key(38.883, 1),
    key(48.939, 0.8),
    key(65.699, 1),
    key(75.754, 0.8),
    key(85.811, 1),
    key(95.865, 0.8),
    key(120, 1),
]

function groupScale(frame) {
    const times = [0, 18, 35, 50, 65, 90, 105, 120, 135, 171]
    const values = [1, 1, 0.8, 1, 0.8, 1, 0.8, 1, 0.8, 1]
    for (let i = 1; i < times.length; i++) {
        if (frame < times[i]) {
            return mix(
                values[i - 1],
                values[i],
                easing(
                    (frame - times[i - 1]) / (times[i] - times[i - 1]),
                    [0.333, 0],
                    [0.667, 1]
                )
            )
        }
    }
    return 1
}

/** Main flare: shape = (scale, contour morph, core scale, star glow scale), plus the halo scale. */
export function sparkleState(time, appearance) {
    const raw = Math.max(0, time * 60) % 180
    if (appearance === Appearance.white) {
        const frame = (raw * 121) / 180
        return {
            shape: [
                sampleKeys(WHITE_MAIN_SCALE, frame),
                sampleKeys(WHITE_MORPH, frame),
                sampleKeys(WHITE_CORE_SCALE, frame),
                1,
            ],
            haloScale: sampleKeys(WHITE_HALO_SCALE, frame),
        }
    }
    const frame = raw
    let scale
    if (frame < 33) scale = 1 - easing(frame / 33, [0.333, 0], [0.833, 0.833])
    else if (frame < 129) scale = 0
    else scale = easing((frame - 129) / 50, [0.167, 0.167], [0.4, 1])
    let morph
    if (frame < 18) morph = easing(frame / 18, [0.167, 0.167], [0.667, 1])
    else if (frame < 151) morph = 1
    else morph = 1 - easing((frame - 151) / 28, [0.167, 0.167], [0.4, 1])
    return {
        shape: [scale, morph, groupScale(frame), groupScale(frame - 4)],
        haloScale: groupScale(frame - 8),
    }
}

/**
 * Which of the four broad faces carries the main flare, and how visible it is: it shows only while a
 * face looks at the camera and fades out when the stone turns too fast to read it.
 */
export function mainPlacement(model, angularSpeed) {
    const front = [0, -Math.sin(REFERENCE_PITCH), Math.cos(REFERENCE_PITCH)]
    let bestFacing = -1,
        faceAngle = 0
    for (let face = 0; face < 4; face++) {
        const angle = (face * Math.PI) / 2
        const x = Math.sin(angle),
            z = Math.cos(angle)
        // model * (x, 0, z, 0), column-major
        const f = [
            model[0] * x + model[8] * z,
            model[1] * x + model[9] * z,
            model[2] * x + model[10] * z,
        ]
        const facing = f[0] * front[0] + f[1] * front[1] + f[2] * front[2]
        if (facing > bestFacing) {
            bestFacing = facing
            faceAngle = angle
        }
    }
    const limit = (Math.PI * 12) / 180
    const angle = Math.acos(clamp(bestFacing, -1, 1))
    const facing = smooth(1 - angle / limit)
    const crossing = (2 * limit) / Math.max(Math.abs(angularSpeed), 0.001)
    return {
        faceRotation: faceAngle,
        visibility: facing * smooth((crossing - 0.06) / 0.34),
    }
}
