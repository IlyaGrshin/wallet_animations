import Page from "../../../components/Page"
import SectionList from "../../../components/SectionList"
import Cell from "../../../components/Cells"
import Skeleton from "../../../components/Skeleton"

const ShareMessageSkeleton = () => (
    <Page>
        <SectionList>
            <SectionList.Item header="Message">
                <Skeleton active>
                    <Cell>
                        <Cell.Text title="Message text" />
                    </Cell>
                    <Cell>
                        <Cell.Text title="Prepare and share" />
                    </Cell>
                </Skeleton>
            </SectionList.Item>
        </SectionList>
    </Page>
)

export default ShareMessageSkeleton
