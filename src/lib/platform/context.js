import { createContext, useContext } from "react"
import webAdapter from "./webAdapter"

export const PlatformContext = createContext(webAdapter)

export const usePlatform = () => useContext(PlatformContext)
