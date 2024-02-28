import PropTypes from 'prop-types'
import './index.css'

const Typography = ({ variant, variantStyle, weight, rounded = false, children, ...props }) => {
    const Component = variant || 'span'
    const Rounded = rounded ? 'rounded' : ''
    const classes = `typography--${variantStyle} weight--${weight} ${Rounded}`.trim();

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    )
}

Typography.propTypes = {
    variantStyle: PropTypes.oneOf(['title1', 'title3', 'body', 'subheadline2']),
    weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
    rounded: PropTypes.bool
}

export default Typography