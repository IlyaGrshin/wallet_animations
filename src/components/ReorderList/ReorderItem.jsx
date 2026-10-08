import { useContext, useRef } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import {
    AnimatePresence,
    useDragControls,
    useMotionValue,
    useTransform,
} from "motion/react"
import cx from "clsx"

import Tappable from "../Tappable"
import { useSkin } from "../../hooks/DeviceProvider"
import { EASING, SPRING } from "../../utils/animations"
import { ReorderContext } from "./context"
import { useReorderLift } from "./useReorderLift"

import ReorderIcon from "../../icons/24/Reorder.svg?react"
import DragHandleIcon from "../../icons/24/DragHandle.svg?react"

import * as styles from "./ReorderList.module.scss"

const MATERIAL_LAYOUT = { duration: 0.25, ease: EASING.MATERIAL_STANDARD }
const HANDLE_HIDDEN = { opacity: 0, x: 16 }
const HANDLE_SHOWN = { opacity: 1, x: 0 }
const HANDLE_IN = { duration: 0.25, ease: EASING.QUINT_OUT }
const HANDLE_OUT = {
    ...HANDLE_HIDDEN,
    transition: { duration: 0.2, ease: EASING.QUINT_OUT },
}
const KEY_STEPS = { ArrowUp: -1, ArrowDown: 1 }

const ReorderItem = ({ value, label, children, className }) => {
    const { groupRef, editing, register, track, step } =
        useContext(ReorderContext)
    const { isApple } = useSkin()
    const controls = useDragControls()
    const handleRef = useRef(null)
    const y = useMotionValue(0)
    const settlingZ = useTransform(y, (offset) => (offset ? 1 : "auto"))

    const { lifted, lift, onDragStart, rowHandlers } = useReorderLift({
        controls,
        groupRef,
        longPress: !editing,
    })

    const spring = isApple ? SPRING.APPLE : SPRING.MATERIAL

    const onKeyDown = (event) => {
        const by = KEY_STEPS[event.key]
        if (!by) return
        event.preventDefault()
        if (step(value, by))
            requestAnimationFrame(() => handleRef.current?.focus())
    }

    return (
        <m.div
            ref={(element) => register(value, element)}
            layout="position"
            transition={{ layout: isApple ? SPRING.APPLE : MATERIAL_LAYOUT }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={groupRef}
            dragElastic={0}
            dragSnapToOrigin
            dragTransition={{
                bounceStiffness: spring.stiffness,
                bounceDamping: spring.damping,
            }}
            onDragStart={onDragStart}
            onDrag={() => track(value, y.get())}
            style={{ y, zIndex: lifted ? 1 : settlingZ }}
            className={cx(
                styles.item,
                isApple ? styles.apple : styles.material,
                lifted && styles.lifted,
                className
            )}
            {...rowHandlers}
        >
            <div aria-hidden className={styles.shadow} />
            <div className={styles.surface}>
                {children}
                <AnimatePresence initial={false}>
                    {editing && (
                        <Tappable
                            key="handle"
                            as="button"
                            type="button"
                            mode="opacity"
                            ref={handleRef}
                            className={styles.handle}
                            aria-label={`Reorder ${label}`}
                            aria-keyshortcuts="ArrowUp ArrowDown"
                            onPointerDown={(event) => {
                                if (event.button === 0 && event.isPrimary)
                                    lift(event.nativeEvent)
                            }}
                            onKeyDown={onKeyDown}
                        >
                            <m.span
                                className={styles.icon}
                                initial={HANDLE_HIDDEN}
                                animate={HANDLE_SHOWN}
                                exit={HANDLE_OUT}
                                transition={HANDLE_IN}
                            >
                                {isApple ? <ReorderIcon /> : <DragHandleIcon />}
                            </m.span>
                        </Tappable>
                    )}
                </AnimatePresence>
            </div>
        </m.div>
    )
}

ReorderItem.propTypes = {
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default ReorderItem
