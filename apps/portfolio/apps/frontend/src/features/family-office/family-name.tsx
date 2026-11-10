import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const key = "familybizness:family-name";
const normalize = (value: string | null) => value?.trim().slice(0, 60) || "Smith";
let saved = true;
export let FAMILY_NAME = (() => {
  try { return normalize(localStorage.getItem(key)); }
  catch { saved = false; return "Smith"; }
})();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
function notify() {
  document.title = familyTitle();
  listeners.forEach(listener => listener());
  window.dispatchEvent(new Event("familybizness:family-name"));
}
window.addEventListener("storage", event => {
  if (event.key !== key && event.key !== null) return;
  FAMILY_NAME = normalize(event.newValue);
  saved = true;
  notify();
});
export function familyTitle() { return `${FAMILY_NAME} Family Office`; }
export function setFamilyName(value: string) {
  FAMILY_NAME = normalize(value);
  try { localStorage.setItem(key, FAMILY_NAME); saved = true; }
  catch { saved = false; }
  notify();
}
export function useFamilyName() {
  return useSyncExternalStore(subscribe, () => FAMILY_NAME);
}
export function FamilyNameField() {
  const name = useFamilyName();
  const persisted = useSyncExternalStore(subscribe, () => saved);
  const [draft, setDraft] = useState(name);
  const editing = useRef(false);
  useEffect(() => { if (!editing.current) setDraft(name); }, [name]);
  return <label className="family-form-row">
    <span>Family surname</span>
    <input aria-label="Family surname" maxLength={60} value={draft}
      onFocus={() => { editing.current = true; }}
      onChange={event => { setDraft(event.target.value); setFamilyName(event.target.value); }}
      onBlur={() => { editing.current = false; setDraft(FAMILY_NAME); }} />
    <span role="status">{familyTitle()} · {persisted ? "Saved automatically in this browser" : "Used for this visit only; browser storage is unavailable"}</span>
  </label>;
}
