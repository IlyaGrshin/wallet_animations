import React, { useEffect, useState } from "react"
import { Router, Route, Switch, useLocation } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import "./index.css"

import UI from "./pages/UI"
import Wallet from "./pages/Wallet"
import TONSpace from "./pages/TS"
import Onboarding from "./pages/Onboarding"
import NewNavigation from "./pages/NewNavigation"
import ColorChanging from "./pages/ColorChanging"
import TextPage from "./pages/TextPage"
import TabBar from "./pages/TabBar"
import Picker from "./pages/Picker"

// Модифицированный хук для работы с View Transitions API
const useTransitionHashLocation = () => {
    const [location, setLocation] = useHashLocation()
    const [isPending, setIsPending] = useState(false)

    const navigate = (to) => {
        // Проверяем поддержку View Transitions API
        if (!document.startViewTransition) {
            setLocation(to)
            return
        }

        if (location === to) return
        setIsPending(true)

        // Используем View Transitions API
        document.startViewTransition(async () => {
            setLocation(to)
            setIsPending(false)
        })
    }

    return [location, navigate, isPending]
}

function App() {
    const [location, navigate] = useTransitionHashLocation()

    // Переопределяем глобальную навигацию для поддержки View Transitions API
    useEffect(() => {
        const originalPushState = history.pushState

        // Перехватываем изменения хэша
        const handleHashChange = (e) => {
            const newHash = window.location.hash.slice(1)
            if (newHash !== location) {
                e.preventDefault()
                navigate(newHash || "/")
            }
        }

        // Перехватываем programmatic навигацию
        history.pushState = function (state, title, url) {
            if (url.includes("#")) {
                const newHash = url.split("#")[1]
                navigate(newHash || "/")
                return originalPushState.apply(history, [state, title, url])
            }
            return originalPushState.apply(history, arguments)
        }

        window.addEventListener("hashchange", handleHashChange)

        return () => {
            window.removeEventListener("hashchange", handleHashChange)
            history.pushState = originalPushState
        }
    }, [location, navigate])

    return (
        <Router hook={useTransitionHashLocation}>
            <div className="page-container">
                <Switch key={location}>
                    <Route path="/" component={UI} />
                    <Route path="/wallet" component={Wallet} />
                    <Route path="/tonspace" component={TONSpace} />
                    <Route path="/onboarding" component={Onboarding} />
                    <Route path="/textpage" component={TextPage} />
                    <Route path="/newnavigation" component={NewNavigation} />
                    <Route path="/colorchanging" component={ColorChanging} />
                    <Route path="/tabbar" component={TabBar} />
                    <Route path="/picker" component={Picker} />
                    <Route path="*" component={UI} />
                </Switch>
            </div>
        </Router>
    )
}

export default App
