/**
 * Static demo event adapters — no SSE. Listeners resolve immediately as no-ops
 * so boot / useGlobalEventListener never hang waiting for /api/v1/events/stream.
 */

import type { EventCallback, UnlistenFn } from "../types";

const noopUnlisten: UnlistenFn = () => Promise.resolve();

function noopListen<T>(_handler: EventCallback<T>): Promise<UnlistenFn> {
  return Promise.resolve(noopUnlisten);
}

export const listenPortfolioUpdateStart = noopListen;
export const listenPortfolioUpdateComplete = noopListen;
export const listenPortfolioUpdateError = noopListen;
export const listenMarketSyncStart = noopListen;
export const listenMarketSyncComplete = noopListen;
export const listenMarketSyncError = noopListen;
export const listenDeviceSyncRestore = noopListen;
export const listenAssetClassificationsChanged = noopListen;
export const listenBrokerSyncStart = noopListen;
export const listenBrokerSyncComplete = noopListen;
export const listenBrokerSyncError = noopListen;

export const listenBackButton = (_handler: () => void): Promise<UnlistenFn> => {
  return Promise.resolve(noopUnlisten);
};

export const listenFileDropHover = noopListen;
export const listenFileDrop = noopListen;
export const listenFileDropCancelled = noopListen;
export const listenDatabaseRestored = noopListen;
export const listenNavigateToRoute = noopListen;
export const listenDeepLink = noopListen;

export const getCurrentDeepLinks = (): Promise<string[]> => {
  return Promise.resolve([]);
};
