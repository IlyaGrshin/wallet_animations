import { forwardRef } from "react"
import PropTypes from "prop-types"

import { Image } from "../Image"

import * as styles from "./ImageAvatar.module.scss"

const ImageAvatar = forwardRef(
    ({ size = 40, className, style, src, shape = "circle" }, ref) => {
        return (
            <div
                ref={ref}
                className={`
                    ${shape === "circle" ? styles.shapeCircle : ""} 
                    ${shape === "rounded" ? styles.shapeRounded : ""} 
                    ${className || ""}`}
                style={{
                    width: size,
                    height: size,
                    ...style,
                }}
            >
                <Image src={src} className={styles.img} />
            </div>
        )
    }
)

ImageAvatar.propTypes = {
    size: PropTypes.number,
    src: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    shape: PropTypes.oneOf(["circle", "rounded"]),
}

export default ImageAvatar
