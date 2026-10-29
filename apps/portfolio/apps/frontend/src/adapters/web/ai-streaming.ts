/** Scripted in-browser assistant. No model, tool, portfolio write or network call. */
import type {
  AiSendMessageRequest,
  AiStreamEvent,
} from "@/features/ai-assistant/types";
export const FAUX_AI_REASONING = [
  "Opening the imaginary ledger. ",
  "Cross-checking three fictional custodians. ",
  "Polishing a purely theatrical answer. ",
] as const;
export const FAUX_AI_ERROR =
  "DEMO-418: Teapot refused to brew alpha. The imaginary spreadsheet spilled its coffee. This is the scripted ending; no AI model was called.";
export const FAUX_AI_OPTIONS = [
  {
    id: "net-worth",
    label: "Summarise net worth",
    prompt: "Summarise this sample portfolio.",
  },
  {
    id: "rebalance",
    label: "Explore a rebalance",
    prompt: "Explore a fictional rebalance.",
  },
  {
    id: "risk",
    label: "Explain portfolio risk",
    prompt: "Explain this sample risk profile.",
  },
  {
    id: "cash",
    label: "Review cash",
    prompt: "Review the sample cash allocation.",
  },
] as const;
function pause(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, 450);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
export async function* streamAiChat(
  request: AiSendMessageRequest,
  signal?: AbortSignal,
): AsyncGenerator<AiStreamEvent> {
  if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  const correlation = {
    threadId: request.threadId ?? "scripted-preview",
    runId: crypto.randomUUID(),
    messageId: crypto.randomUUID(),
  };
  yield { type: "system", ...correlation };
  for (const delta of FAUX_AI_REASONING) {
    await pause(signal);
    yield { type: "reasoningDelta", ...correlation, delta };
  }
  await pause(signal);
  yield {
    type: "error",
    ...correlation,
    code: "demoTheatre",
    message: FAUX_AI_ERROR,
  };
  // Error is terminal. No malformed success/done message follows it.
}
