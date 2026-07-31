import PropTypes from "prop-types"
import { useHashLocation } from "wouter/use-hash-location"

import PanelHeader from "../../../components/PanelHeader"
import ChevronLeftIcon from "../../../icons/28/Chevron Left.svg?react"
import EllipsisIcon from "../../../icons/28/Elipsis.svg?react"

import HeaderBalances from "./HeaderBalances"

const Header = ({ gramAmount, balance, flight, gramRef, fiatRef }) => {
    const [, navigate] = useHashLocation()

    return (
        <PanelHeader
            sticky
            left={<ChevronLeftIcon />}
            onLeft={() => navigate("/")}
            right={<EllipsisIcon />}
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
}

export default Header
