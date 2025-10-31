import TransitionLink from "../../components/Link"

import Page from "../../components/Page"
import SectionList from "../../components/SectionList"
import Cell from "../../components/Cells"
import Switch from "../../components/Switch"
import DropdownMenu from "../../components/DropdownMenu"
import NativePageTransition from "../../components/NativePageTransition"

const UI = () => {
    return (
        <NativePageTransition>
            <Page>
                <SectionList>
                    <SectionList.Item header="Components">
                        <Cell
                            as={TransitionLink}
                            to="/components/header"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Navigation Bar" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/components/bottombar"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Bottom Bar" />
                        </Cell>
                    </SectionList.Item>
                    <SectionList.Item header="Prototypes">
                        <Cell
                            as={TransitionLink}
                            to="/colorassetpage"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Color Asset Page" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/newnavigation"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Navigation Update" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/onboarding"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Onboarding" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/colorchanging"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Background Tests" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/tabbar"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Tab Bar" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/picker"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Picker" />
                        </Cell>
                        <Cell
                            as={TransitionLink}
                            to="/modalpages"
                            end={<Cell.Part type="Chevron" />}
                        >
                            <Cell.Text title="Modal Pages" />
                        </Cell>
                    </SectionList.Item>
                    <SectionList.Item>
                        <Cell>
                            <Cell.Text title="Label" description="Subtitle" />
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
                    </SectionList.Item>
                </SectionList>
            </Page>
        </NativePageTransition>
    )
}

export default UI
