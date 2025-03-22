import React from "react"

import ModalView from "../../components/ModalView"
import PanelHeader from "../../components/PanelHeader"
import SectionList from "../../components/SectionList"
import Cell from "../../components/Cells"
import ImageAvatar from "../../components/ImageAvatar"

import { useAssetIcon } from "../../utlis/AssetsMap"
import { MainButton } from "@twa-dev/sdk/react"
import InitialsAvatar from "../../components/InitialsAvatar"

const Modals = ({ isModalOpen, closeModal }) => {
    return (
        <>
            <ModalView
                key="modal1"
                isOpen={isModalOpen.modal1}
                onClose={() => closeModal("modal1")}
                style={{
                    backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
            >
                <PanelHeader>Modal (Framer)</PanelHeader>
                <SectionList>
                    <SectionList.Item>
                        <Cell start={<ImageAvatar src={useAssetIcon("TON")} />}>
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<ImageAvatar src={useAssetIcon("USDT")} />}
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell start={<ImageAvatar src={useAssetIcon("BTC")} />}>
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
                <MainButton
                    text="Confirm"
                    onClick={() => closeModal("modal1")}
                />
            </ModalView>
            <ModalView
                key="modal2"
                isOpen={isModalOpen.modal2}
                onClose={() => closeModal("modal2")}
                style={{
                    backgroundColor: "var(--tg-theme-secondary-bg-color)",
                }}
                useCssAnimation={true}
            >
                <PanelHeader>Modal (CSS)</PanelHeader>
                <SectionList>
                    <SectionList.Item>
                        <Cell start={<ImageAvatar src={useAssetIcon("TON")} />}>
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={<ImageAvatar src={useAssetIcon("USDT")} />}
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell start={<ImageAvatar src={useAssetIcon("BTC")} />}>
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
                <MainButton
                    text="Confirm"
                    onClick={() => closeModal("modal2")}
                />
            </ModalView>
        </>
    )
}

export default React.memo(Modals)
