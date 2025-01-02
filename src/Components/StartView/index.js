import Text from "../Text"

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
                    variant: "headline5",
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
                    variant: "body1",
                }}
            >
                {description}
            </Text>
        </div>
    )
}

export default StartView
