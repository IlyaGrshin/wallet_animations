import React, { useEffect, Suspense } from "react"
import { Link } from "wouter"

import Page from "../../components/Page"
import SectionList from "../../components/SectionList"
import Cell from "../../components/Cells"
import Switch from "../../components/Switch"
import DropdownMenu from "../../components/DropdownMenu"
import PageTransition from "../../components/PageTransition"

import useModal from "../../hooks/useModal"
const Modals = React.lazy(() => import("../Modals"))

const UI = () => {
    const { modals, handlers } = useModal({
        modal1: false,
        modal2: false,
    })

    return (
        <PageTransition>
            <Page>
                <SectionList>
                    <SectionList.Item header="Prototypes">
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
                        <Cell
                            as={Link}
                            to="tabbar"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Tab Bar" />
                        </Cell>
                        <Cell
                            as={Link}
                            to="picker"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Picker" />
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
                                        items={[
                                            "Option 1",
                                            "Option 2",
                                            "Option 3",
                                        ]}
                                    />
                                </Cell.Part>
                            }
                        >
                            <Cell.Text title="Label" />
                        </Cell>
                        <Cell onClick={handlers.modal1.open}>
                            <Cell.Text type="Accent" title="Open Modal" />
                        </Cell>
                        <Cell onClick={handlers.modal2.open}>
                            <Cell.Text type="Accent" title="Open Modal (CSS)" />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
                <Suspense>
                    <Modals modals={modals} handlers={handlers} />
                </Suspense>
            </Page>
        </PageTransition>
    )
}

export default React.memo(UI)
