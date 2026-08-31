import PropTypes from "prop-types"

import Amount from "../Amount"
import DetailModal from "../DetailModal"

const TransactionModal = ({ transaction, isOpen, onClose }) => {
    if (!transaction) return null

    const { name, description, amount, unit, caption, nft } = transaction
    const rows = Object.entries({
        Type: description,
        Amount: amount && <Amount value={amount} unit={unit} />,
        Collectible: nft?.name,
        Date: caption,
    }).filter(([, value]) => value)

    return (
        <DetailModal
            title={name}
            image={nft?.preview}
            rows={rows}
            isOpen={isOpen}
            onClose={onClose}
        />
    )
}

TransactionModal.propTypes = {
    transaction: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        amount: PropTypes.string,
        unit: PropTypes.string,
        caption: PropTypes.string,
        nft: PropTypes.shape({
            name: PropTypes.string,
            preview: PropTypes.string,
        }),
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default TransactionModal
