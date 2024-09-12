import PropTypes from 'prop-types'
import './index.css'

const Text = ({ as: Component = 'div', variant, weight, caps = false, rounded = false, children, ...props }) => {
    const dynamicProps = {
        ...(variant && { variant }),
        ...(weight && { weight }),
        ...(rounded && { 'data-rounded': true }),
        ...(caps && { 'data-caps': true }),
    };

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

Text.propTypes = {
    variant: PropTypes.oneOf(['title1', 'title3', 'body', 'subheadline2', 'footnote', 'caption2']),
    weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
    rounded: PropTypes.bool,
    uppercase: PropTypes.bool
}

export default Text
