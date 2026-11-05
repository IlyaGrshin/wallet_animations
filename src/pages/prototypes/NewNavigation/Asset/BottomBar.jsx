import PropTypes from "prop-types"

import WebApp from "../../../../lib/twa"
import FakeMainButton from "../../../../components/FakeMainButton"
import { RegularButton } from "../../../../components/Button"
import { menuFor } from "./actions"

const tick = () => WebApp.HapticFeedback.impactOccurred("light")

// The page's actions over the Fake Main Button: up to two primary buttons,
// or a muted notice while the stock market is closed (`actions` is null),
// plus the "more" menu.
export default function BottomBar({ page }) {
    return (
        <FakeMainButton menu={menuFor(page)} onMenuSelect={tick}>
            {page.actions ? (
                page.actions.map((label) => (
                    <RegularButton
                        key={label}
                        variant="filled"
                        label={label}
                        isFill
                        onClick={tick}
                    />
                ))
            ) : (
                <RegularButton
                    variant="muted"
                    label="Trading is unavailable"
                    isFill
                    disabled
                />
            )}
        </FakeMainButton>
    )
}

BottomBar.propTypes = {
    page: PropTypes.shape({
        kind: PropTypes.string,
        ticker: PropTypes.string,
        actions: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
}
