import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import Wallet from "../../pages/prototypes/Wallet"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: Wallet,
})
