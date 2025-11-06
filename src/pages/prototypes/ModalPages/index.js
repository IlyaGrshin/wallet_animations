import { Suspense, lazy } from "react"

import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"

import useModal from "../../../hooks/useModal"
const Modals = lazy(() => import("./Modals"))

import { BackButton } from "@twa-dev/sdk/react"

const ModalPages = () => {
    const { modals, handlers } = useModal({
        modal1: false,
        modal2: false,
    })

    return (
        <>
            <Page>
                <BackButton />
                <SectionList>
                    <SectionList.Item>
                        <Cell onClick={handlers.modal1.open}>
                            <Cell.Text type="Accent" title="Open Modal" />
                        </Cell>
                        <Cell onClick={handlers.modal2.open}>
                            <Cell.Text
                                type="Accent"
                                title="Open Modal (CSS)"
                            />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
            </Page>
            <Suspense>
                <Modals modals={modals} handlers={handlers} />
            </Suspense>
        </>
    )
}

export default ModalPages
