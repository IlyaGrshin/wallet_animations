import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react"
import PropTypes from "prop-types"
import SnackbarHost from "./SnackbarHost"

const SnackbarContext = createContext(null)

export const useSnackbar = () => {
    const value = useContext(SnackbarContext)
    if (!value) {
        throw new Error("useSnackbar must be used inside <SnackbarProvider>")
    }
    return value
}

export const SnackbarProvider = ({ children }) => {
    const [snackbars, setSnackbars] = useState([])
    const idRef = useRef(0)

    const dismiss = useCallback((id) => {
        setSnackbars((curr) => curr.filter((s) => s.id !== id))
    }, [])

    const show = useCallback((options) => {
        idRef.current += 1
        const id = idRef.current
        setSnackbars((curr) => [...curr, { id, ...options }])
        return id
    }, [])

    const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <SnackbarHost snackbars={snackbars} onDismiss={dismiss} />
        </SnackbarContext.Provider>
    )
}

SnackbarProvider.propTypes = {
    children: PropTypes.node,
}
