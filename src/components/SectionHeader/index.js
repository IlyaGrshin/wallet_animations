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
                        apple26={{
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
                            apple26={{
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
                        apple26={{
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
                            variant: "footnote",
                            caps: true,
                        }}
                        apple26={{
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

export default SectionHeader
