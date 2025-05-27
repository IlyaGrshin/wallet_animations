import { forwardRef } from "react"

import { useMaterial } from "../../hooks/DeviceProvider"

import { Image } from "../Image"

import * as styles from "./ImageAvatar.module.scss"

const ImageAvatar = forwardRef(
    ({ size = 40, className, style, src, shape = "circle" }, ref) => {
        if (useMaterial) size = 42

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

export default ImageAvatar
