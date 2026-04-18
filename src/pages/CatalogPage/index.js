import Page from "../../components/Page"
import SectionList from "../../components/SectionList"
import Cell from "../../components/Cells"
import TransitionLink from "../../components/Link"

import config from "../config"
import { categoryToPrefix, titleToSlug, sortedPages } from "../configHelpers"

const sorted = sortedPages(config)

const preload = (component) => {
    component?.preload?.()
}

const CatalogPage = () => (
    <Page>
        <SectionList>
            {sorted.map(({ category, pages }) => {
                const prefix = categoryToPrefix(category)
                return (
                    <SectionList.Item header={category} key={category}>
                        {pages.map(({ title, slug, component }) => {
                            const resolvedSlug = slug || titleToSlug(title)
                            const handlePreload = () => preload(component)
                            return (
                                <Cell
                                    as={TransitionLink}
                                    to={`/${prefix}/${resolvedSlug}`}
                                    end={<Cell.Part type="Chevron" />}
                                    key={resolvedSlug}
                                    onMouseEnter={handlePreload}
                                    onFocus={handlePreload}
                                    onTouchStart={handlePreload}
                                >
                                    <Cell.Text title={title} />
                                </Cell>
                            )
                        })}
                    </SectionList.Item>
                )
            })}
        </SectionList>
    </Page>
)

export default CatalogPage
