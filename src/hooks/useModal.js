import { useState, useCallback, useMemo } from "react"

const useModal = (modalKeys = {}) => {
    // Convert array of keys to object if necessary
    const initialState = Array.isArray(modalKeys)
        ? modalKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
        : modalKeys

    const [modals, setModals] = useState(initialState)

    const openModal = useCallback((modalId) => {
        setModals((prev) => ({ ...prev, [modalId]: true }))
    }, [])

    const closeModal = useCallback((modalId) => {
        setModals((prev) => ({ ...prev, [modalId]: false }))
    }, [])

    const toggleModal = useCallback((modalId) => {
        setModals((prev) => ({ ...prev, [modalId]: !prev[modalId] }))
    }, [])

    // Create handlers object with pre-bound functions for each modal
    const handlers = useMemo(() => {
        const result = {}
        Object.keys(initialState).forEach((modalId) => {
            result[modalId] = {
                open: () => openModal(modalId),
                close: () => closeModal(modalId),
                toggle: () => toggleModal(modalId),
                isOpen: !!modals[modalId],
            }
        })
        return result
    }, [modals, openModal, closeModal, toggleModal, initialState])

    const isOpen = useCallback((modalId) => !!modals[modalId], [modals])

    return {
        modals,
        openModal,
        closeModal,
        toggleModal,
        isOpen,
        handlers,
    }
}

export default useModal
