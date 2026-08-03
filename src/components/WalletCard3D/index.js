import { useState } from "react"
import PropTypes from "prop-types"

import WalletCard from "../WalletCard"

import useCardScene from "./useCardScene"
import { CANVAS_OVERSCAN } from "./scene"
import * as styles from "./WalletCard3D.module.scss"

/**
 * The wallet card as a lit WebGL mesh: front, back and edge meshes under the
 * radial-blue finish, with the balance, name and address baked into canvas
 * textures. Falls back to the flat `WalletCard` when WebGL is unavailable.
 * @param {string} [props.name] Card holder, printed uppercase.
 * @param {string} [props.address] Wallet address, engraved down the right edge.
 * @param {string} [props.gramAmount] GRAM balance, e.g. "10.23".
 * @param {string} [props.balance] Fiat balance, e.g. "$2.5".
 * @example
 * <WalletCard3D name="Alicia Torreaux" address={address} gramAmount="10.23" />
 */
const WalletCard3D = ({
    name = "Alicia Torreaux",
    address = "UQAl1dViv82p5sllNyPXJenPJqRfaHrVGkhmhFcrIjYinqYK",
    gramAmount = "0",
    balance = "$3,450.04",
}) => {
    const [canvas, setCanvas] = useState(null)
    const failed = useCardScene(canvas, { name, address, gramAmount, balance })

    if (failed) {
        return (
            <WalletCard
                name={name}
                address={address}
                gramAmount={gramAmount}
                balance={balance}
            />
        )
    }

    return (
        <div
            className={styles.root}
            style={{ "--card-3d-overscan": CANVAS_OVERSCAN }}
        >
            <canvas
                ref={setCanvas}
                className={styles.canvas}
                aria-label="Wallet card"
            />
        </div>
    )
}

WalletCard3D.propTypes = {
    name: PropTypes.string,
    address: PropTypes.string,
    gramAmount: PropTypes.string,
    balance: PropTypes.string,
}

export default WalletCard3D
