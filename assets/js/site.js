/* VÉRANA · interações da página (sem dependências)
   Página única em PT e EN: o seletor troca textos, fotos, destinos, preços e moeda. */
(() => {
  'use strict';
  const DATA = JSON.parse(document.getElementById('page-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const fmt = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

  const html0 = document.documentElement;
  let LANG = html0.dataset.lang === 'en' ? 'en' : 'pt';
  // reserva vinda da página completa: #book=id&in=...&out=...&g=...
  const BOOKQ = new URLSearchParams(location.hash.indexOf('book=') > 0 ? location.hash.slice(1) : location.search);
  const BOOK = { id: BOOKQ.get('book') || '', in: BOOKQ.get('in') || '', out: BOOKQ.get('out') || '', g: BOOKQ.get('g') || '' };
  let C = DATA[LANG];

  function imgUrls(src, small) {
    const i = src.indexOf(':'), kind = src.slice(0, i), val = src.slice(i + 1);
    if (kind === 'u') {
      const base = `https://images.unsplash.com/${val}?auto=format&fit=crop&q=72`;
      if (small) return [`${base}&w=480`, ''];
      return [`${base}&w=1600`, [640, 960, 1280, 1600, 2000, 2600].map(w => `${base}&w=${w} ${w}w`).join(', ')];
    }
    if (kind === 'c') {
      const [path, maxw] = val.split('|'); const name = path.split('/').pop();
      const thumb = w => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${w}px-${name}`;
      const ws = [960, 1280, 1920].filter(w => w < +maxw);
      if (small) return [thumb(960), ''];
      return [thumb(ws[ws.length - 1]), ws.map(w => `${thumb(w)} ${w}w`).join(', ') + `, https://upload.wikimedia.org/wikipedia/commons/${path} ${maxw}w`];
    }
    return [val, ''];
  }
  const money = v => (C.currency === 'BRL' ? 'R$ ' : 'US$ ') + new Intl.NumberFormat(C.locale).format(v);

  // se um tamanho de foto falhar no servidor externo, volta para a versão padrão
  document.addEventListener('error', e => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.hasAttribute('srcset') && !img.dataset.fallback) { img.dataset.fallback = '1'; img.removeAttribute('srcset'); img.src = img.src; }
  }, true);

  /* ---------- Troca de idioma ---------- */
  function applyLang(lang, { save = true } = {}) {
    LANG = lang; C = DATA[lang];
    const html = document.documentElement;
    html.lang = C.lang; html.dataset.lang = lang;
    document.title = C.meta.title;
    $('meta[name="description"]').setAttribute('content', C.meta.description);
    $$('[data-t]').forEach(el => { const v = get(C, el.dataset.t); if (v != null && el.textContent !== String(v)) el.textContent = v; });
    $$('[data-ta]').forEach(el => el.dataset.ta.split(';').forEach(pair => { const [a, p] = pair.split(':'); const v = get(C, p); if (v != null) el.setAttribute(a, v); }));
    $$('[data-img]').forEach(img => {
      const im = get(C, img.dataset.img); if (!im) return;
      const small = img.hasAttribute('data-img-small');
      const [src, set] = imgUrls(im.src, small);
      if (img.getAttribute('src') !== src) { if (set) img.srcset = set; else img.removeAttribute('srcset'); img.src = src; }
      if (!small) img.alt = im.alt;
      img.style.objectPosition = im.pos || '50% 50%';
    });
    $$('[data-price]').forEach(el => { el.textContent = money(get(C, el.dataset.price)); });
    $$('[data-ph]').forEach(el => { el.dataset.phText = C.form.datePh; });
    $$('[data-lang-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang)));
    renderCredits();
    dateFmt = new Intl.DateTimeFormat(C.locale, { day: 'numeric', month: 'short', year: 'numeric' });
    paintDate(fin); paintDate(fout); paintGuests();
    if (!results.hidden) { results.hidden = true; }
    clearError();
    zCache.active = -1; setActiveSeason(Math.max(0, Math.round(zCache.f < 0 ? 0 : zCache.f)));
    if (save) {
      try { localStorage.setItem('verana-lang', lang); } catch (_) {}
      const u = new URL(location.href);
      if (lang === 'en') u.searchParams.set('lang', 'en'); else u.searchParams.delete('lang');
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    }
    if (typeof paintDests === 'function') paintDests();
    if (typeof paintFavs === 'function') paintFavs();
    if (sheet && sheet.open) setView(SH.view, { instant: true });
    html.classList.remove('lang-pending');
    if (armed) { measure(); readScroll(); }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang-btn]');
    if (b && b.dataset.langBtn !== LANG) applyLang(b.dataset.langBtn);
  });

  function renderCredits() {
    const used = [C.hero.image, C.closing.image, ...C.story.scenes.map(s => s.image), ...C.seasons.items.map(s => s.image), ...C.stays.items.flatMap(s => [s.image, ...(s.gallery || [])]), ...C.destinations.items.map(d => d.image)].map(i => i.src);
    const seen = new Set();
    $('[data-credits]').innerHTML = used.filter(s => !seen.has(s) && seen.add(s) && DATA.credits[s]).map(s => {
      const c = DATA.credits[s];
      const lic = c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" rel="license noopener" target="_blank">${esc(c.license)}</a>` : esc(c.license);
      return `<li>${esc(c.place)} · <a href="${esc(c.page)}" rel="noopener" target="_blank">${esc(c.author)}</a> · ${lic}</li>`;
    }).join('');
  }

  /* ---------- Modo: animações presas ao scroll só em telas grandes, sem movimento reduzido ---------- */
  const MQ = ['(max-width: 960px)', '(prefers-reduced-motion: reduce)', '(max-height: 520px)'].map(q => matchMedia(q));
  const isStatic = () => MQ.some(m => m.matches);
  const calm = () => MQ[1].matches; // movimento reduzido
  const wait = ms => calm() ? 0 : ms;

  /* ---------- Abertura: logo e uma linha, só na primeira visita da sessão ---------- */
  (() => {
    const html = document.documentElement, intro = $('[data-intro]');
    if (!html.classList.contains('intro-on') || !intro) return;
    try { sessionStorage.setItem('verana-intro', '1'); } catch (_) {}
    const end = () => { html.classList.remove('intro-on'); html.classList.add('intro-done'); };
    intro.addEventListener('animationend', e => { if (e.target === intro) end(); });
    intro.addEventListener('click', () => { intro.style.animation = 'introOut .35s var(--ease-soft) forwards'; });
    setTimeout(end, 2600); // segurança, caso a animação não termine
  })();

  /* ---------- Header ---------- */
  const header = $('[data-header]');
  const hero = $('.hero');
  let headerSolid = null;
  function updateHeader() {
    const solid = window.scrollY > (hero ? hero.offsetHeight - 90 : 40);
    if (solid !== headerSolid) { headerSolid = solid; header.classList.toggle('is-solid', solid); header.classList.toggle('is-over', !solid); }
  }
  const menuBtn = $('[data-menu-btn]');
  const mnav = $('[data-mnav]');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    mnav.hidden = !open;
    header.classList.toggle('menu-open', open);
    $('[data-menu-label]').textContent = open ? C.ui.closeMenu : C.ui.menu;
  }
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Formulário ---------- */
  const form = $('[data-booking]');
  const dest = $('#f-dest');
  const list = $('#f-dest-list');
  const err = $('#f-error');
  const fin = $('#f-in'), fout = $('#f-out');
  const guestsBtn = $('#f-guests'), guestsPop = $('#f-guests-pop');
  const guests = { adults: 2, children: 0 };
  let guestsTouched = false;

  const opts = $$('li', list);
  let active = -1;
  function showList(show) { list.hidden = !show; dest.setAttribute('aria-expanded', String(show)); if (!show) setActive(-1); }
  function filterList() {
    const q = norm(dest.value); let any = false;
    opts.forEach(li => { const ok = !q || norm(li.dataset.value).includes(q); li.hidden = !ok; any = any || ok; });
    showList(any);
  }
  function setActive(i) {
    const vis = opts.filter(li => !li.hidden);
    opts.forEach(li => li.removeAttribute('aria-selected'));
    active = i;
    if (i >= 0 && vis[i]) { vis[i].setAttribute('aria-selected', 'true'); dest.setAttribute('aria-activedescendant', vis[i].id); vis[i].scrollIntoView({ block: 'nearest' }); }
    else dest.removeAttribute('aria-activedescendant');
  }
  function choose(li) { dest.value = li.dataset.value; showList(false); clearError(); }
  dest.addEventListener('focus', filterList);
  dest.addEventListener('input', () => { filterList(); setActive(-1); clearError(); });
  dest.addEventListener('keydown', e => {
    const vis = opts.filter(li => !li.hidden);
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) filterList(); setActive(Math.min(vis.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(0, active - 1)); }
    else if (e.key === 'Enter' && !list.hidden && active >= 0) { e.preventDefault(); choose(vis[active]); }
    else if (e.key === 'Escape') showList(false);
  });
  list.addEventListener('mousedown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); choose(li); } });
  dest.addEventListener('blur', () => setTimeout(() => showList(false), 120));

  const toISO = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  fin.min = toISO(today);
  fout.min = toISO(new Date(today.getTime() + 864e5));
  let dateFmt = new Intl.DateTimeFormat(C.locale, { day: 'numeric', month: 'short', year: 'numeric' });
  function paintDate(input) {
    const disp = input.parentElement.querySelector('.field__display');
    if (input.value) {
      const [y, m, d] = input.value.split('-').map(Number);
      disp.textContent = dateFmt.format(new Date(y, m - 1, d)); disp.classList.add('has-value');
    } else { disp.textContent = C.form.datePh; disp.classList.remove('has-value'); }
  }
  [fin, fout].forEach(input => {
    const pick = () => { try { input.showPicker && input.showPicker(); } catch (_) {} };
    input.addEventListener('click', pick);
    input.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    input.addEventListener('change', () => {
      if (input === fin && fin.value) {
        const next = new Date(fin.value + 'T00:00'); next.setDate(next.getDate() + 1);
        fout.min = toISO(next);
        if (fout.value && fout.value <= fin.value) { fout.value = ''; paintDate(fout); }
      }
      paintDate(input); clearError();
    });
  });

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  function guestsText() {
    const F = C.form;
    return guests.children ? `${plural(guests.adults, F.adultOne, F.adultMany)}, ${plural(guests.children, F.childOne, F.childMany)}` : plural(guests.adults, F.guestOne, F.guestMany);
  }
  function paintGuests() {
    $$('[data-stepper]', guestsPop).forEach(st => {
      const k = st.dataset.stepper, v = guests[k];
      $('output', st).textContent = v;
      $('[data-step="-1"]', st).disabled = v <= +st.dataset.min;
      $('[data-step="1"]', st).disabled = v >= +st.dataset.max;
    });
    $('[data-guests-summary]').textContent = guestsTouched ? guestsText() : C.form.guestsPh;
    guestsBtn.classList.toggle('has-value', guestsTouched);
  }
  function setGuestsOpen(open) {
    guestsPop.hidden = !open;
    guestsBtn.setAttribute('aria-expanded', String(open));
    if (open) { guestsTouched = true; paintGuests(); $('[data-step="1"]', guestsPop).focus(); }
  }
  guestsBtn.addEventListener('click', () => setGuestsOpen(guestsPop.hidden));
  guestsPop.addEventListener('click', e => {
    const b = e.target.closest('[data-step]');
    if (b) { const st = b.closest('[data-stepper]'); const k = st.dataset.stepper; guests[k] = clamp(guests[k] + +b.dataset.step, +st.dataset.min, +st.dataset.max); paintGuests(); }
    if (e.target.closest('[data-guests-done]')) { setGuestsOpen(false); guestsBtn.focus(); }
  });
  guestsPop.addEventListener('keydown', e => { if (e.key === 'Escape') { setGuestsOpen(false); guestsBtn.focus(); } });
  document.addEventListener('click', e => { if (!guestsPop.hidden && !e.target.closest('[data-field="guests"]')) setGuestsOpen(false); });

  function clearError() { err.textContent = ''; $$('.field.is-invalid', form).forEach(f => f.classList.remove('is-invalid')); dest.removeAttribute('aria-invalid'); }
  function fail(msg, field) { err.textContent = msg; if (field) { field.closest('.field').classList.add('is-invalid'); field.setAttribute('aria-invalid', 'true'); field.focus(); } }

  /* ---------- Busca demonstrativa ---------- */
  const results = $('[data-results]');
  function cardHTML(s, i, k) {
    const [src, srcset] = imgUrls(s.image.src);
    const feats = s.features.map(([k, t]) => `<li>${icon(k)}<span>${esc(t)}</span></li>`).join('');
    const on = favs.has(s.id);
    return `<article class="stay reveal in done pop" style="--d:${(k || 0) * 80}ms">
      <div class="stay__media"><img class="stay__img" src="${esc(src)}" ${srcset ? `srcset="${esc(srcset)}" sizes="(max-width: 640px) 92vw, (max-width: 1180px) 46vw, 340px"` : ''} alt="${esc(s.image.alt)}" loading="lazy" decoding="async" style="object-position:${s.image.pos}"><button class="fav" type="button" data-fav="${i}" aria-pressed="${on}" aria-label="${esc(on ? C.fav.remove : C.fav.add)}">${icon('heart')}</button></div>
      <div class="stay__body">
        <div class="stay__head"><h3 class="stay__name">${esc(s.name)}</h3><span class="stay__rating">${icon('star', 'icon icon--star')}${esc(s.rating)} <span class="muted">(${s.reviews})</span></span></div>
        <p class="stay__where">${icon('pin', 'icon icon--sm')}${esc(s.where)}</p>
        <ul class="stay__features">${feats}</ul>
        <div class="stay__foot"><p class="stay__price"><strong>${money(s.price)}</strong> <span>/ ${esc(C.ui.perNight)}</span></p>
        <button class="btn btn--ghost btn--sm" type="button" data-open-stay="${i}">${esc(C.ui.viewStay)}${icon('arrow', 'icon icon--sm')}</button></div>
      </div></article>`;
  }
  const STOP = ['de', 'do', 'da', 'e', 'em', 'na', 'no', 'the', 'and', 'in', 'of'];
  function search(q) {
    const words = norm(q).split(' ').filter(w => w.length > 1 && !STOP.includes(w));
    if (!words.length) return [];
    return C.stays.items.map((s, i) => {
      const hay = norm(s.keywords + ' ' + s.where + ' ' + s.name);
      return { i, score: words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).map(x => x.i);
  }
  function runSearch() {
    clearError();
    const q = dest.value.trim();
    if (!q) return fail(C.form.errDestination, dest);
    if (fin.value && fout.value && fout.value <= fin.value) return fail(C.form.errDates, fout);
    const total = guests.adults + guests.children;
    let found = search(q);
    const note = $('[data-results-note]'); note.hidden = true;
    if (found.length && guestsTouched) {
      const fit = found.filter(i => C.stays.items[i].guests >= total);
      if (!fit.length) { note.textContent = C.results.capacity; note.hidden = false; } else found = fit;
    }
    const title = $('[data-results-title]'), grid = $('[data-results-grid]');
    if (found.length) {
      title.textContent = fmt(found.length === 1 ? C.results.foundOne : C.results.found, { n: found.length, destination: q });
      grid.innerHTML = found.map((i, k) => cardHTML(C.stays.items[i], i, k)).join('');
    } else {
      title.textContent = C.results.empty;
      grid.innerHTML = `<div class="results__empty"><a class="btn btn--ghost btn--sm" href="#seasons">${esc(C.results.seeSeasons)}${icon('arrow', 'icon icon--sm')}</a></div>`;
    }
    const parts = [];
    if (fin.value && fout.value) {
      const n = Math.round((new Date(fout.value) - new Date(fin.value)) / 864e5);
      parts.push(`${$('[data-field="checkin"] .field__display').textContent} → ${$('[data-field="checkout"] .field__display').textContent} · ${n} ${n === 1 ? C.form.nights1 : C.form.nightsN}`);
    } else if (fin.value) parts.push($('[data-field="checkin"] .field__display').textContent);
    if (guestsTouched) parts.push(guestsText());
    $('[data-results-meta]').textContent = parts.join(' · ');
    results.hidden = false;
    if (armed) measure();
    results.scrollIntoView({ behavior: isStatic() ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => title.focus({ preventScroll: true }), 450);
  }
  form.addEventListener('submit', e => { e.preventDefault(); showList(false); setGuestsOpen(false); runSearch(); });
  $('[data-results-clear]').addEventListener('click', () => {
    results.hidden = true; if (armed) measure();
    form.scrollIntoView({ behavior: isStatic() ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => dest.focus({ preventScroll: true }), 400);
  });
  $$('[data-focus-search]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); setMenu(false);
    closeSheet();
    const r = form.getBoundingClientRect();
    windTo(scrollY + r.top - Math.max(90, (innerHeight - r.height) / 2), () => dest.focus({ preventScroll: true }));
  }));

  /* ---------- Saltos para seções: a tela se desfaz no vento e reaparece no destino ---------- */
  function windTo(y, after) {
    const land = () => {
      updateHeader();
      if (armed) { readScroll(); shown.s = target.s; shown.z = target.z; storyFrame(shown.s); seasonFrame(shown.z); }
      // o que está no destino já chega pronto, sem esperar a própria entrada
      $$('.reveal:not(.in)').forEach(el => { const b = el.getBoundingClientRect(); if (b.top < innerHeight && b.bottom > 0) { el.classList.add('in', 'done'); io.unobserve(el); } });
      after && after();
    };
    if (window.VRWind) VRWind.jump(y, land); else { window.scrollTo(0, y); land(); }
  }
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute('data-focus-search')) return;
    const id = a.getAttribute('href').slice(1); if (!id || id === 'main') return;
    const el = id === 'top' ? document.body : document.getElementById(id); if (!el) return;
    e.preventDefault(); setMenu(false); closeSheet();
    const y = id === 'top' ? 0 : scrollY + el.getBoundingClientRect().top - (id === 'seasons' || id === 'moments' ? 0 : 76);
    windTo(y);
    history.replaceState(null, '', location.pathname + location.search + (id === 'top' ? '' : '#' + id));
  });
  $$('[data-season-search]').forEach(b => b.addEventListener('click', () => { dest.value = C.seasons.items[+b.dataset.seasonSearch].search; runSearch(); }));

  /* ---------- Painel da hospedagem: detalhes, reserva e confirmação ---------- */
  const sheet = $('[data-sheet]');
  const shBody = $('[data-sh-body]', sheet);
  const shBg = $('[data-sh-bg]', sheet);
  const shSteps = $('[data-sh-steps]', sheet);
  const shBack = $('[data-sh-back]', sheet);
  const SH = { i: 0, g: 0, view: 'details', opener: null, name: '', code: '' };
  const B = { in: '', out: '', guests: 2 };
  const fmtDate = v => { const [y, m, d] = v.split('-').map(Number); return dateFmt.format(new Date(y, m - 1, d)); };
  const nightsOf = () => (B.in && B.out && B.out > B.in) ? Math.round((new Date(B.out) - new Date(B.in)) / 864e5) : 0;
  const stayNow = () => C.stays.items[SH.i];
  const imgTag = (im, sizes, cls = '') => { const [src, set] = imgUrls(im.src); return `<img class="${cls}" src="${esc(src)}" ${set ? `srcset="${esc(set)}" sizes="${sizes}"` : ''} alt="${esc(im.alt)}" style="object-position:${im.pos || '50% 50%'}" decoding="async">`; };
  const stayHref = id => (window.VR_PREVIEW ? 'hospedagem.html#' : 'hospedagem/?id=') + encodeURIComponent(id);
  const gallery = () => { const s = stayNow(); return [s.image, ...(s.gallery || [])]; };

  function priceLines() {
    const s = stayNow(), S = C.sheet, n = nightsOf();
    if (!n) return `<p class="bk__hint">${esc(S.pickDates)}</p>`;
    const sub = s.price * n, total = sub + S.cleaningFee;
    return `<div class="bk__lines">
      <p><span>${esc(fmt(S.nightsLine, { price: money(s.price), n, nights: n === 1 ? C.form.nights1 : C.form.nightsN }))}</span><span>${money(sub)}</span></p>
      <p><span>${esc(S.cleaning)}</span><span>${money(S.cleaningFee)}</span></p>
      <p class="bk__total"><span>${esc(S.total)}</span><span>${money(total)}</span></p></div>`;
  }
  function renderDetails() {
    const s = stayNow(), S = C.sheet, g = gallery();
    const today = fin.min;
    const minOut = B.in ? toISO(new Date(new Date(B.in + 'T00:00').getTime() + 864e5)) : fout.min;
    const opts = Array.from({ length: s.guests }, (_, k) => k + 1).map(n => `<option value="${n}" ${n === Math.min(B.guests, s.guests) ? 'selected' : ''}>${n} ${n === 1 ? C.form.guestOne : C.form.guestMany}</option>`).join('');
    shBody.innerHTML = `<div class="view-in">
      <div class="sg">
        <div class="sg__main" aria-roledescription="carousel" aria-label="${esc(S.gallery)}">
          ${g.map((im, k) => imgTag(im, '(max-width: 960px) 100vw, 860px', k === SH.g ? '' : 'is-off')).join('')}
          <div class="sg__nav">
            <button class="round round--lg" type="button" data-g="-1" aria-label="${esc(S.prev)}">${icon('arrow-left', 'icon icon--sm')}</button>
            <span class="sg__count" aria-live="polite" data-g-count>${fmt(S.photoOf, { i: SH.g + 1, n: g.length })}</span>
            <button class="round round--lg" type="button" data-g="1" aria-label="${esc(S.next)}">${icon('arrow', 'icon icon--sm')}</button>
          </div>
        </div>
        <div class="sg__thumbs">${g.map((im, k) => `<button class="sg__thumb" type="button" data-g-go="${k}" aria-label="${esc(fmt(S.photoOf, { i: k + 1, n: g.length }))}" aria-current="${k === SH.g}">${imgTag(im, '280px')}</button>`).join('')}</div>
      </div>
      <div class="sd">
        <div>
          <div class="sd__head">
            <h2 class="sd__title" id="sh-title" tabindex="-1">${esc(s.name)}</h2>
            <p class="sd__meta"><span>${icon('pin', 'icon icon--sm')}${esc(s.where)}</span><span>${icon('star', 'icon icon--star')}${esc(s.rating)} (${s.reviews})</span>${s.features.map(([k, t]) => `<span>${icon(k, 'icon icon--sm')}${esc(t)}</span>`).join('')}</p>
          </div>
          <section class="sd__sec"><h3 class="sd__h">${esc(S.about)}</h3><p class="sd__about">${esc(s.about)}</p>
            <ul class="sd__chips">${s.amenities.slice(0, 4).map(([k, t]) => `<li>${icon(k, 'icon icon--sm')}${esc(t)}</li>`).join('')}</ul></section>
          <a class="sd__more" href="${stayHref(s.id)}"><span><strong>${esc(S.seeAll)}</strong><small>${esc(S.seeAllHint)}</small></span><span class="sd__more-go">${icon('arrow', 'icon icon--sm')}</span></a>
        </div>
        <aside class="bk" aria-label="${esc(S.dates)}">
          <p class="bk__price"><strong>${money(s.price)}</strong> / ${esc(C.ui.perNight)}</p>
          <div class="field-row">
            <div class="field"><label class="field__label" for="bk-in">${esc(S.checkin)}</label><input class="field__input" id="bk-in" type="date" min="${today}" value="${B.in}"></div>
            <div class="field"><label class="field__label" for="bk-out">${esc(S.checkout)}</label><input class="field__input" id="bk-out" type="date" min="${minOut}" value="${B.out}"></div>
          </div>
          <div class="field"><label class="field__label" for="bk-g">${esc(S.guests)}</label><select class="field__input" id="bk-g">${opts}</select></div>
          <div data-bk-lines>${priceLines()}</div>
          <p class="bk__err" role="alert" data-bk-err></p>
          <button class="btn btn--primary btn--block" type="button" data-bk-reserve>${esc(S.reserve)}${icon('arrow', 'icon icon--sm')}</button>
        </aside>
      </div></div>`;
    $$('.sg__main img', shBody).forEach((im, k) => { im.style.opacity = k === SH.g ? 1 : 0; im.classList.toggle('is-on', k === SH.g); });
  }
  function showPhoto(k) {
    const g = gallery(); SH.g = (k + g.length) % g.length;
    $$('.sg__main img', shBody).forEach((im, j) => { im.style.opacity = j === SH.g ? 1 : 0; im.classList.toggle('is-on', j === SH.g); });
    $$('.sg__thumb', shBody).forEach((b, j) => b.setAttribute('aria-current', String(j === SH.g)));
    const c = $('[data-g-count]', shBody); if (c) c.textContent = fmt(C.sheet.photoOf, { i: SH.g + 1, n: g.length });
  }
  function renderCheckout(err = {}) {
    const s = stayNow(), S = C.sheet, n = nightsOf();
    shBody.innerHTML = `<div class="co view-in">
      <div>
        <h2 class="co__title" id="sh-title" tabindex="-1">${esc(S.checkoutTitle)}</h2>
        <p class="co__intro">${esc(S.checkoutText)}</p>
        <div class="co__card">${imgTag(s.image, '520px')}
          <div><h3>${esc(s.name)}</h3><p class="stay__where">${icon('pin', 'icon icon--sm')}${esc(s.where)}</p>
          <p class="muted">${esc(fmtDate(B.in))} → ${esc(fmtDate(B.out))} · ${n} ${n === 1 ? C.form.nights1 : C.form.nightsN} · ${B.guests} ${B.guests === 1 ? C.form.guestOne : C.form.guestMany}</p>
          ${priceLines()}</div></div>
      </div>
      <form class="co__form" novalidate data-co-form>
        <div class="field"><label class="field__label" for="co-name">${esc(S.name)}</label><input class="field__input" id="co-name" name="name" autocomplete="name" required value="${esc(SH.name)}"></div>
        <div class="field"><label class="field__label" for="co-email">${esc(S.email)}</label><input class="field__input" id="co-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label class="field__label" for="co-phone">${esc(S.phone)}</label><input class="field__input" id="co-phone" name="phone" type="tel" autocomplete="tel"></div>
        <div class="field"><label class="field__label" for="co-msg">${esc(S.message)}</label><textarea class="field__input" id="co-msg" name="message" rows="3" placeholder="${esc(S.messagePh)}"></textarea></div>
        <label class="check"><input type="checkbox" name="agree" required><span>${esc(S.agree)}</span></label>
        <p class="co__err" role="alert" data-co-err></p>
        <button class="btn btn--primary btn--block" type="submit">${esc(S.confirm)}${icon('check', 'icon icon--sm')}</button>
      </form></div>`;
  }
  function renderDone() {
    const s = stayNow(), S = C.sheet;
    const first = SH.name.trim().split(/\s+/)[0];
    shBody.innerHTML = `<div class="okv view-in"><div class="okv__inner">
      <span class="okv__icon">${icon('check')}</span>
      <h2 class="okv__title" id="sh-title" tabindex="-1">${esc(fmt(S.doneTitle, { name: first }))}</h2>
      <p class="okv__text">${esc(fmt(S.doneText, { place: s.name + ', ' + s.where, in: fmtDate(B.in), out: fmtDate(B.out) }))}</p>
      <p class="okv__code"><span>${esc(S.doneCode)}</span><strong>${SH.code}</strong></p>
      <p class="okv__note">${esc(S.doneNote)}</p>
      <button class="btn btn--primary" type="button" data-done-home>${esc(S.doneButton)}${icon('arrow', 'icon icon--sm')}</button>
    </div></div>`;
  }
  function paintSteps(k) {
    $$('.steps__item', shSteps).forEach(li => {
      const j = +li.dataset.k;
      li.classList.toggle('is-now', j === k); li.classList.toggle('is-done', j < k);
      if (j === k) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $$('.steps__line', shSteps).forEach((l, j) => l.classList.toggle('is-done', j < k));
  }
  let leaveT = null;
  function setView(v, { instant = false } = {}) {
    const prev = SH.view; SH.view = v;
    const S = C.sheet;
    paintSteps({ details: 0, checkout: 1, done: 2 }[v]);
    shBack.hidden = v !== 'checkout';
    $('[data-sh-back-label]', sheet).textContent = S.back;
    $('[data-sh-close-label]', sheet).textContent = S.close;
    const draw = () => {
      shBody.classList.remove('is-leaving');
      if (v === 'details') renderDetails(); else if (v === 'checkout') renderCheckout(); else renderDone();
      shBody.scrollTop = 0;
      const h = $('#sh-title', shBody); if (h) h.focus({ preventScroll: true });
    };
    clearTimeout(leaveT);
    // troca de etapa: o conteúdo atual sai rápido e o próximo entra suave
    if (instant || prev === v || !shBody.firstElementChild || calm()) return draw();
    shBody.classList.add('is-leaving');
    leaveT = setTimeout(draw, 190);
  }
  function openSheet(i, opener) {
    SH.i = i; SH.g = 0; SH.opener = opener || null;
    B.in = fin.value || B.in; B.out = fout.value || B.out;
    if (guestsTouched) B.guests = guests.adults + guests.children;
    const [bg] = imgUrls(stayNow().image.src, true);
    shBg.src = bg;
    document.documentElement.classList.add('sheet-open');
    sheet.classList.remove('is-closing'); clearTimeout(closeT);
    if (!sheet.open) sheet.showModal();
    setView('details', { instant: true });
  }
  let closeT = null;
  function closeSheet() {
    if (!sheet.open || sheet.classList.contains('is-closing')) return;
    if (calm()) return sheet.close();
    sheet.classList.add('is-closing');
    closeT = setTimeout(() => { sheet.classList.remove('is-closing'); sheet.close(); }, 300);
  }
  sheet.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('close', () => {
    document.documentElement.classList.remove('sheet-open');
    if (SH.opener && document.contains(SH.opener)) SH.opener.focus();
  });
  $('[data-sh-close]', sheet).addEventListener('click', closeSheet);
  shBack.addEventListener('click', () => setView('details'));
  sheet.addEventListener('click', e => {
    if (e.target === sheet || e.target.closest('.sheet__bg')) return closeSheet();
    const g = e.target.closest('[data-g]'); if (g) return showPhoto(SH.g + +g.dataset.g);
    const gg = e.target.closest('[data-g-go]'); if (gg) return showPhoto(+gg.dataset.gGo);
    if (e.target.closest('[data-bk-reserve]')) {
      const err = $('[data-bk-err]', shBody);
      if (!nightsOf()) { err.textContent = C.sheet.errDates; ($('#bk-in', shBody).value ? $('#bk-out', shBody) : $('#bk-in', shBody)).focus(); return; }
      return setView('checkout');
    }
    if (e.target.closest('[data-done-home]')) { closeSheet(); windTo(0); }
  });
  sheet.addEventListener('keydown', e => {
    if (SH.view === 'details' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.target.matches('input,select,textarea')) showPhoto(SH.g + (e.key === 'ArrowRight' ? 1 : -1));
  });
  sheet.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'bk-in') { B.in = t.value; const o = $('#bk-out', shBody); const next = toISO(new Date(new Date(t.value + 'T00:00').getTime() + 864e5)); o.min = next; if (B.out && B.out <= B.in) { B.out = ''; o.value = ''; } }
    if (t.id === 'bk-out') B.out = t.value;
    if (t.id === 'bk-g') B.guests = +t.value;
    if (t.id === 'bk-in' || t.id === 'bk-out') {
      $('[data-bk-lines]', shBody).innerHTML = priceLines(); $('[data-bk-err]', shBody).textContent = '';
      fin.value = B.in; fout.value = B.out; paintDate(fin); paintDate(fout); // mantém o formulário do topo em sintonia
    }
  });
  sheet.addEventListener('submit', e => {
    const f = e.target.closest('[data-co-form]'); if (!f) return;
    e.preventDefault();
    const S = C.sheet, err = $('[data-co-err]', f);
    const name = f.name.value.trim(), email = f.email.value.trim();
    $$('.field', f).forEach(x => x.classList.remove('is-invalid'));
    const bad = (input, msg) => { err.textContent = msg; input.closest('.field').classList.add('is-invalid'); input.focus(); };
    if (name.split(/\s+/).length < 2) return bad(f.name, S.errName);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(f.email, S.errEmail);
    if (!f.agree.checked) { err.textContent = S.errAgree; f.agree.focus(); return; }
    SH.name = name;
    SH.code = 'VR' + Math.random().toString(36).slice(2, 8).toUpperCase();
    try { window.va && window.va('event', { name: 'reserva_simulada', data: { stay: stayNow().id, lang: LANG } }); } catch (_) {}
    setView('done');
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-open-stay]');
    if (b) openSheet(+b.dataset.openStay, b);
  });

  /* ---------- Explorar destinos ---------- */
  const dGrid = $('.dests__grid');
  const dCards = $$('.dest', dGrid);
  const chips = $$('.chip');
  let dFilter = 'all';
  function paintDests(animate) {
    let n = 0;
    dCards.forEach((c, i) => {
      const tags = C.destinations.items[i].tags;
      c.dataset.tags = tags.join(' ');
      const show = dFilter === 'all' || tags.includes(dFilter);
      c.hidden = !show;
      if (show) {
        if (animate) { c.classList.add('in', 'done'); c.classList.remove('pop'); void c.offsetWidth; c.style.setProperty('--d', n * 70 + 'ms'); c.classList.add('pop'); }
        n++;
      }
    });
    dGrid.classList.toggle('is-filtered', dFilter !== 'all');
    chips.forEach(ch => ch.setAttribute('aria-pressed', String(ch.dataset.filter === dFilter)));
    $('[data-dest-count]').textContent = n === 1 ? C.destinations.count1 : fmt(C.destinations.count, { n });
  }
  let swapT = null;
  chips.forEach(ch => ch.addEventListener('click', () => {
    if (dFilter === ch.dataset.filter) return;
    dFilter = ch.dataset.filter;
    chips.forEach(c => c.setAttribute('aria-pressed', String(c === ch)));
    clearTimeout(swapT);
    dGrid.classList.add('is-swapping');
    swapT = setTimeout(() => { paintDests(true); dGrid.classList.remove('is-swapping'); if (armed) measure(); }, wait(200));
  }));

  /* ---------- Favoritos (guardados neste navegador) ---------- */
  const FKEY = 'verana-favs';
  const favs = new Set((() => { try { return JSON.parse(localStorage.getItem(FKEY) || '[]'); } catch (_) { return []; } })());
  const sGrid = $('[data-stays-grid]'), favBtn = $('[data-fav-filter]'), favEmpty = $('[data-fav-empty]');
  let favOnly = false, toastT = null;
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  function say(msg) {
    toast.innerHTML = `${icon('heart')}<span>${esc(msg)}</span>`;
    toast.classList.add('is-on'); clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }
  function paintFavs(animate) {
    const ids = C.stays.items.map(s => s.id);
    $$('[data-fav]').forEach(b => {
      const on = favs.has(ids[+b.dataset.fav]);
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? C.fav.remove : C.fav.add);
    });
    const mine = ids.filter(id => favs.has(id)).length;
    $('[data-fav-count]').textContent = mine;
    favBtn.setAttribute('aria-pressed', String(favOnly));
    let k = 0;
    $$('.stay', sGrid).forEach(card => {
      const show = !favOnly || favs.has(ids[+card.dataset.stay]);
      card.hidden = !show;
      if (show && animate) { card.classList.add('in', 'done'); card.classList.remove('pop'); void card.offsetWidth; card.style.setProperty('--d', k * 70 + 'ms'); card.classList.add('pop'); }
      if (show) k++;
    });
    favEmpty.hidden = !(favOnly && !mine);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]'); if (!b) return;
    const id = C.stays.items[+b.dataset.fav].id;
    const on = !favs.has(id);
    if (on) favs.add(id); else favs.delete(id);
    try { localStorage.setItem(FKEY, JSON.stringify([...favs])); } catch (_) {}
    b.classList.remove('is-beat'); void b.offsetWidth; if (on) b.classList.add('is-beat');
    say(on ? C.fav.saved : C.fav.removed);
    paintFavs(false);
    if (favOnly && !on) paintFavs(true);
  });
  favBtn.addEventListener('click', () => {
    favOnly = !favOnly;
    sGrid.classList.add('is-swapping'); clearTimeout(swapT);
    swapT = setTimeout(() => { paintFavs(true); sGrid.classList.remove('is-swapping'); if (armed) measure(); }, wait(200));
  });
  $$('[data-dest-search]').forEach(b => b.addEventListener('click', () => { dest.value = C.destinations.items[+b.dataset.destSearch].search; runSearch(); }));

  /* ---------- FAQ ---------- */
  $$('.faq__q').forEach(q => q.addEventListener('click', () => {
    const open = q.getAttribute('aria-expanded') !== 'true';
    q.setAttribute('aria-expanded', String(open));
    q.closest('.faq__item').classList.toggle('is-open', open);
  }));

  /* ---------- Entradas suaves ---------- */
  // itens que aparecem juntos entram em sequência curta (80 ms entre eles)
  const io = new IntersectionObserver(entries => {
    let k = 0;
    entries.filter(en => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left).forEach(en => {
      const el = en.target, d = Math.min(k++, 5) * 80;
      el.style.setProperty('--d', d + 'ms');
      el.classList.add('in'); io.unobserve(el);
      setTimeout(() => { el.classList.add('done'); el.style.removeProperty('--d'); }, 1700 + d);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Momentos: foto em tela cheia; texto entra pela direita e sai pela esquerda ---------- */
  const story = $('[data-story]');
  const mMedia = $$('.moment__media', story);
  const mText = $$('.moment__text', story);
  const mTicks = $$('.moments__progress button', story);
  const mNow = $('[data-moment-now]', story);
  const N = mMedia.length;
  const sCache = { op: [], tx: [], ix: [], tick: [], now: -1 };

  function storyFrame(p) {
    const band = 1 / N, vw = geo.vw;
    for (let i = 0; i < N; i++) {
      const a = i * band, b = (i + 1) * band;
      const t = (p - a) / band; // 0..1 dentro do momento
      // foto: troca suave nas fronteiras
      const ramp = .045;
      const inn = i === 0 ? 1 : smooth(a - ramp, a + ramp, p);
      const out = i === N - 1 ? 1 : 1 - smooth(b - ramp, b + ramp, p);
      const op = Math.round(inn * out * 1000) / 1000;
      // texto: entra pela direita (0 a .22), descansa, sai pela esquerda (.78 a 1)
      const enter = i === 0 ? 1 : smooth(0, .24, t);
      const leave = i === N - 1 ? 0 : smooth(.76, 1, t);
      const tx = Math.round(((1 - enter) * .42 - leave * .32) * vw);
      const top = Math.round(Math.min(enter, 1 - leave) * 1000) / 1000;
      // foto desliza devagar da direita para a esquerda durante o momento
      const ix = Math.round((1.5 - 3 * clamp(t, 0, 1)) * 100) / 100;
      if (sCache.op[i] !== op) { sCache.op[i] = op; mMedia[i].style.opacity = op; }
      if (sCache.ix[i] !== ix) { sCache.ix[i] = ix; mMedia[i].firstElementChild.style.setProperty('--x', ix + '%'); }
      if (sCache.tx[i] !== tx + '|' + top) {
        sCache.tx[i] = tx + '|' + top;
        mText[i].style.transform = `translate3d(${tx}px,0,0)`;
        mText[i].style.opacity = top;
        mText[i].setAttribute('aria-hidden', top < .5 ? 'true' : 'false');
      }
      const tp = Math.round(clamp(t, 0, 1) * 100) / 100;
      if (sCache.tick[i] !== tp) { sCache.tick[i] = tp; mTicks[i].firstElementChild.style.setProperty('--p', tp); }
    }
    const now = clamp(Math.floor(p * N), 0, N - 1);
    if (now !== sCache.now) { sCache.now = now; mNow.textContent = '0' + (now + 1); }
  }
  mTicks.forEach(b => b.addEventListener('click', () => {
    if (!armed) return;
    const i = +b.dataset.moment;
    window.scrollTo({ top: geo.storyTop + ((i + .5) / N) * geo.storyRange, behavior: 'smooth' });
  }));

  /* ---------- Estações ---------- */
  const seasons = $('[data-seasons]');
  const track = $('[data-season-track]');
  const cards = $$('.season', track);
  const bgs = $$('.seasons__bgimg', seasons);
  const dots = $$('.dot', seasons);
  const M = cards.length;
  const zCache = { f: -1, active: -1 };
  function seasonF(p) {
    const raw = clamp(p, 0, 1) * (M - 1 + .7) - .35;
    const r = clamp(raw, 0, M - 1);
    const i = Math.floor(r), t = r - i;
    return Math.min(M - 1, i + smooth(.22, .78, t));
  }
  function seasonFrame(p) {
    const f = Math.round(seasonF(p) * 1000) / 1000;
    if (f === zCache.f) return;
    zCache.f = f;
    const cw = cards[0].offsetWidth, gap = geo.sgap;
    const x = geo.vw / 2 - cw / 2 - f * (cw + gap);
    track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    cards.forEach((c, i) => {
      const d = Math.min(1, Math.abs(f - i));
      c.style.transform = `scale(${(1 - .1 * d).toFixed(3)})`;
      c.style.opacity = (1 - .45 * d).toFixed(3);
    });
    bgs.forEach((g, i) => { g.style.opacity = Math.max(0, 1 - Math.abs(f - i)).toFixed(3); });
    setActiveSeason(Math.round(f));
  }
  function setActiveSeason(i) {
    if (i === zCache.active) return;
    zCache.active = i;
    const s = C.seasons.items[i];
    seasons.dataset.active = s.key;
    $('[data-season-name]', seasons).textContent = s.name;
    const cnt = $('[data-season-count]', seasons);
    cnt.textContent = `${i + 1} / ${M}`;
    cnt.setAttribute('aria-label', fmt(C.seasons.progress, { i: i + 1, n: M }));
    dots.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (armed) cards.forEach((c, k) => { c.setAttribute('aria-hidden', k === i ? 'false' : 'true'); c.inert = k !== i; });
    $('[data-season-prev]').disabled = i === 0;
    $('[data-season-next]').disabled = i === M - 1;
  }
  function goSeason(i) {
    i = clamp(i, 0, M - 1);
    const p = (i + .35) / (M - 1 + .7);
    window.scrollTo({ top: geo.seasonTop + clamp(p, 0, 1) * geo.seasonRange, behavior: 'smooth' });
  }
  dots.forEach(d => d.addEventListener('click', () => goSeason(+d.dataset.go)));
  $('[data-season-prev]').addEventListener('click', () => goSeason(zCache.active - 1));
  $('[data-season-next]').addEventListener('click', () => goSeason(zCache.active + 1));

  /* ---------- Medidas e laço de animação que descansa ---------- */
  const geo = { storyTop: 0, storyRange: 1, seasonTop: 0, seasonRange: 1, vw: 0, sgap: 32 };
  function measure() {
    const y = window.scrollY;
    geo.storyTop = story.getBoundingClientRect().top + y; geo.storyRange = Math.max(1, story.offsetHeight - innerHeight);
    geo.seasonTop = seasons.getBoundingClientRect().top + y; geo.seasonRange = Math.max(1, seasons.offsetHeight - innerHeight);
    geo.vw = document.documentElement.clientWidth;
    geo.sgap = parseFloat(getComputedStyle(track).columnGap) || 32;
    zCache.f = -1; sCache.tx = [];
  }
  const target = { s: 0, z: 0 }, shown = { s: 0, z: 0 };
  let raf = null, last = 0, armed = false;
  function readScroll() {
    const y = window.scrollY;
    target.s = clamp((y - geo.storyTop) / geo.storyRange, 0, 1);
    target.z = clamp((y - geo.seasonTop) / geo.seasonRange, 0, 1);
  }
  function tick(now) {
    const dt = Math.min(100, now - (last || now)); last = now;
    const k = 1 - Math.pow(1 - .1, dt / 16.667); // deslize mais macio, sem atraso perceptível
    shown.s += (target.s - shown.s) * k;
    shown.z += (target.z - shown.z) * k;
    const done = Math.abs(target.s - shown.s) < .0004 && Math.abs(target.z - shown.z) < .0004;
    if (done) { shown.s = target.s; shown.z = target.z; }
    storyFrame(shown.s); seasonFrame(shown.z);
    if (done) { raf = null; last = 0; } else raf = requestAnimationFrame(tick);
  }
  function onScroll() {
    updateHeader();
    if (!armed) return;
    readScroll();
    if (raf === null) raf = requestAnimationFrame(tick);
  }
  function clearInline() {
    mMedia.forEach(m => { m.style.opacity = ''; m.firstElementChild.style.removeProperty('--x'); });
    mText.forEach(t => { t.style.opacity = ''; t.style.transform = ''; t.removeAttribute('aria-hidden'); });
    mTicks.forEach(b => b.firstElementChild.style.removeProperty('--p'));
    track.style.transform = '';
    cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; c.removeAttribute('aria-hidden'); c.inert = false; });
    bgs.forEach(g => g.style.opacity = '');
    sCache.op = []; sCache.tx = []; sCache.ix = []; sCache.tick = []; sCache.now = -1; zCache.f = -1; zCache.active = -1;
  }
  function applyMode() {
    const st = isStatic();
    document.documentElement.classList.toggle('is-static', st);
    clearInline();
    if (st) {
      armed = false;
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    } else {
      armed = true;
      measure(); readScroll();
      shown.s = target.s; shown.z = target.z;
      storyFrame(shown.s); seasonFrame(shown.z);
    }
  }
  MQ.forEach(m => m.addEventListener('change', applyMode));
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (armed) { measure(); readScroll(); shown.s = target.s; shown.z = target.z; storyFrame(shown.s); seasonFrame(shown.z); } }, 120); });
  addEventListener('load', () => { if (armed) { measure(); onScroll(); } });
  addEventListener('scroll', onScroll, { passive: true });

  applyMode();
  applyLang(LANG, { save: false });
  updateHeader();

  // chegando de outra página (vento) ou de um link com seção: vai direto, sem percorrer o caminho
  (() => {
    const fromWind = window.VRWind && VRWind.pending();
    const id = location.hash.slice(1);
    const el = id && !id.includes('=') ? document.getElementById(id) : null;
    if (!fromWind && !el) return;
    html0.classList.remove('intro-on'); html0.classList.add('intro-done');
    if (el) {
      const sb = html0.style.scrollBehavior; html0.style.scrollBehavior = 'auto';
      window.scrollTo(0, scrollY + el.getBoundingClientRect().top - 76);
      html0.style.scrollBehavior = sb;
      if (armed) { readScroll(); shown.s = target.s; shown.z = target.z; storyFrame(shown.s); seasonFrame(shown.z); }
      $$('.reveal:not(.in)').forEach(r => { const b = r.getBoundingClientRect(); if (b.top < innerHeight && b.bottom > 0) { r.classList.add('in', 'done'); io.unobserve(r); } });
    }
    if (fromWind) VRWind.arrive();
  })();

  // vindo da página completa da hospedagem: abre direto em "Seus dados"
  (() => {
    const q = new URLSearchParams(location.search), id = BOOK.id; if (!id) return;
    const i = C.stays.items.findIndex(x => x.id === id);
    ['book', 'in', 'out', 'g'].forEach(k => q.delete(k));
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + '#stays');
    if (i < 0) return;
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const vin = BOOK.in, vout = BOOK.out;
    if (iso.test(vin) && iso.test(vout) && vout > vin) { fin.value = vin; fout.value = vout; paintDate(fin); paintDate(fout); }
    const g = +BOOK.g; if (g > 0) { B.guests = Math.min(g, C.stays.items[i].guests); }
    document.documentElement.classList.remove('intro-on'); document.documentElement.classList.add('intro-done');
    { const sb = html0.style.scrollBehavior; html0.style.scrollBehavior = 'auto'; $('#stays').scrollIntoView(); html0.style.scrollBehavior = sb; }
    openSheet(i, null);
    if (fin.value && fout.value) setView('checkout', { instant: true });
  })();
})();
