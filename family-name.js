/* Same persistence contract as the portfolio family-name accessor. */
(() => {
  const key = 'familybizness:family-name';
  const normalize = value => value?.trim().slice(0, 60) || 'Smith';
  const read = () => { try { return normalize(localStorage.getItem(key)); } catch { return 'Smith'; } };
  let surname = read();
  const titleTemplate = document.title;
  let previous = 'Smith Family Office';
  const apply = () => {
    const title = `${surname} Family Office`;
    if (title !== previous) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!['SCRIPT', 'STYLE'].includes(node.parentElement?.tagName) && node.textContent.includes(previous)) nodes.push(node);
      }
      nodes.forEach(node => { node.textContent = node.textContent.split(previous).join(title); });
      document.querySelectorAll('[aria-label]').forEach(el => {
        const label = el.getAttribute('aria-label');
        if (label.includes(previous)) el.setAttribute('aria-label', label.split(previous).join(title));
      });
    }
    const pageTitle = titleTemplate.replace('Smith Family Office', title);
    if (document.title !== pageTitle) document.title = pageTitle;
    document.querySelectorAll('meta[property="og:title"]').forEach(meta => { if (meta.content !== title) meta.content = title; });
    previous = title;
  };
  const field = document.getElementById('family-surname');
  const save = value => {
    surname = normalize(value);
    try { localStorage.setItem(key, surname); } catch {}
    apply();
  };
  if (field) {
    field.value = surname === 'Smith' ? '' : surname;
    field.addEventListener('input', () => save(field.value));
  }
  // Asked once per browser; Settings → General changes it afterwards.
  const welcome = document.getElementById('family-welcome');
  const seenKey = 'familybizness:welcome-seen';
  const seen = () => { try { return localStorage.getItem(seenKey) === '1'; } catch { return sessionStorage.getItem?.(seenKey) === '1'; } };
  if (welcome && typeof welcome.showModal === 'function' && !seen()) {
    welcome.addEventListener('close', () => {
      save(welcome.returnValue === 'custom' && field ? field.value : 'Smith');
      try { localStorage.setItem(seenKey, '1'); } catch { try { sessionStorage.setItem(seenKey, '1'); } catch {} }
    });
    welcome.showModal();
  }
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    surname = read();
    if (field) field.value = surname === 'Smith' ? '' : surname;
    apply();
  });
  apply();
})();
