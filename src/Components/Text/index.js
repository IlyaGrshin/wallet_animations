import PropTypes from 'prop-types'
import './index.css'
import { apple } from '../DeviceProvider'

const Text = ({ 
        as: Component = 'div', 
        apple: appleProps,
        material: materialProps,
        variant, 
        weight, 
        caps = false, 
        rounded = false, 
        children, 
        ...props 
    }) => {

    const platformProps = apple ? appleProps : materialProps

    const dynamicProps = {
        ...(platformProps?.variant && { variant: platformProps.variant }),
        ...(platformProps?.weight && { weight: platformProps.weight }),
        ...(platformProps.rounded && { 'data-rounded': true }),
        ...(platformProps.caps && { 'data-caps': true }),
    };

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

Text.propTypes = {
    apple: PropTypes.shape({
        variant: PropTypes.oneOf(['title1', 'title3', 'body', 'subheadline2', 'footnote', 'caption2']),
        weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
        rounded: PropTypes.bool,
        caps: PropTypes.bool,
    }),
    material: PropTypes.shape({
        variant: PropTypes.oneOf(['headline5', 'headline6', 'body1', 'subtitle1', 'button1', 'subtitle2']),
        weight: PropTypes.oneOf(['regular', 'medium']),
        caps: PropTypes.bool,
    }),
    as: PropTypes.elementType
}

export default Text
