import Text from "../Text"
import PropTypes from "prop-types"

import * as styles from "./StartView.module.scss"

const StartView = ({ title, description }) => {
    return (
        <div className={styles.root}>
            <Text
                apple={{
                    variant: "title1",
                    weight: "bold",
                }}
                material={{
                    variant: "title1",
                }}
            >
                {title}
            </Text>
            <Text
                apple={{
                    variant: "body",
                    weight: "regular",
                }}
                material={{
                    variant: "body",
                }}
            >
                {description}
            </Text>
        </div>
    )
}

StartView.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
}
export default StartView
