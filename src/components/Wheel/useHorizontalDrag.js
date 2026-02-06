import { useCallback } from "react"
import { useDragControls } from "motion/react"

const lockScroll = () => {
    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
}

const unlockScroll = () => {
    document.body.style.overflow = ""
    document.body.style.touchAction = ""
}

const useHorizontalDrag = (disabled) => {
    const dragControls = useDragControls()

    const onPointerDown = useCallback(
        (e) => {
            if (disabled) return
            lockScroll()
            dragControls.start(e)
        },
        [disabled, dragControls]
    )

    const onDragEnd = useCallback(() => {
        unlockScroll()
    }, [])

    const onPointerUp = useCallback(() => {
        unlockScroll()
    }, [])

    return { dragControls, onPointerDown, onDragEnd, onPointerUp }
}

export default useHorizontalDrag
