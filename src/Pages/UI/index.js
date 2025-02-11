import React, { useState, useEffect, Suspense } from "react"
import { Link } from "wouter"

import PageTransition from "../../Components/PageTransition"
import SectionList from "../../Components/SectionList"
import Cell from "../../Components/Cell"
import Switch from "../../Components/Switch"
import DropdownMenu from "../../Components/DropdownMenu"
import SegmentedControl from "../../Components/SegmentedControl"
import WebApp from "@twa-dev/sdk"

const Modals = React.lazy(() => import("../Modals"))

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
            <Suspense>
                <Modals isModalOpen={isModalOpen} closeModal={closeModal} />
            </Suspense>
        </PageTransition>
    )
}

export default React.memo(UI)
