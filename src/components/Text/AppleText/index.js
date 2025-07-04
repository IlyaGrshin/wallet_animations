import * as styles from "./AppleText.module.scss"

const AppleText = ({
    as: Component = "div",
    apple: textProps,
    children,
    ...props
}) => {
    const dynamicProps = {
        ...(textProps?.variant && { variant: textProps.variant }),
        ...(textProps?.weight && { weight: textProps.weight }),
        ...(textProps.rounded && { "data-rounded": true }),
        ...(textProps.caps && { "data-caps": true }),
    }

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

export default AppleText
