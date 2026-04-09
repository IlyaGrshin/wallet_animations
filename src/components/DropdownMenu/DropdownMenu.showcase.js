import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import DropdownMenu from "../DropdownMenu"

import { BackButton } from "@twa-dev/sdk/react"

const DropdownMenuShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <SectionList.Item header="Dropdown">
                    <Cell
                        end={
                            <Cell.Part type="Dropdown">
                                <DropdownMenu
                                    items={["Option 1", "Option 2", "Option 3"]}
                                />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title="3 Items" />
                    </Cell>
                    <Cell
                        end={
                            <Cell.Part type="Dropdown">
                                <DropdownMenu
                                    items={[
                                        "English",
                                        "Russian",
                                        "Japanese",
                                        "Korean",
                                        "German",
                                    ]}
                                />
                            </Cell.Part>
                        }
                    >
                        <Cell.Text title="5 Items" />
                    </Cell>
                </SectionList.Item>
            </SectionList>
        </Page>
    </>
)

export default DropdownMenuShowcase
