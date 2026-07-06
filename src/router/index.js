import { Suspense, useEffect } from "react"
import PropTypes from "prop-types"
import { Router, Switch, Route } from "wouter"
import { useHashLocation } from "wouter/use-hash-location"
import { useLocation } from "wouter"
import PageTransition from "../components/PageTransition"
import { useFrozenLocation } from "../components/PageTransition/context"
import PageSkeleton from "../components/PageSkeleton"
import SkinSwitcher from "../components/SkinSwitcher"
import ErrorBoundary from "../components/ErrorBoundary"
import RouteErrorFallback from "./RouteErrorFallback"

import SplitView from "../components/SplitView"
import SplitViewPlaceholder from "../components/SplitView/Placeholder"
import CatalogList from "../components/CatalogList"
import useSplitView from "../hooks/useSplitView"

import Page from "../components/Page"
import config from "../pages/config"
import { flattenRoutes, isSplitEligible } from "../pages/configHelpers"
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

const Routes = () => {
    const [liveLocation] = useLocation()
    // Inside PageTransition, match against the screen's frozen location: the
    // exiting copy must keep rendering ITS route during the crossfade instead
    // of snapping to the new one.
    const location = useFrozenLocation() ?? liveLocation
    return (
        <ErrorBoundary fallback={<RouteErrorFallback />} resetKeys={[location]}>
            <Switch location={location}>
                <Route path="/" component={CatalogPage} />
                {routes.map(
                    ({ path, component: Component, skeleton: Fallback }) => (
                        <Route key={path} path={path}>
                            <Suspense
                                fallback={
                                    Fallback ? <Fallback /> : <PageSkeleton />
                                }
                            >
                                <Component />
                            </Suspense>
                        </Route>
                    )
                )}
                <Route>
                    <Redirect to="/" />
                </Route>
            </Switch>
        </ErrorBoundary>
    )
}

function AppRoutes() {
    const [location] = useLocation()
    const showSkinSwitcher = location.startsWith("/showcase/")
    const isWide = useSplitView()

    const stack = (contained) => (
        <>
            <PageTransition contained={contained} bottomInset={showSkinSwitcher}>
                <Routes />
            </PageTransition>
            {showSkinSwitcher && <SkinSwitcher />}
        </>
    )

    // Narrow viewport: keep the single-column stack (also a safety net for any
    // route that opts out of split-view via isSplitEligible).
    if (!isWide || !isSplitEligible(location)) {
        return stack(false)
    }

    // Shell owns the TWA chrome in split mode; detail-pane <Page>s defer to it.
    // The chrome <Page> is a sibling keyed on location so it re-asserts the
    // shell header/background on every navigation (resetting anything a detail
    // demo mutated directly, e.g. NavigationBar's color picker) without
    // remounting SplitView or the sidebar.
    return (
        <>
            <Page mode="secondary" key={location} />
            <SplitView>
                <SplitView.Sidebar>
                    <CatalogList />
                </SplitView.Sidebar>
                <SplitView.Detail>
                    {location === "/" ? <SplitViewPlaceholder /> : stack(true)}
                </SplitView.Detail>
            </SplitView>
        </>
    )
}

export default function AppRouter() {
    return (
        <Router hook={useHashLocation}>
            <AppRoutes />
        </Router>
    )
}
