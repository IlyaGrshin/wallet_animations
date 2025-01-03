import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import PageTransition from "../../Components/PageTransition"

import SectionList from "../../Components/SectionList"
import Cell from "../../Components/Cell"
import Switch from "../../Components/Switch"
import ModalView from "../../Components/ModalView"
import DropdownMenu from "../../Components/DropdownMenu"
import PanelHeader from "../../Components/PanelHeader"
import SegmentedControl from "../../Components/SegmentedControl"
import { getAssetIcon } from "../../Components/AssetsMap"

import WebApp from "@twa-dev/sdk"
import { MainButton } from "@twa-dev/sdk/react"

const UI = () => {
    const handleSegmentChange = () => {
        // console.log('Выбранный сегмент: ', index);
    }

    const [isModalOpen, setIsModalOpen] = useState({
        modal1: false,
        modal2: false,
    })

    const openModal = (ID) => {
        setIsModalOpen((prevState) => ({
            ...prevState,
            [ID]: true,
        }))
    }

    const closeModal = (ID) => {
        setIsModalOpen((prevState) => ({
            ...prevState,
            [ID]: false,
        }))
    }

    useEffect(() => {
        if (WebApp.initData) {
            WebApp.ready()
            WebApp.expand()
            WebApp.setBackgroundColor("secondary_bg_color")
            WebApp.setHeaderColor("secondary_bg_color")
        } else {
            document.body.style.backgroundColor =
                "var(--tg-theme-secondary-bg-color)"
        }
    }, [])

    return (
        <PageTransition>
            <SectionList>
                <SegmentedControl
                    segments={["Label 1", "Label 2", "Label 3"]}
                    onChange={handleSegmentChange}
                />
                <SectionList.Item>
                    <Cell
                        as={Link}
                        to="newnavigation"
                        end={<Cell.Part type="Chevron" />}
                    >
                        <Cell.Text title="Navigation Update" />
                    </Cell>
                    <Cell
                        as={Link}
                        to="onboarding"
                        end={<Cell.Part type="Chevron" />}
                    >
                        <Cell.Text title="Onboarding" />
                    </Cell>
                    <Cell
                        as={Link}
                        to="colorchanging"
                        end={<Cell.Part type="Chevron" />}
                    >
                        <Cell.Text title="Background Tests" />
                    </Cell>
                    {/* <Cell as={Link} to='textpage'>
                        <Cell.Text type='Accent' title='Text Page' />
                    </Cell> */}
                </SectionList.Item>
                <SectionList.Item>
                    <Cell>
                        <Cell.Text title="Label" descrption="Subtitle" />
                    </Cell>
                    <Cell>
                        <Cell.Text title="Label" bold />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type="Switch">
                                <Switch />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title="Wi-Fi" />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type="Dropdown">
                                <DropdownMenu
                                    items={["Option 1", "Option 2", "Option 3"]}
                                />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title="Label" />
                    </Cell>
                    <Cell onClick={() => openModal("modal1")}>
                        <Cell.Text type="Accent" title="Open Modal" />
                    </Cell>
                    <Cell onClick={() => openModal("modal2")}>
                        <Cell.Text type="Accent" title="Open Modal (CSS)" />
                    </Cell>
                </SectionList.Item>
            </SectionList>
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
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("TON")}
                                />
                            }
                        >
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("USDT")}
                                />
                            }
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("BTC")}
                                />
                            }
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
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("TON")}
                                />
                            }
                        >
                            <Cell.Text
                                title="Toncoin"
                                description="100 TON"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("USDT")}
                                />
                            }
                        >
                            <Cell.Text
                                title="Dollars"
                                description="100 USDT"
                                bold
                            />
                        </Cell>
                        <Cell
                            start={
                                <Cell.Start
                                    type="Image"
                                    src={getAssetIcon("BTC")}
                                />
                            }
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
        </PageTransition>
    )
}

export default React.memo(UI)
