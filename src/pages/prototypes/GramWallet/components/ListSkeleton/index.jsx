import PropTypes from "prop-types"

import Cell from "../../../../../components/Cells"
import ImageAvatar from "../../../../../components/ImageAvatar"
import Skeleton from "../../../../../components/Skeleton"
import Text from "../../../../../components/Text"

const TITLE_WIDTHS = [11, 8, 13, 9, 12, 10, 14, 9]
const DESCRIPTION_WIDTHS = [6, 8, 7, 6, 9, 7, 6, 8]
const CAPTION_WIDTH = 13
const AMOUNT_WIDTH = 5

const ListSkeleton = ({ rows = 6, caption = false, end }) => (
    <Skeleton active>
        {Array.from({ length: rows }, (unused, index) => (
            <Cell
                key={index}
                start={<ImageAvatar />}
                end={end ?? <Text skeleton={AMOUNT_WIDTH} />}
            >
                <Cell.Text
                    title={TITLE_WIDTHS[index % TITLE_WIDTHS.length]}
                    description={
                        DESCRIPTION_WIDTHS[index % DESCRIPTION_WIDTHS.length]
                    }
                    caption={caption ? CAPTION_WIDTH : undefined}
                    bold
                />
            </Cell>
        ))}
    </Skeleton>
)

ListSkeleton.propTypes = {
    rows: PropTypes.number,
    caption: PropTypes.bool,
    end: PropTypes.node,
}

export default ListSkeleton
