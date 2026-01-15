import { Component } from "react"
import PropTypes from "prop-types"

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }

        return this.props.children
    }
}

ErrorBoundary.propTypes = {
    fallback: PropTypes.node,
    children: PropTypes.node,
}

export default ErrorBoundary
