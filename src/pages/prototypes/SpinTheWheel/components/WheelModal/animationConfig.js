// The main spin is deliberately long so the user is tempted to hit
// speed-up and feel the acceleration mechanic.
export const SPIN_DURATION_MS = 22000

// The fourth speed-up press hands the reel to its final cruise of this length.
export const CRUISE_DURATION_MS = 4500

// Each speed-up before the fourth multiplies the remaining tween time.
export const SPEED_UP_FACTOR = 0.65
export const MAX_SPEED_UPS = 4

// Spin target = focusedIndex + SPIN_TURNS. 40 × 180px ≈ 7200px of travel,
// enough to read as "the drum spun many times".
export const SPIN_TURNS = 40

// Initial reel length and the padding from the start to the idle slot.
export const REEL_LENGTH = 240
export const LEAD_PADDING = 3
export const IDLE_INDEX = LEAD_PADDING

// While the modal sits in IDLE, the reel nudges one slot every 2.3s so
// the strip doesn't look static.
export const IDLE_NUDGE_INTERVAL_MS = 2300

// Upper bound on reel length so the idle nudge doesn't leak memory during
// long idle sessions. ~5× the initial size ≈ 1200 items.
export const REEL_HARD_CAP = REEL_LENGTH * 5

// Optical lift downward: the footer card's shadow makes the geometric
// centre look higher than the perceived one — this offset compensates.
export const CENTER_LIFT_PX = 20

// Defaults used until the first ResizeObserver measurement lands.
export const DEFAULT_LAYOUT = { stageH: 460, footerH: 180, navH: 60 }
