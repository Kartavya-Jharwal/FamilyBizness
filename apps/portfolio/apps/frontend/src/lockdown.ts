const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  !!el.closest('input, textarea, [contenteditable="true"], .allow-select, .select-all');
export function installLockdown() {
  document.documentElement.classList.add("app-lockdown");
  window.addEventListener("contextmenu", (e) => { if (!isEditable(e.target)) e.preventDefault(); }, { capture: true });
  window.addEventListener("keydown", (e) => {
    if (isEditable(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === "f11") { e.preventDefault(); return; }
    if ((e.metaKey || e.ctrlKey) && ["a","x","s","p"].includes(k)) e.preventDefault();
    if (k === "contextmenu" || (e.shiftKey && k === "f10")) e.preventDefault();
  });
  window.addEventListener("dragstart", (e) => e.preventDefault());
}
