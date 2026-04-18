import { useState } from "react"
import PropTypes from "prop-types"

import Page from "../Page"
import SectionList from "../SectionList"
import Cell from "../Cells"
import Gallery from "../Gallery"
import Text from "../Text"

import { BackButton } from "../../lib/twa"

const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]

const GalleryPage = ({ color, label }) => (
    <div
        style={{
            width: "100%",
            height: 200,
            backgroundColor: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
        }}
    >
        <Text variant="title2" weight="bold" style={{ color: "#fff" }}>
            {label}
        </Text>
    </div>
)

GalleryPage.propTypes = {
    color: PropTypes.string,
    label: PropTypes.string,
}

const GalleryShowcase = () => {
    const [page, setPage] = useState(0)

    return (
        <>
            <BackButton />
            <Page>
                <SectionList>
                    <SectionList.Item header="Gallery">
                        <Gallery onPageChange={setPage}>
                            {colors.map((color, i) => (
                                <GalleryPage
                                    key={color}
                                    color={color}
                                    label={`Page ${i + 1}`}
                                />
                            ))}
                        </Gallery>
                    </SectionList.Item>

                    <SectionList.Item>
                        <Cell>
                            <Cell.Text
                                title="Current Page"
                                description={`${page + 1} of ${colors.length}`}
                            />
                        </Cell>
                    </SectionList.Item>
                </SectionList>
            </Page>
        </>
    )
}

export default GalleryShowcase
