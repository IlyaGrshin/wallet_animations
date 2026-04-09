import Page from "../../components/Page"
import SectionList from "../../components/SectionList"
import Cell from "../../components/Cells"
import TransitionLink from "../../components/Link"

import config from "../config"
import { categoryToPrefix } from "../configHelpers"

const CatalogPage = () => (
    <Page>
        <SectionList>
            {config.map(({ category, pages }) => {
                const prefix = categoryToPrefix(category)
                return (
                    <SectionList.Item header={category} key={category}>
                        {pages.map(({ title, slug }) => (
                            <Cell
                                as={TransitionLink}
                                to={`/${prefix}/${slug}`}
                                end={<Cell.Part type="Chevron" />}
                                key={slug}
                            >
                                <Cell.Text title={title} />
                            </Cell>
                        ))}
                    </SectionList.Item>
                )
            })}
        </SectionList>
    </Page>
)

export default CatalogPage
