import { useState } from "react"

export const useKeepAliveTabs = (currentKey) => {
    const [visited, setVisited] = useState([currentKey])
    const [exiting, setExiting] = useState([])
    const [prevKey, setPrevKey] = useState(currentKey)

    if (currentKey !== prevKey) {
        setPrevKey(currentKey)
        setVisited((keys) =>
            keys.includes(currentKey) ? keys : [...keys, currentKey]
        )
        setExiting((keys) => [
            ...keys.filter((key) => key !== currentKey && key !== prevKey),
            prevKey,
        ])
    }

    const statusOf = (key) => {
        if (key === currentKey) return "active"
        return exiting.includes(key) ? "exiting" : "hidden"
    }

    const markExited = (key) =>
        setExiting((keys) => keys.filter((k) => k !== key))

    return { visited, statusOf, markExited }
}
