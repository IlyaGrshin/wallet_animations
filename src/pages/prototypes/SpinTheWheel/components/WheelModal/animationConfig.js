// Длительность основного спина намеренно большая, чтобы спровоцировать
// пользователя нажать speed-up и почувствовать механику ускорения.
export const SPIN_DURATION_MS = 22000

// 4-е нажатие speed-up переводит барабан в финальный «круиз» с этой длительностью.
export const CRUISE_DURATION_MS = 4500

// Каждый speed-up до 4-го умножает оставшееся время текущего tween.
export const SPEED_UP_FACTOR = 0.65
export const MAX_SPEED_UPS = 4

// Целевой индекс спина = focusedIndex + SPIN_TURNS. 40 × 180px ≈ 7200px
// проматывания — достаточно для иллюзии «барабан крутится много раз».
export const SPIN_TURNS = 40

// Стартовый размер ленты и отступ от начала до idle-индекса.
export const REEL_LENGTH = 240
export const LEAD_PADDING = 3
export const IDLE_INDEX = LEAD_PADDING

// Пока модалка в IDLE, барабан раз в 2.3 с проматывает один слот вниз —
// чтобы лента не выглядела статичной.
export const IDLE_NUDGE_INTERVAL_MS = 2300

// Верхняя граница длины ленты, чтобы idle-nudge не утекал по памяти при
// долгом простое модалки. ~5× стартового размера ≈ 1200 элементов.
export const REEL_HARD_CAP = REEL_LENGTH * 5

// Оптическая поправка центра вниз: footer card отбрасывает тень, из-за
// чего геометрический центр воспринимается выше реального — компенсируем.
export const CENTER_LIFT_PX = 20

// Дефолтные размеры до первого измерения через ResizeObserver.
export const DEFAULT_LAYOUT = { stageH: 460, footerH: 180, navH: 60 }
