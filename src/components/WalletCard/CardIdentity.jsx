import PropTypes from "prop-types"
import { formatAddress } from "../../utils/address"
import FitText from "../FitText"
import * as styles from "./CardIdentity.module.scss"

export default function CardIdentity({ name, address, nameRef, addressRef }) {
    const [line1, line2] = formatAddress(address)

    return (
        <>
            <p ref={nameRef} className={styles.name}>
                {name}
            </p>

            <div
                ref={addressRef}
                className={styles.addressOuter}
                aria-hidden="true"
            >
                <div className={styles.addressRotator}>
                    <FitText
                        innerClassName={styles.addressInner}
                        minScale={0.5}
                        maxScale={1.5}
                    >
                        <span className={styles.addressLine}>{line1}</span>
                        <span className={styles.addressLine}>{line2}</span>
                    </FitText>
                </div>
            </div>
        </>
    )
}

const refShape = PropTypes.oneOfType([PropTypes.func, PropTypes.object])

CardIdentity.propTypes = {
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    nameRef: refShape.isRequired,
    addressRef: refShape.isRequired,
}
