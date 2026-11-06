/* Same persistence contract as the portfolio family-name accessor. */
(() => {
  const key = 'familybizness:family-name';
  const read = () => { try { return localStorage.getItem(key)?.trim() || 'Your'; } catch { return 'Your'; } };
  let previous = 'Your Family Office';
  const apply = () => {
    const title = `${read()} Family Office`;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (!['SCRIPT', 'STYLE'].includes(walker.currentNode.parentElement?.tagName)) nodes.push(walker.currentNode);
    nodes.forEach(node => { node.textContent = node.textContent.split(previous).join(title); });
    document.title = title;
    document.querySelectorAll('meta[property="og:title"]').forEach(meta => meta.content = title);
    document.querySelectorAll('[aria-label]').forEach(el => el.setAttribute('aria-label', el.getAttribute('aria-label').split(previous).join(title)));
    previous = title;
  };
  const field = document.getElementById('family-surname');
  if (field) {
    field.value = read();
    field.addEventListener('input', () => { try { localStorage.setItem(key, field.value.trim().slice(0,60) || 'Your'); } catch {} apply(); });
  }
  window.addEventListener('storage', apply);
  apply();
})();
