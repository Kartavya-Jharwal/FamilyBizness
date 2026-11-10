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
  if (field) {
    field.value = surname === 'Smith' ? '' : surname;
    field.addEventListener('input', () => {
      surname = normalize(field.value);
      try { localStorage.setItem(key, surname); } catch {}
      apply();
    });
  }
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    surname = read();
    if (field) field.value = surname === 'Smith' ? '' : surname;
    apply();
  });
  apply();
})();
