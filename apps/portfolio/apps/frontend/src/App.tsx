import { ActivitySplitReviewProvider } from "@/features/spending/components/activity-split-review-provider";
import { ProfileShell } from "@/features/profiles/profile-shell";
import { setAddonQueryClient } from "@/addons/addons-runtime-context";
import { AssetLogoRegistrySync } from "@/components/asset-logo-registry-sync";
import { Toaster } from "@/components/sonner";
import { EventDialogProvider } from "@/features/spending/components/event-dialog-provider";
import { AppDirectionProvider } from "@/i18n/direction";
import { SettingsProvider } from "@/lib/settings-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@fb/ui";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { PrivacyProvider } from "./context/privacy-context";
import { DemoAuthProvider } from "./context/auth-context";
import { AppRoutes } from "./routes";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            retry: false,
          },
        },
      }),
  );

  setAddonQueryClient(queryClient as unknown as Parameters<typeof setAddonQueryClient>[0]);

  return (
    <AppDirectionProvider>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <DemoAuthProvider><ProfileShell>
            <SettingsProvider>
              <PrivacyProvider>
                <TooltipProvider>
                  <Toaster mobileOffset={{ top: "68px" }} closeButton expand={false} />
                  <ActivitySplitReviewProvider>
                    <EventDialogProvider>
                      <AssetLogoRegistrySync />
                      <AppRoutes />
                    </EventDialogProvider>
                  </ActivitySplitReviewProvider>
                </TooltipProvider>
              </PrivacyProvider>
            </SettingsProvider>
          </ProfileShell></DemoAuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </AppDirectionProvider>
  );
}

export default App;
