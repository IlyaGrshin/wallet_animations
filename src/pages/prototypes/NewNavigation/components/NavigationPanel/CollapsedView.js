import PropTypes from "prop-types"
import Text from "../../../../../components/Text"

const walletNames = {
    0: "Crypto Wallet",
    1: "TON Wallet",
}

export default function CollapsedView({ activeSegment }) {
    return (
        <Text
            apple={{
                variant: "footnote",
                weight: "semibold",
            }}
            material={{
                variant: "button1",
                weight: "medium",
            }}
        >
            {walletNames[activeSegment]}
        </Text>
    )
}

CollapsedView.propTypes = {
    activeSegment: PropTypes.number,
}
