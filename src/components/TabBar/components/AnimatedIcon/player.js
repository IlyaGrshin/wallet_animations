// Drives one SMIL-animated icon SVG (see scripts/lottie-to-smil). The SVG
// timeline stays paused except while a segment plays; the browser runs the
// animation itself, JS only checks once per frame whether the segment ended.
export function createPlayer(svg, fps) {
    let raf = 0

    const stop = () => cancelAnimationFrame(raf)

    const seek = (frame) => {
        stop()
        svg.pauseAnimations()
        svg.setCurrentTime(frame / fps)
    }

    const play = (from, to, onComplete) => {
        seek(from)
        const end = to / fps
        const tick = () => {
            if (svg.getCurrentTime() >= end) {
                seek(to)
                onComplete?.()
                return
            }
            raf = requestAnimationFrame(tick)
        }
        svg.unpauseAnimations()
        raf = requestAnimationFrame(tick)
    }

    return { svg, seek, play, stop }
}
