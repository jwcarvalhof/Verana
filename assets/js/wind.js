/* VÉRANA · vento entre lugares
   Ao pular para uma seção ou trocar de página, a tela se desfaz num sopro e reaparece no destino,
   sem passar pelas animações do caminho. Com movimento reduzido, o salto é direto. */
(() => {
  'use strict';
  const html = document.documentElement;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OUT = 520, IN = 820;
  let gust = null, tIn = null;

  function ensure() {
    if (gust) return;
    gust = document.createElement('div');
    gust.className = 'gust'; gust.setAttribute('aria-hidden', 'true');
    // fios de vento: posição, comprimento e atraso variam a cada um
    gust.innerHTML = Array.from({ length: 16 }, () =>
      `<i style="--t:${(4 + Math.random() * 92).toFixed(1)}%;--w:${(16 + Math.random() * 38).toFixed(0)}vw;--dl:${(Math.random() * .2).toFixed(2)}s;--h:${Math.random() < .25 ? 2 : 1}px"></i>`).join('');
    document.body.appendChild(gust);
  }
  function out(cb) {
    if (calm()) { cb && cb(); return; }
    ensure(); clearTimeout(tIn);
    html.classList.remove('wind-in'); void html.offsetWidth; html.classList.add('wind-out');
    setTimeout(() => cb && cb(), OUT);
  }
  function arrive() {
    html.classList.remove('wind-out');
    if (calm()) return;
    ensure(); void html.offsetWidth; html.classList.add('wind-in');
    clearTimeout(tIn); tIn = setTimeout(() => html.classList.remove('wind-in'), IN + 120);
  }
  // mesma página: sopra, salta sem rolagem animada, chega
  function jump(y, land) {
    out(() => {
      const sb = html.style.scrollBehavior; html.style.scrollBehavior = 'auto';
      window.scrollTo(0, Math.max(0, y));
      html.style.scrollBehavior = sb;
      land && land();
      arrive();
    });
  }
  // outra página: sopra e só então navega; a próxima página chega com o vento
  function go(url) {
    try { sessionStorage.setItem('verana-wind', '1'); } catch (_) {}
    out(() => { location.href = url; });
  }
  function pending() {
    try { const v = sessionStorage.getItem('verana-wind') === '1'; sessionStorage.removeItem('verana-wind'); return v; } catch (_) { return false; }
  }
  // voltar pelo navegador com a página guardada em memória: nunca fica presa no meio do sopro
  addEventListener('pageshow', e => { if (e.persisted) arrive(); });

  // links para outra página do site (não âncoras da mesma página)
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    if (u.pathname === location.pathname && u.search === location.search) return; // âncora local: cada página cuida
    e.preventDefault(); go(u.href);
  });

  window.VRWind = { out, arrive, jump, go, pending };
})();
