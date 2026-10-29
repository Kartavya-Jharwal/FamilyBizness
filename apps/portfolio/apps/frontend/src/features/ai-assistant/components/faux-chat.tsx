import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fb/ui";
import { FAUX_AI_OPTIONS, streamAiChat } from "@/adapters/web/ai-streaming";

export function FauxChat() {
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Choose a sample prompt to begin.");
  const [busy, setBusy] = useState(false);
  const current = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      current.current?.abort();
      current.current = null;
    },
    [],
  );

  const cancel = () => {
    current.current?.abort();
    current.current = null;
    setBusy(false);
    setStatus("Preview cancelled. Choose another prompt to restart.");
  };
  async function send(content: string) {
    if (current.current || !content.trim()) return;
    const run = new AbortController();
    current.current = run;
    setBusy(true);
    setPrompt(content);
    setReasoning("");
    setError("");
    setStatus("Playing scripted reasoning…");
    try {
      for await (const event of streamAiChat({ content }, run.signal)) {
        if (current.current !== run) return;
        if (event.type === "reasoningDelta")
          setReasoning((value) => value + event.delta);
        if (event.type === "error") {
          setError(event.message);
          setStatus("Scripted ending reached. You can try another prompt.");
        }
      }
    } catch (failure) {
      if (current.current === run && !run.signal.aborted)
        setStatus("The local preview could not finish. Try again.");
    } finally {
      if (current.current === run) {
        current.current = null;
        setBusy(false);
      }
    }
  }
  return (
    <section
      className="mx-auto flex h-full max-w-4xl flex-col gap-5 overflow-y-auto p-4 pb-[var(--mobile-nav-total-offset)] md:p-6"
      aria-label="Scripted assistant preview"
    >
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Assistant</h1>
          <Badge variant="info-subtle">Scripted preview</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Smoke and mirrors: every prompt plays the same imaginary reasoning and
          ends with a playful technical failure. No AI model is connected, and
          nothing is sent or saved.
        </p>
      </header>
      <div className="flex flex-wrap gap-2" aria-label="Sample prompts">
        {FAUX_AI_OPTIONS.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            disabled={busy}
            onClick={() => void send(option.prompt)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label className="text-sm font-medium" htmlFor="sample-prompt">
          Try a custom sample prompt
        </label>
        <textarea
          id="sample-prompt"
          value={draft}
          maxLength={500}
          disabled={busy}
          onChange={(event) => setDraft(event.target.value)}
          className="bg-input-bg text-foreground border-input focus-visible:ring-ring min-h-24 w-full rounded-md border p-3 text-sm focus-visible:ring-2"
          placeholder="This stays in this preview."
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={busy || !draft.trim()}>
            Play preview
          </Button>
          {busy && (
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel preview
            </Button>
          )}
        </div>
      </form>
      <p role="status" className="text-muted-foreground text-sm">
        {status}
      </p>
      {prompt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your sample prompt</CardTitle>
          </CardHeader>
          <CardContent className="break-words text-sm">{prompt}</CardContent>
        </Card>
      )}
      {(reasoning || busy) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Imaginary reasoning</CardTitle>
          </CardHeader>
          <CardContent
            role="log"
            aria-live="polite"
            className="text-muted-foreground break-words text-sm"
          >
            {reasoning || "Preparing the stage…"}
          </CardContent>
        </Card>
      )}
      {error && (
        <div
          role="alert"
          className="bg-warning-subtle text-warning-subtle-foreground rounded-lg border p-4 text-sm"
        >
          {error}
        </div>
      )}
    </section>
  );
}
