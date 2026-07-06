import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Skeleton from "../Skeleton"

// Loading placeholder for the Modal Pages screen. The real screen is a single
// section of accent trigger cells (Open Modal / Open Modal (CSS)); the skeleton
// mirrors that stack so the labels reveal in place once the chunk lands. The
// modal overlays themselves are triggered on tap and never part of the resting
// page, so they are intentionally absent here.
const ModalViewSkeleton = () => (
    <Page>
        <SectionList>
            <SectionList.Item>
                <Skeleton active>
                    <Cell>
                        <Cell.Text type="Accent" title="Open Modal" />
                    </Cell>
                    <Cell>
                        <Cell.Text type="Accent" title="Open Modal (CSS)" />
                    </Cell>
                </Skeleton>
            </SectionList.Item>
        </SectionList>
    </Page>
)

export default ModalViewSkeleton
