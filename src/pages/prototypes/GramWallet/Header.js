import PropTypes from "prop-types"
import { useHashLocation } from "wouter/use-hash-location"

import PanelHeader from "../../../components/PanelHeader"

import HeaderBalances from "./HeaderBalances"

export const CARD_MODES = ["3D Card", "2D Card"]

const Header = ({
    gramAmount,
    balance,
    flight,
    gramRef,
    fiatRef,
    onCardMode,
}) => {
    const [, navigate] = useHashLocation()

    return (
        <PanelHeader
            sticky
            left={<PanelHeader.BackIcon />}
            onLeft={() => navigate("/")}
            right={<PanelHeader.MoreIcon />}
            rightMenu={CARD_MODES}
            onRightMenu={onCardMode}
        >
            <HeaderBalances
                gramAmount={gramAmount}
                balance={balance}
                flight={flight}
                gramRef={gramRef}
                fiatRef={fiatRef}
            />
        </PanelHeader>
    )
}

Header.propTypes = {
    gramAmount: PropTypes.string,
    balance: PropTypes.string,
    flight: PropTypes.object.isRequired,
    gramRef: PropTypes.func,
    fiatRef: PropTypes.func,
    onCardMode: PropTypes.func,
}

export default Header
