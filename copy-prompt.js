/* <copy-prompt src?> — collapsed prompt with a Copy button. Copies the file at `src` when it loads, otherwise the element's own text. */
class CopyPrompt extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    let text = this.textContent.trim().replace(/\s+\n/g, '\n');
    this.textContent = '';
    const details = document.createElement('details');
    details.className = 'fork-details';
    const summary = document.createElement('summary');
    const words = () => text.split(/\s+/).filter(Boolean).length.toLocaleString('en-GB');
    summary.textContent = `Read the setup plan prompt (${words()} words)`;
    const pre = document.createElement('pre');
    pre.className = 'copy-prompt-text';
    pre.tabIndex = 0;
    pre.textContent = text;
    details.append(summary, pre);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary copy-prompt-button';
    button.textContent = 'Copy prompt';
    const status = document.createElement('span');
    status.className = 'copy-prompt-status';
    status.setAttribute('role', 'status');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = `Copied ${words()} words. Paste it into your own Claude.`;
      } catch {
        details.open = true;
        const range = document.createRange();
        range.selectNodeContents(pre);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'Selected. Press Ctrl+C or ⌘C to copy.';
      }
    });
    const actions = document.createElement('div');
    actions.className = 'copy-prompt-actions';
    actions.append(button, status);
    this.append(actions, details);
    const src = this.getAttribute('src');
    if (src) fetch(src).then(response => response.ok ? response.text() : Promise.reject()).then(body => {
      text = body.trim();
      pre.textContent = text;
      summary.textContent = `Read the setup plan prompt (${words()} words)`;
    }).catch(() => {});
  }
}
customElements.define('copy-prompt', CopyPrompt);
