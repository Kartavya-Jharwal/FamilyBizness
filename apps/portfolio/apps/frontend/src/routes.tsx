import { HashRouter } from "react-router-dom";
import { AppLayout } from "@/pages/layouts/app-layout";
import useNavigationEventListener from "@/hooks/use-navigation-event-listener";

function NavigationEventBridge() {
  useNavigationEventListener();
  return null;
}

export function AppRoutes() {
  return (
    <HashRouter>
      <NavigationEventBridge />
      <AppLayout />
    </HashRouter>
  );
}
