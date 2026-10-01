// Combine several refs (callback or object, any may be empty) into one
// callback ref, e.g. a component's own ref plus one passed in by a parent.
export const mergeRefs =
    (...refs) =>
    (node) => {
        for (const ref of refs) {
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
        }
    }
