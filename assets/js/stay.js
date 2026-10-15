/* VÉRANA · página completa da hospedagem (hospedagem/?id=...)
   Lê os mesmos dados da página inicial. O idioma vem da própria hospedagem:
   as do Brasil abrem em português, as de fora em inglês. */
(() => {
  'use strict';
  const DATA = JSON.parse(document.getElementById('page-data').textContent);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? '');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n, cls = 'icon') => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;

  function imgUrls(src, w) {
    const i = src.indexOf(':'), kind = src.slice(0, i), val = src.slice(i + 1);
    if (kind === 'u') {
      const base = `https://images.unsplash.com/${val}?auto=format&fit=crop&q=72`;
      return [`${base}&w=${w || 1600}`, [640, 960, 1280, 1600, 2000, 2600].map(x => `${base}&w=${x} ${x}w`).join(', ')];
    }
    if (kind === 'c') {
      const [path, maxw] = val.split('|'); const name = path.split('/').pop();
      const thumb = x => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${x}px-${name}`;
      const ws = [960, 1280, 1920].filter(x => x < +maxw);
      return [thumb(ws[ws.length - 1]), ws.map(x => `${thumb(x)} ${x}w`).join(', ')];
    }
    return [val, ''];
  }
  const img = (im, sizes, extra = '') => { const [src, set] = imgUrls(im.src); return `<img src="${esc(src)}" ${set ? `srcset="${esc(set)}" sizes="${sizes}"` : ''} alt="${esc(im.alt)}" style="object-position:${im.pos || '50% 50%'}" decoding="async" ${extra}>`; };
  document.addEventListener('error', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.hasAttribute('srcset') && !t.dataset.fallback) { t.dataset.fallback = '1'; t.removeAttribute('srcset'); t.src = t.src; }
  }, true);

  /* ---------- Qual hospedagem e qual idioma ---------- */
  // PREVIEW: na prévia o endereço usa #id em vez de ?id= e caminhos relativos
  const PV = !!window.VR_PREVIEW, ROOT = PV ? './' : '/';
  const id = new URLSearchParams(location.search).get('id') || decodeURIComponent(location.hash.slice(1)) || '';
  if (PV) addEventListener('hashchange', () => location.reload());
  const owner = ['pt', 'en'].find(l => DATA[l].stays.items.some(s => s.id === id));
  const LANG = owner || (html.dataset.lang === 'en' ? 'en' : 'pt');
  const C = DATA[LANG], P = C.stayPage, S = C.sheet;
  const HOME = ROOT + (LANG === 'en' ? '?lang=en' : '');
  const money = v => (C.currency === 'BRL' ? 'R$ ' : 'US$ ') + new Intl.NumberFormat(C.locale).format(v);
  const num = v => new Intl.NumberFormat(C.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
  const dateFmt = new Intl.DateTimeFormat(C.locale, { day: 'numeric', month: 'short' });
  html.lang = C.lang; html.dataset.lang = LANG;
  try { localStorage.setItem('verana-lang', LANG); } catch (_) {}

  // cabeçalho e rodapé no idioma certo
  $$('[data-t]').forEach(el => { const v = el.dataset.t.split('.').reduce((a, k) => a && a[k], C); if (v != null) el.textContent = v; });
  $$('[data-ta]').forEach(el => el.dataset.ta.split(';').forEach(p => { const [a, k] = p.split(':'); const v = k.split('.').reduce((o, x) => o && o[x], C); if (v != null) el.setAttribute(a, v); }));
  $$('[data-home]').forEach(a => { a.href = HOME + (a.dataset.home || ''); });
  $$('[data-lang-btn]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.langBtn === LANG));
    b.addEventListener('click', () => {
      if (b.dataset.langBtn === LANG) return;
      try { localStorage.setItem('verana-lang', b.dataset.langBtn); } catch (_) {}
      location.href = ROOT + (b.dataset.langBtn === 'en' ? '?lang=en' : '') + '#stays';
    });
  });

  const main = $('[data-sp]');
  const items = C.stays.items;
  const s = items.find(x => x.id === id);

  if (!s) {
    document.title = 'VÉRANA';
    main.innerHTML = `<div class="container sp__missing"><h1 class="section-title">${esc(P.notFound)}</h1><a class="btn btn--primary" href="${HOME}#stays">${esc(P.notFoundLink)}${icon('arrow', 'icon icon--sm')}</a></div>`;
    html.classList.remove('sp-pending');
    return;
  }

  /* ---------- Conteúdo ---------- */
  const place = s.where.split(',')[0];
  document.title = fmt(P.title, { name: s.name, place });
  $('meta[name="description"]').setAttribute('content', s.text);
  const season = C.seasons.items.find(x => x.key === s.season) || C.seasons.items[0];
  const photos = [s.image, ...(s.gallery || [])];
  const rating = parseFloat(String(s.rating).replace(',', '.'));
  const initial = n => esc(n.trim().charAt(0).toUpperCase());
  const reviewsN = fmt(P.reviewsCount, { n: s.reviews });
  const FKEY = 'verana-favs';
  const favs = new Set((() => { try { return JSON.parse(localStorage.getItem(FKEY) || '[]'); } catch (_) { return []; } })());

  const similar = items.filter(x => x.id !== s.id)
    .sort((a, b) => (b.season === s.season) - (a.season === s.season) || Math.abs(a.price - s.price) - Math.abs(b.price - s.price));

  const today = new Date(); const toISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const minIn = toISO(today), minOut = toISO(new Date(today.getTime() + 864e5));
  const guestOpts = Array.from({ length: s.guests }, (_, k) => k + 1).map(n => `<option value="${n}" ${n === Math.min(2, s.guests) ? 'selected' : ''}>${n} ${n === 1 ? C.form.guestOne : C.form.guestMany}</option>`).join('');

  main.innerHTML = `
  <div class="container sp__top">
    <a class="sp__back" href="${HOME}#stays">${icon('arrow-left', 'icon icon--sm')}<span>${esc(P.back)}</span></a>
    <div class="sp__acts">
      <button class="sp__act" type="button" data-share>${icon('share', 'icon icon--sm')}<span>${esc(P.share)}</span></button>
      <button class="sp__act" type="button" data-save aria-pressed="false">${icon('heart', 'icon icon--sm')}<span data-save-label>${esc(P.save)}</span></button>
    </div>
  </div>

  <section class="container sp__hero" aria-label="${esc(P.photos)}">
    <div class="sp__frame">
      <button class="sp__main-photo" type="button" data-lb-open="0" aria-label="${esc(fmt(P.allPhotos, { n: photos.length }))}">${img(photos[0], '(max-width: 1240px) 100vw, 1200px', 'fetchpriority="high"')}</button>
      <div class="sp__shade" aria-hidden="true"></div>
      <div class="sp__head">
        <p class="sp__where">${icon('pin', 'icon icon--sm')}${esc(s.where)}</p>
        <h1 class="sp__title">${esc(s.name)}</h1>
        <p class="sp__meta"><span>${icon('star', 'icon icon--star')}${esc(s.rating)} · <a href="#reviews">${esc(reviewsN)}</a></span>${s.features.map(([k, t]) => `<span>${icon(k, 'icon icon--sm')}${esc(t)}</span>`).join('')}</p>
      </div>
      <div class="sp__thumbs">
        ${photos.slice(1).map((im, k) => `<button class="sp__thumb" type="button" data-lb-open="${k + 1}" aria-label="${esc(fmt(S.photoOf, { i: k + 2, n: photos.length }))}">${img(im, '200px', 'loading="lazy"')}</button>`).join('')}
        <button class="sp__all" type="button" data-lb-open="0">${icon('grid', 'icon icon--sm')}<span>${esc(fmt(P.allPhotos, { n: photos.length }))}</span></button>
      </div>
    </div>
  </section>

  <div class="container sp__grid">
    <div class="sp__body">
      <p class="sp__lead reveal">${esc(s.text)}</p>
      <ul class="sp__facts reveal">
        <li><span class="sp__fi">${icon('calendar')}</span><div><small>${esc(P.bestTime)}</small><strong>${esc(season.name)}</strong><span>${esc(season.when)}</span></div></li>
        <li><span class="sp__fi sp__fi--av">${initial(s.host.name)}</span><div><small>${esc(P.hostedBy)}</small><strong>${esc(s.host.name)}</strong><span>${esc(fmt(P.hostYears, { n: s.host.years }))}</span></div></li>
        <li><span class="sp__fi">${icon('star')}</span><div><small>${esc(P.rating)}</small><strong>${esc(s.rating)}</strong><span>${esc(rating >= 4.9 ? P.choice : reviewsN)}</span></div></li>
      </ul>
      <section class="sp__sec reveal"><h2 class="sp__h">${esc(P.about)}</h2><p class="sp__about">${esc(s.about)}</p></section>
      <section class="sp__sec reveal"><h2 class="sp__h">${esc(P.sleep)}</h2>
        <div class="sp__rooms">${s.rooms.map(([n, b], k) => `<div class="room">${icon(k === 0 ? 'bed' : (/sof|seat|bench|banco|espregui/i.test(b) ? 'coffee' : 'bed'))}<strong>${esc(n)}</strong><span>${esc(b)}</span></div>`).join('')}</div>
      </section>
      <section class="sp__sec reveal"><h2 class="sp__h">${esc(P.amenities)}</h2>
        <ul class="sp__amen">${s.amenities.map(([k, t]) => `<li>${icon(k)}<span>${esc(t)}</span></li>`).join('')}</ul>
      </section>
    </div>

    <aside class="sp__aside" id="book">
      <div class="bk">
        <p class="bk__price"><strong>${money(s.price)}</strong> / ${esc(C.ui.perNight)}</p>
        <div class="field-row">
          <div class="field"><label class="field__label" for="bk-in">${esc(S.checkin)}</label><input class="field__input" id="bk-in" type="date" min="${minIn}"></div>
          <div class="field"><label class="field__label" for="bk-out">${esc(S.checkout)}</label><input class="field__input" id="bk-out" type="date" min="${minOut}"></div>
        </div>
        <div class="field"><label class="field__label" for="bk-g">${esc(S.guests)}</label><select class="field__input" id="bk-g">${guestOpts}</select></div>
        <div data-bk-lines></div>
        <p class="bk__err" role="alert" data-bk-err></p>
        <button class="btn btn--primary btn--block" type="button" data-bk-reserve>${esc(S.reserve)}${icon('arrow', 'icon icon--sm')}</button>
        <p class="bk__free">${esc(P.noCharge)}</p>
      </div>
    </aside>
  </div>

  <section class="container sp__sec2" id="reviews" aria-labelledby="rv-title">
    <div class="rv reveal">
      <div class="rv__score">
        <p class="kicker">${esc(P.reviews)}</p>
        <p class="rv__big" id="rv-title">${esc(s.rating)}</p>
        <p class="rv__label">${icon('leaf', 'icon rv__leaf')}${esc(rating >= 4.9 ? P.choice : reviewsN)}</p>
        <p class="rv__count">${esc(reviewsN)}</p>
      </div>
      <ul class="rv__bars">${s.scores.map((v, k) => `<li><span>${esc(P.scores[k])}</span><span class="rv__bar"><span style="--v:${(v / 5).toFixed(3)}"></span></span><strong>${num(v)}</strong></li>`).join('')}</ul>
    </div>
    <div class="rv__list">${s.reviewsList.map(r => `<figure class="rcard reveal">
      <figcaption><span class="rcard__av" aria-hidden="true">${initial(r.name)}</span><span><strong>${esc(r.name)}</strong><small>${esc(r.from)} · ${esc(r.date)}</small></span></figcaption>
      <blockquote><p>${esc(r.text)}</p></blockquote></figure>`).join('')}</div>
    <p class="sp__note">${esc(fmt(P.reviewsShowing, { n: s.reviews }))} · ${esc(P.reviewsNote)}</p>
  </section>

  <section class="container sp__sec2" aria-labelledby="map-title">
    <div class="sp__sechead reveal"><h2 class="sp__h2" id="map-title">${esc(P.map)}</h2><p class="sp__sub">${icon('pin', 'icon icon--sm')}${esc(s.where)}</p></div>
    <div class="mapbox reveal">
      <div class="mapbox__map" data-map role="region" aria-label="${esc(P.map)}"></div>
      <div class="mapbox__card">
        <p class="kicker">${esc(P.arrive)}</p>
        <p>${esc(s.arrive)}</p>
        <a class="link-arrow" href="https://www.openstreetmap.org/?mlat=${s.geo[0]}&mlon=${s.geo[1]}#map=12/${s.geo[0]}/${s.geo[1]}" target="_blank" rel="noopener">${esc(P.mapOpen)}${icon('arrow', 'icon icon--sm')}</a>
      </div>
    </div>
    <p class="sp__note">${esc(P.mapNote)}</p>
  </section>

  <section class="container sp__sec2 sp__hk">
    <div class="host reveal">
      <h2 class="sp__h2">${esc(P.host)}</h2>
      <div class="host__card">
        <div class="host__id"><span class="host__av" aria-hidden="true">${initial(s.host.name)}</span><strong>${esc(s.host.name)}</strong><small>${esc(fmt(P.hostYears, { n: s.host.years }))}</small></div>
        <dl class="host__stats">
          <div><dt>${esc(P.reviews)}</dt><dd>${s.reviews}</dd></div>
          <div><dt>${esc(P.rating)}</dt><dd>${esc(s.rating)}</dd></div>
          <div><dt>${LANG === 'en' ? 'Years' : 'Anos'}</dt><dd>${s.host.years}</dd></div>
        </dl>
      </div>
      <p class="host__line">${esc(s.host.line)}</p>
      <p class="host__more">${icon('check', 'icon icon--sm')}${esc(P.hostResp)}<span aria-hidden="true">·</span>${esc(P.hostLang)}</p>
    </div>
    <div class="know reveal">
      <h2 class="sp__h2">${esc(P.know)}</h2>
      <ul>${P.knowItems.map(([h, t], k) => `<li>${icon(['calendar', 'check', 'bed'][k])}<div><h3>${esc(h)}</h3><p>${esc(t)}</p></div></li>`).join('')}</ul>
    </div>
  </section>

  <section class="sp__sim" aria-labelledby="sim-title">
    <div class="container sp__simhead reveal">
      <div><h2 class="sp__h2" id="sim-title">${esc(P.similar)}</h2><p class="sp__sub">${esc(P.similarText)}</p></div>
      <div class="sp__simnav">
        <button class="round round--lg" type="button" data-sim="-1" aria-label="${esc(P.prev)}">${icon('arrow-left', 'icon icon--sm')}</button>
        <button class="round round--lg" type="button" data-sim="1" aria-label="${esc(P.next)}">${icon('arrow', 'icon icon--sm')}</button>
      </div>
    </div>
    <ul class="sim" data-sim-track>${similar.map(x => `<li class="sim__item"><a class="sim__card" href="${PV ? '#' : '?id='}${encodeURIComponent(x.id)}">
      <span class="sim__media">${img(x.image, '320px', 'loading="lazy"')}</span>
      <span class="sim__row"><strong>${esc(x.name)}</strong><span>${icon('star', 'icon icon--star')}${esc(x.rating)}</span></span>
      <span class="sim__where">${esc(x.where)}</span>
      <span class="sim__price"><strong>${money(x.price)}</strong> / ${esc(C.ui.perNight)}</span></a></li>`).join('')}</ul>
  </section>

  <div class="sp__bar" data-bar>
    <p><span><strong>${money(s.price)}</strong> / ${esc(C.ui.perNight)}</span><small data-bar-dates></small></p>
    <a class="btn btn--primary btn--sm" href="#book">${esc(S.reserve)}</a>
  </div>`;

  // créditos das fotos desta hospedagem
  $('[data-sp-credits]').innerHTML = `<strong>${esc(P.photoBy)}:</strong> ` + photos.map(im => DATA.credits[im.src]).filter(Boolean)
    .map(c => `<a href="${esc(c.page)}" target="_blank" rel="noopener">${esc(c.author)}</a> (${esc(c.license)})`).join(', ');
  $('[data-sp-demo]').textContent = P.demo;

  /* ---------- Favorito e compartilhar ---------- */
  const toast = $('[data-toast]'); let toastT;
  const say = (msg, ic = 'check') => { toast.innerHTML = `${icon(ic)}<span>${esc(msg)}</span>`; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on'), 2200); };
  const saveBtn = $('[data-save]');
  const paintSave = () => { const on = favs.has(s.id); saveBtn.setAttribute('aria-pressed', String(on)); $('[data-save-label]').textContent = on ? P.saved : P.save; };
  paintSave();
  saveBtn.addEventListener('click', () => {
    const on = !favs.has(s.id); if (on) favs.add(s.id); else favs.delete(s.id);
    try { localStorage.setItem(FKEY, JSON.stringify([...favs])); } catch (_) {}
    paintSave(); say(on ? C.fav.saved : C.fav.removed, 'heart');
  });
  $('[data-share]').addEventListener('click', async () => {
    const url = location.href;
    if (navigator.share) { try { await navigator.share({ title: document.title, url }); return; } catch (_) { return; } }
    try { await navigator.clipboard.writeText(url); say(P.copied); } catch (_) { say(url); }
  });

  /* ---------- Reserva: mesmas contas do painel; segue para "Seus dados" na página inicial ---------- */
  const fin = $('#bk-in'), fout = $('#bk-out'), fg = $('#bk-g'), err = $('[data-bk-err]');
  const nights = () => (fin.value && fout.value && fout.value > fin.value) ? Math.round((new Date(fout.value) - new Date(fin.value)) / 864e5) : 0;
  const fmtD = v => { const [y, m, d] = v.split('-').map(Number); return dateFmt.format(new Date(y, m - 1, d)); };
  function lines() {
    const n = nights();
    $('[data-bar-dates]').textContent = n ? `${fmtD(fin.value)} → ${fmtD(fout.value)}` : '';
    if (!n) return void ($('[data-bk-lines]').innerHTML = `<p class="bk__hint">${esc(S.pickDates)}</p>`);
    const sub = s.price * n;
    $('[data-bk-lines]').innerHTML = `<div class="bk__lines">
      <p><span>${esc(fmt(S.nightsLine, { price: money(s.price), n, nights: n === 1 ? C.form.nights1 : C.form.nightsN }))}</span><span>${money(sub)}</span></p>
      <p><span>${esc(S.cleaning)}</span><span>${money(S.cleaningFee)}</span></p>
      <p class="bk__total"><span>${esc(S.total)}</span><span>${money(sub + S.cleaningFee)}</span></p></div>`;
  }
  fin.addEventListener('change', () => {
    const next = fin.value ? toISO(new Date(new Date(fin.value + 'T00:00').getTime() + 864e5)) : minOut;
    fout.min = next; if (fout.value && fout.value <= fin.value) fout.value = '';
    err.textContent = ''; lines();
  });
  fout.addEventListener('change', () => { err.textContent = ''; lines(); });
  lines();
  $('[data-bk-reserve]').addEventListener('click', () => {
    if (!nights()) { err.textContent = S.errDates; (fin.value ? fout : fin).focus(); return; }
    const q = new URLSearchParams();
    q.set('book', s.id); q.set('in', fin.value); q.set('out', fout.value); q.set('g', fg.value);
    location.href = HOME + '#' + q.toString();
  });

  /* ---------- Fotos em tela cheia ---------- */
  const lb = $('[data-lb]'), lbImg = $('[data-lb-img]'), lbCount = $('[data-lb-count]');
  let cur = 0, opener = null;
  function show(k) {
    cur = (k + photos.length) % photos.length;
    const im = photos[cur]; const [src, set] = imgUrls(im.src);
    lbImg.classList.remove('is-in'); void lbImg.offsetWidth;
    if (set) lbImg.srcset = set; else lbImg.removeAttribute('srcset');
    lbImg.src = src; lbImg.alt = im.alt; lbImg.classList.add('is-in');
    lbCount.textContent = fmt(S.photoOf, { i: cur + 1, n: photos.length });
    $('[data-lb-cap]').textContent = im.alt;
  }
  $$('[data-lb-t]').forEach(b => { b.setAttribute('aria-label', b.dataset.lbT === 'prev' ? S.prev : b.dataset.lbT === 'next' ? S.next : S.close); });
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-lb-open]'); if (!o) return;
    opener = o; show(+o.dataset.lbOpen); lb.showModal(); html.classList.add('sheet-open');
  });
  const closeLb = () => {
    if (!lb.open) return;
    if (calm()) return lb.close();
    lb.classList.add('is-closing'); setTimeout(() => { lb.classList.remove('is-closing'); lb.close(); }, 260);
  };
  lb.addEventListener('cancel', e => { e.preventDefault(); closeLb(); });
  lb.addEventListener('close', () => { html.classList.remove('sheet-open'); if (opener) opener.focus(); });
  lb.addEventListener('click', e => {
    const t = e.target.closest('[data-lb-t]');
    if (t) return t.dataset.lbT === 'close' ? closeLb() : show(cur + (t.dataset.lbT === 'next' ? 1 : -1));
    if (e.target === lb || e.target.classList.contains('lb__stage')) closeLb();
  });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });

  /* ---------- Opções parecidas: rolagem lateral ---------- */
  const track = $('[data-sim-track]');
  $$('[data-sim]').forEach(b => b.addEventListener('click', () => {
    const card = $('.sim__item', track); const step = card ? card.offsetWidth + 20 : 300;
    track.scrollBy({ left: +b.dataset.sim * step * 2, behavior: calm() ? 'auto' : 'smooth' });
  }));

  /* ---------- Mapa (Leaflet + OpenStreetMap), carregado quando aparece na tela ---------- */
  const mapEl = $('[data-map]');
  function drawMap() {
    if (!window.L) { mapEl.innerHTML = `<p class="mapbox__fail">${esc(P.mapFail)}</p>`; return; }
    const L = window.L;
    const map = L.map(mapEl, { scrollWheelZoom: false, zoomControl: false, attributionControl: true }).setView(s.geo, 12);
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd', maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
    }).addTo(map);
    L.circle(s.geo, { radius: 1400, color: '#8C2F0D', weight: 1.5, opacity: .7, fillColor: '#F2C063', fillOpacity: .28 }).addTo(map);
    L.marker(s.geo, { keyboard: false, icon: L.divIcon({ className: 'mpin', html: `<span>${icon('leaf')}</span>`, iconSize: [48, 48], iconAnchor: [24, 24] }) }).addTo(map);
    // no celular, só arrasta com dois dedos para não prender a rolagem da página
    if (matchMedia('(pointer: coarse)').matches) map.dragging.disable();
  }
  const mo = new IntersectionObserver(en => { if (en[0].isIntersecting) { mo.disconnect(); if (document.readyState === 'complete') drawMap(); else addEventListener('load', drawMap, { once: true }); } }, { rootMargin: '300px' });
  mo.observe(mapEl);

  /* ---------- Barra fixa no celular: some quando a reserva está na tela ---------- */
  const bar = $('[data-bar]'), aside = $('#book');
  new IntersectionObserver(en => bar.classList.toggle('is-hidden', en[0].isIntersecting), { threshold: .2 }).observe(aside);

  /* ---------- Entradas suaves ---------- */
  const io = new IntersectionObserver(entries => {
    let k = 0;
    entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top).forEach(e => {
      const el = e.target, d = Math.min(k++, 5) * 80;
      el.style.setProperty('--d', d + 'ms'); el.classList.add('in'); io.unobserve(el);
      setTimeout(() => { el.classList.add('done'); el.style.removeProperty('--d'); }, 1700 + d);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  $$('.reveal').forEach(el => io.observe(el));

  const header = $('[data-header]');
  addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 8), { passive: true });
  requestAnimationFrame(() => html.classList.remove('sp-pending'));
})();
