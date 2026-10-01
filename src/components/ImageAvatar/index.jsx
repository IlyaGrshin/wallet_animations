import { forwardRef } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import { useSkin } from "../../hooks/DeviceProvider"
import { useSkeletonContext, useRedactionClassName, waveRef } from "../Skeleton"
import { Image } from "../Image"
import * as styles from "./ImageAvatar.module.scss"

const ImageAvatar = forwardRef(
    ({ size, className, style, src, shape = "circle" }, ref) => {
        const { isMaterial } = useSkin()
        const redacted = Boolean(useSkeletonContext())
        const redactionClassName = useRedactionClassName(redacted)
        const resolvedSize = size ?? (isMaterial ? 42 : 40)

        return (
            <div
                ref={(node) => {
                    if (redacted) waveRef(node)
                    if (typeof ref === "function") {
                        ref(node)
                    } else if (ref) {
                        ref.current = node
                    }
                }}
                className={cx(
                    shape === "circle" && styles.shapeCircle,
                    shape === "rounded" && styles.shapeRounded,
                    redactionClassName,
                    className
                )}
                style={{
                    width: resolvedSize,
                    height: resolvedSize,
                    ...style,
                }}
            >
                <Image
                    src={src}
                    className={cx(styles.img, redacted && styles.imgRedacted)}
                />
            </div>
        )
    }
)

ImageAvatar.propTypes = {
    size: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    src: PropTypes.string,
    shape: PropTypes.oneOf(["circle", "rounded"]),
}
export default ImageAvatar
