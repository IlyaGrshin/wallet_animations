import { useState, useCallback, useRef, useEffect } from "react"

const useStoryNavigation = ({ storiesCount, onComplete, duration = 5000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const timeoutRef = useRef(null)
    const startTimeRef = useRef(0)
    const remainingRef = useRef(duration)
    const onCompleteRef = useRef(onComplete)
    const indexRef = useRef(0)
    const frozenRef = useRef(false)
    onCompleteRef.current = onComplete

    const clearTimer = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    const goNext = useCallback(() => {
        if (indexRef.current >= storiesCount - 1) {
            onCompleteRef.current?.()
            return
        }
        indexRef.current += 1
        setCurrentIndex(indexRef.current)
    }, [storiesCount])

    const goPrev = useCallback(() => {
        indexRef.current = Math.max(0, indexRef.current - 1)
        setCurrentIndex(indexRef.current)
    }, [])

    const pause = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current
        remainingRef.current = Math.max(0, remainingRef.current - elapsed)
        clearTimer()
        setIsPaused(true)
    }, [clearTimer])

    const resume = useCallback(() => {
        if (frozenRef.current) return
        clearTimer()
        setIsPaused(false)
        startTimeRef.current = Date.now()
        timeoutRef.current = setTimeout(goNext, remainingRef.current)
    }, [goNext, clearTimer])

    const freeze = useCallback(() => {
        frozenRef.current = true
        clearTimer()
        setIsPaused(true)
    }, [clearTimer])

    useEffect(() => {
        if (frozenRef.current) return
        setIsPaused(false)
        remainingRef.current = duration
        startTimeRef.current = Date.now()
        timeoutRef.current = setTimeout(goNext, duration)
        return clearTimer
    }, [currentIndex, duration, goNext, clearTimer])

    return { currentIndex, isPaused, goNext, goPrev, pause, resume, freeze }
}

export default useStoryNavigation
