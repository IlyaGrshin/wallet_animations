import PropTypes from 'prop-types'
import './index.css'

const Text = ({ as: Component = 'div', variant, weight, rounded = false, children, ...props }) => {
    const dynamicProps = {
        ...(variant && { variant }),
        ...(weight && { weight }),
    }

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

Text.propTypes = {
    variant: PropTypes.oneOf(['title1', 'title3', 'body', 'subheadline2', 'subheadline2 rounded']),
    weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
    rounded: PropTypes.bool
}

export default Text