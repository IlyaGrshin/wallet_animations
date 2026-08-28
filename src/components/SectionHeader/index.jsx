import PropTypes from "prop-types"

import Text from "../Text"
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
                            variant: "title2",
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
                                variant: "body",
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
                            variant: "subheadline2",
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
                            variant: "subheadline1",
                            weight: "medium",
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
                                variant: "subheadline1",
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
