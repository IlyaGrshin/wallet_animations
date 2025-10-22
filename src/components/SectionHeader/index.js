import Text from "../Text"
import PropTypes from "prop-types"
import * as styles from "./SectionHeader.module.scss"

function SectionHeader({ type, title, value, ...props }) {
    switch (type) {
        case "Headline":
            return (
                <div className={`${styles.root} ${styles.Headline}`} {...props}>
                    <Text
                        apple={{
                            variant: "title3",
                            weight: "bold",
                        }}
                        material={{
                            variant: "headline6",
                        }}
                    >
                        {title}
                    </Text>
                    {value && (
                        <Text
                            apple={{
                                variant: "title3",
                                weight: "bold",
                            }}
                            material={{
                                variant: "body1",
                                weight: "regular",
                            }}
                        >
                            {value}
                        </Text>
                    )}
                </div>
            )
        case "Footer":
            return (
                <div className={`${styles.root} ${styles.Footer}`} {...props}>
                    <Text
                        apple={{
                            variant: "footnote",
                        }}
                        material={{
                            variant: "subtitle2",
                        }}
                    >
                        {title}
                    </Text>
                </div>
            )
        default:
            return (
                <div className={`${styles.root}`} {...props}>
                    <Text
                        apple={{
                            variant: "body",
                            weight: "semibold",
                        }}
                        material={{
                            variant: "button1",
                        }}
                    >
                        {title}
                    </Text>
                    {value && (
                        <Text
                            apple={{
                                variant: "footnote",
                            }}
                            material={{
                                variant: "subtitle1",
                                weight: "regular",
                            }}
                        >
                            {value}
                        </Text>
                    )}
                </div>
            )
    }
}

SectionHeader.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string.isRequired,
    value: PropTypes.string,
}
export default SectionHeader
