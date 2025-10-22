import PropTypes from "prop-types"
import { memo } from "react"

import ModalView from "../../../../components/ModalView"
import PanelHeader from "../../../../components/PanelHeader"
import SectionList from "../../../../components/SectionList"
import Cell from "../../../../components/Cells"
import ImageAvatar from "../../../../components/ImageAvatar"

import { getAssetIcon } from "../../../../utils/AssetsMap"
import { MainButton } from "@twa-dev/sdk/react"
import InitialsAvatar from "../../../../components/InitialsAvatar"

const Modals = ({ modals, handlers }) => {
    return (
        <>
            <ModalView
                key="modal1"
                isOpen={modals.modal1}
                onClose={handlers.modal1.close}
                style={{
                    backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
            >
                <PanelHeader>Modal (Framer)</PanelHeader>
                <SectionList>
                    <SectionList.Item>
                        <Cell start={<ImageAvatar src={getAssetIcon("TON")} />}>
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<ImageAvatar src={getAssetIcon("USDT")} />}
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell start={<ImageAvatar src={getAssetIcon("BTC")} />}>
                            <Cell.Text
                                title="Bitcoin"
                                description="0.000001 BTC"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<InitialsAvatar userId={1} name="Bitcoin" />}
                        >
                            <Cell.Text
                                title="Bitcoin"
                                description="0.000001 BTC"
                                bold
                            />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
                <MainButton text="Confirm" onClick={handlers.modal1.close} />
            </ModalView>
            <ModalView
                key="modal2"
                isOpen={modals.modal2}
                onClose={handlers.modal2.close}
                style={{
                    backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
                useCssAnimation={true}
            >
                <PanelHeader>Modal (CSS)</PanelHeader>
                <SectionList>
                    <SectionList.Item>
                        <Cell start={<ImageAvatar src={getAssetIcon("TON")} />}>
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<ImageAvatar src={getAssetIcon("USDT")} />}
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell start={<ImageAvatar src={getAssetIcon("BTC")} />}>
                            <Cell.Text
                                title="Bitcoin"
                                description="0.000001 BTC"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<InitialsAvatar userId={1} name="Bitcoin" />}
                        >
                            <Cell.Text
                                title="Bitcoin"
                                description="0.000001 BTC"
                                bold
                            />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
                <MainButton text="Confirm" onClick={handlers.modal2.close} />
            </ModalView>
        </>
    )
}

Modals.propTypes = {
    modals: PropTypes.shape({
        modal1: PropTypes.bool,
        modal2: PropTypes.bool,
    }),
    handlers: PropTypes.shape({
        modal1: PropTypes.shape({
            close: PropTypes.func,
        }),
        modal2: PropTypes.shape({
            close: PropTypes.func,
        }),
    }),
}

export default memo(Modals)
