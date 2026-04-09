import { Suspense, useEffect } from "react"
import PropTypes from "prop-types"
import { Router, Switch, Route } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import { useLocation } from "wouter"
import PageTransition from "../components/PageTransition"
import Spinner from "../components/Spinner"

import config from "../pages/config"
import { flattenRoutes } from "../pages/configHelpers"
import CatalogPage from "../pages/CatalogPage"

const routes = flattenRoutes(config)

function Redirect({ to }) {
    const [, navigate] = useLocation()
    useEffect(() => {
        navigate(to)
    }, [navigate, to])
    return null
}

Redirect.propTypes = {
    to: PropTypes.string,
}

const Routes = () => (
    <Switch>
        <Route path="/" component={CatalogPage} />
        {routes.map(({ path, component: Component }) => (
            <Route key={path} path={path}>
                <Suspense fallback={<Spinner centered size={48} />}>
                    <Component />
                </Suspense>
            </Route>
        ))}
        <Route>
            <Redirect to="/" />
        </Route>
    </Switch>
)

function AppRoutes() {
    return (
        <PageTransition>
            <Routes />
        </PageTransition>
    )
}

export default function AppRouter() {
    return (
        <Router hook={useHashLocation}>
            <AppRoutes />
        </Router>
    )
}
