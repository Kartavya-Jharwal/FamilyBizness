export function getCurrentWindow() {
  return { isFullscreen: async () => false, setFullscreen: async () => undefined, listen: async () => () => {} };
}
export function getCurrentWebviewWindow() { return getCurrentWindow(); }
export async function invoke() { return undefined; }
export async function listen() { return () => {}; }
export async function open() { return null; }
export async function readFile() { return new Uint8Array(); }
export async function cancel() { return undefined; }
export async function requestPermissions() { return "granted"; }
export async function checkPermissions() { return "granted"; }
export async function scan() { return { content: "", format: "QR_CODE" }; }
export const clearMocks = () => {};
export const mockIPC = () => {};
export default { impactFeedback: async () => undefined, notificationFeedback: async () => undefined, selectionFeedback: async () => undefined };
