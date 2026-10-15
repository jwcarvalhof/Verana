#!/usr/bin/env python3
"""Gera index.html: uma página única em português e inglês.

Uso: python3 tools/build.py   (rodar na raiz do projeto)
- Os textos e fotos de cada idioma ficam em content/pt.json e content/en.json.
- A página sai em português; o botão PT · EN troca tudo na hora (textos, fotos,
  destinos, preços e moeda) a partir dos dois arquivos, que vão embutidos.
- Elementos com data-t, data-ta, data-img e data-price são trocados pelo site.js.
"""
import json, html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load = lambda n: json.load(open(os.path.join(ROOT, 'content', n), encoding='utf-8'))
PT, EN, CREDITS = load('pt.json'), load('en.json'), load('credits.json')
VERSION = '5'
DOMAIN = 'https://SEU-DOMINIO'  # DEPLOY STEP: endereço final do Vercel, sem barra no fim
e = lambda s: html.escape(str(s), quote=True)


def get(obj, path):
    for k in path.split('.'):
        obj = obj[int(k)] if isinstance(obj, list) else obj[k]
    return obj


def check_parallel(a, b, path=''):
    """PT e EN precisam ter a mesma estrutura (mesmas listas, mesmos tamanhos)."""
    if isinstance(a, dict):
        for k in a:
            if k in b and k not in ('tags', 'rooms'):
                check_parallel(a[k], b[k], f'{path}.{k}')
    elif isinstance(a, list):
        assert isinstance(b, list) and len(a) == len(b), f'Tamanho diferente em {path}: {len(a)} x {len(b)}'
        for i, (x, y) in enumerate(zip(a, b)):
            check_parallel(x, y, f'{path}.{i}')


def img_urls(src):
    kind, val = src.split(':', 1)
    if kind == 'u':
        base = f'https://images.unsplash.com/{val}?auto=format&fit=crop&q=72'
        return f'{base}&w=1600', ', '.join(f'{base}&w={w} {w}w' for w in (640, 960, 1280, 1600, 2000, 2600))
    if kind == 'c':
        path, maxw = val.split('|')
        name = path.split('/')[-1]
        thumb = lambda w: f'https://upload.wikimedia.org/wikipedia/commons/thumb/{path}/{w}px-{name}'
        widths = [w for w in (960, 1280, 1920) if w < int(maxw)]
        return thumb(widths[-1]), ', '.join(f'{thumb(w)} {w}w' for w in widths) + f', https://upload.wikimedia.org/wikipedia/commons/{path} {maxw}w'
    return val, ''


# ---------- ajudantes de marcação (sempre a partir do PT, com a chave para o EN) ----------
def t(path, tag='span', cls='', attrs=''):
    c = f' class="{cls}"' if cls else ''
    a = f' {attrs}' if attrs else ''
    return f'<{tag}{c} data-t="{path}"{a}>{e(get(PT, path))}</{tag}>'


def ta(pairs):
    """Atributos traduzidos: ta([('placeholder','form.destinationPh')])."""
    out = ' '.join(f'{a}="{e(get(PT, p))}"' for a, p in pairs)
    return f'{out} data-ta="{";".join(f"{a}:{p}" for a, p in pairs)}"'


def pic(path, cls, sizes='100vw', eager=False, small=False):
    im = get(PT, path)
    src, srcset = img_urls(im['src'])
    if small:  # versão pequena para fundos desfocados
        src = src.replace('w=1600', 'w=480')
        srcset = ''
    load_attr = 'loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    ss = f' srcset="{e(srcset)}" sizes="{e(sizes)}"' if srcset else ''
    alt = '' if small else e(im['alt'])
    hidden = ' aria-hidden="true"' if small else ''
    return f'<img class="{cls}" src="{e(src)}"{ss} alt="{alt}" {load_attr} decoding="async" style="object-position:{im.get("pos", "50% 50%")}" data-img="{path}"{" data-img-small" if small else ""}{hidden}>'


def icon(name, cls='icon'):
    return f'<svg class="{cls}" aria-hidden="true" focusable="false"><use href="#i-{name}"/></svg>'


SPRITE = '''<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
<symbol id="i-guests" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.4 3-5.3 6-5.3s5.4 1.9 6 5.3"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.3c2.4.2 4 1.8 4.5 4.6"/></symbol>
<symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
<symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></symbol>
<symbol id="i-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-bed" viewBox="0 0 24 24"><path d="M3 18.5V6.5M3 14h18v4.5M21 14v-2.5a3 3 0 0 0-3-3h-7V14"/><circle cx="7" cy="11" r="1.8"/></symbol>
<symbol id="i-fireplace" viewBox="0 0 24 24"><path d="M12 21c-3.3 0-5.5-2.2-5.5-5.1 0-3.2 2.6-4.7 3.4-7.9 1.7 1.3 2.1 3 2 4.4 1-.6 1.7-1.7 1.9-2.9 2 1.6 3.7 3.8 3.7 6.4 0 2.9-2.2 5.1-5.5 5.1z"/></symbol>
<symbol id="i-garden" viewBox="0 0 24 24"><path d="M12 21v-8M12 13c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6zM12 15c0-2.8-2-4.8-4.8-4.8 0 2.8 2 4.8 4.8 4.8z"/></symbol>
<symbol id="i-coffee" viewBox="0 0 24 24"><path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.6.9.6 1.6 0 2.5M12 3.5c-.6.9.6 1.6 0 2.5"/></symbol>
<symbol id="i-wave" viewBox="0 0 24 24"><path d="M3 9c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 14c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M3 19c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></symbol>
<symbol id="i-mountain" viewBox="0 0 24 24"><path d="M3 19l6.5-10 4 6 2.5-3.5L21 19z"/><path d="M8 11.3l1.5 1.2 1.5-1"/></symbol>
<symbol id="i-bath" viewBox="0 0 24 24"><path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 3.7-1M7 19l-1 2M17 19l1 2"/></symbol>
<symbol id="i-wifi" viewBox="0 0 24 24"><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8"/></symbol>
<symbol id="i-car" viewBox="0 0 24 24"><path d="M4 16v-4l2-5h12l2 5v4M4 16h16v2.5M4 16v2.5M3 12h18"/><circle cx="7.5" cy="14" r=".6"/><circle cx="16.5" cy="14" r=".6"/></symbol>
<symbol id="i-paw" viewBox="0 0 24 24"><circle cx="7" cy="10" r="1.8"/><circle cx="17" cy="10" r="1.8"/><circle cx="10" cy="6.3" r="1.8"/><circle cx="14" cy="6.3" r="1.8"/><path d="M12 12.5c-2.8 0-5 3.2-5 5.2 0 1.7 1.5 2.3 2.7 1.8 1-.4 1.6-.6 2.3-.6s1.3.2 2.3.6c1.2.5 2.7-.1 2.7-1.8 0-2-2.2-5.2-5-5.2z"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></symbol>
<symbol id="i-pool" viewBox="0 0 24 24"><path d="M3 17c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M8 14V5a2 2 0 0 1 4 0M16 14V5a2 2 0 0 0-4 0M8 8h8M8 11.5h8"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-share" viewBox="0 0 24 24"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></symbol>
<symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></symbol>
<symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></symbol>
<symbol id="i-thermo" viewBox="0 0 24 24"><path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/></symbol>
<symbol id="i-leaf" viewBox="0 0 32 32"><path d="M16 28V12"/><path d="M16 22c-6.5-1-9.5-6-9-13 6 .6 9 4.6 9 10"/><path d="M16 18c5.5-.8 8.5-5 8-11-5 .5-8 3.8-8 8.6"/></symbol>
</svg>'''


def money(c, v):
    return ('R$ ' if c['currency'] == 'BRL' else 'US$ ') + str(v)


def lang_switch(extra_cls=''):
    return f'''<div class="lang {extra_cls}" role="group" {ta([('aria-label', 'ui.langLabel')])}>
      <button type="button" class="lang__btn" data-lang-btn="pt" aria-pressed="true" lang="pt-BR">PT</button><span aria-hidden="true">·</span><button type="button" class="lang__btn" data-lang-btn="en" aria-pressed="false" lang="en">EN</button>
    </div>'''


def stay_card(i):
    p = f'stays.items.{i}'
    s = get(PT, p)
    feats = ''.join(f'<li>{icon(k)}{t(f"{p}.features.{j}.1")}</li>' for j, (k, _) in enumerate(s['features']))
    return f'''<article class="stay reveal" data-stay="{i}">
  <div class="stay__media">{pic(p + '.image', 'stay__img', '(max-width: 640px) 92vw, (max-width: 1180px) 46vw, 340px')}<button class="fav" type="button" data-fav="{i}" aria-pressed="false" {ta([('aria-label', 'fav.add')])}>{icon('heart')}</button></div>
  <div class="stay__body">
    <div class="stay__head">{t(p + '.name', 'h3', 'stay__name')}<span class="stay__rating">{icon('star', 'icon icon--star')}{t(p + '.rating')} <span class="muted">({s['reviews']})</span></span></div>
    <p class="stay__where">{icon('pin', 'icon icon--sm')}{t(p + '.where')}</p>
    <ul class="stay__features">{feats}</ul>
    <div class="stay__foot">
      <p class="stay__price"><strong data-price="{p}.price">{money(PT, s['price'])}</strong> <span>/ {t('ui.perNight')}</span></p>
      <button class="btn btn--ghost btn--sm" type="button" data-open-stay="{i}">{t('ui.viewStay')}{icon('arrow', 'icon icon--sm')}</button>
    </div>
  </div>
</article>'''


def destinations_html():
    d = PT['destinations']
    chips = f'<li><button type="button" class="chip" data-filter="all" aria-pressed="true">{t("destinations.all")}</button></li>' + ''.join(
        f'<li><button type="button" class="chip" data-filter="{k}" aria-pressed="false">{t(f"destinations.filters.{i}.1")}</button></li>' for i, (k, _) in enumerate(d['filters']))
    cards = ''.join(f'''<article class="dest reveal" data-i="{i}" data-tags="{' '.join(x['tags'])}">
      <div class="dest__media">{pic(f'destinations.items.{i}.image', 'dest__img', '(max-width: 960px) 92vw, 50vw')}</div>
      <div class="dest__shade" aria-hidden="true"></div>
      <div class="dest__body">
        {t(f'destinations.items.{i}.region', 'p', 'dest__region')}
        {t(f'destinations.items.{i}.name', 'h3', 'dest__name')}
        <dl class="dest__facts">
          <div><dt>{t('destinations.bestLabel')}</dt><dd>{t(f'destinations.items.{i}.best')}</dd></div>
          <div><dt>{t('destinations.tempLabel')}</dt><dd>{icon('thermo', 'icon icon--sm')}{t(f'destinations.items.{i}.temp')}</dd></div>
        </dl>
        <button class="btn btn--light btn--sm" type="button" data-dest-search="{i}">{t('destinations.button')}{icon('arrow', 'icon icon--sm')}</button>
      </div>
    </article>''' for i, x in enumerate(d['items']))
    return f'''<section class="dests" id="destinations" aria-labelledby="dests-title">
  <div class="container">
    <div class="dests__head reveal">
      <div>
        {t('destinations.kicker', 'p', 'kicker')}
        {t('destinations.title', 'h2', 'section-title', 'id="dests-title"')}
        {t('destinations.text', 'p', 'lead')}
      </div>
    </div>
    <div class="dests__bar reveal">
      <ul class="chips" role="group" {ta([('aria-label', 'destinations.filterLabel')])}>{chips}</ul>
      <p class="dests__count" aria-live="polite" data-dest-count></p>
    </div>
    <div class="dests__grid">{cards}</div>
  </div>
</section>'''


def build():
    check_parallel(PT, EN)
    h = PT['hero']
    hero_src, hero_set = img_urls(h['image']['src'])
    nav = ''.join(f'<li><a href="{e(href)}">{t(f"ui.nav.{i}.0")}</a></li>' for i, (_, href) in enumerate(PT['ui']['nav']))
    sugg = ''.join(f'<li role="option" id="sug-{i}" {ta([("data-value", f"form.suggestions.{i}")])}>{icon("pin", "icon icon--sm")}{t(f"form.suggestions.{i}")}</li>' for i in range(len(PT['form']['suggestions'])))

    # Momentos: foto em tela cheia, texto entra pela direita e sai pela esquerda
    scenes = PT['story']['scenes']
    N = len(scenes)
    m_media = ''.join(f'<figure class="moment__media" data-i="{i}">{pic(f"story.scenes.{i}.image", "moment__img", "100vw")}</figure>' for i in range(N))
    m_text = ''.join(f'''<div class="moment__text" data-i="{i}">
        {t(f'story.scenes.{i}.title', 'h3', 'moment__title')}
        {t(f'story.scenes.{i}.text', 'p', 'moment__copy')}
        <p class="moment__place">{icon('pin', 'icon icon--sm')}{t(f'story.scenes.{i}.place')}</p>
      </div>''' for i in range(N))
    m_ticks = ''.join(f'<li><button type="button" data-moment="{i}" aria-label="{i+1} / {N}"><span></span></button></li>' for i in range(N))
    m_list = ''.join(f'''<article class="moment-item">
        <figure>{pic(f"story.scenes.{i}.image", "", "92vw")}</figure>
        <div>{t(f'story.scenes.{i}.title', 'h3', 'moment__title')}{t(f'story.scenes.{i}.text', 'p', 'moment__copy')}<p class="moment__place">{icon('pin', 'icon icon--sm')}{t(f'story.scenes.{i}.place')}</p></div>
      </article>''' for i in range(N))

    # Estações
    sz = PT['seasons']
    M = len(sz['items'])
    s_bg = ''.join(f'<div class="seasons__bgimg" data-i="{i}">{pic(f"seasons.items.{i}.image", "", small=True)}</div>' for i in range(M))
    s_cards = ''.join(f'''<article class="season" data-season="{e(s['key'])}" data-i="{i}">
      <div class="season__media">{pic(f'seasons.items.{i}.image', 'season__img', '(max-width: 960px) 92vw, 72vw')}</div>
      <div class="season__shade" aria-hidden="true"></div>
      {t(f'seasons.items.{i}.name', 'h3', 'season__name')}
      <p class="season__climate">{icon('thermo', 'icon icon--sm')}{t(f'seasons.items.{i}.climate')}</p>
      <div class="season__bottom">
        <p class="season__where">{icon('pin', 'icon icon--sm')}{t(f'seasons.items.{i}.where')}<span aria-hidden="true"> · </span>{t(f'seasons.items.{i}.when')}</p>
        {t(f'seasons.items.{i}.text', 'p', 'season__text')}
        <button class="btn btn--light" type="button" data-season-search="{i}">{t('seasons.button')}{icon('arrow', 'icon icon--sm')}</button>
      </div>
    </article>''' for i, s in enumerate(sz['items']))
    s_dots = ''.join(f'<li><button type="button" class="dot" data-go="{i}" {ta([("aria-label", f"seasons.items.{i}.name")])}><span></span></button></li>' for i in range(M))

    stays = ''.join(stay_card(i) for i in range(len(PT['stays']['items'])))
    stories = ''.join(f'''<figure class="story reveal">
      <blockquote>{t(f'stories.items.{i}.quote', 'p', 'story__quote')}</blockquote>
      <figcaption>{t(f'stories.items.{i}.name', 'span', 'story__name')}{t(f'stories.items.{i}.stay', 'span', 'story__stay')}</figcaption>
    </figure>''' for i in range(len(PT['stories']['items'])))
    faq = ''.join(f'''<div class="faq__item reveal">
      <h3><button class="faq__q" type="button" aria-expanded="false" aria-controls="faq-{i}" id="faq-q-{i}">{t(f'faq.items.{i}.0')}{icon('chevron', 'icon faq__icon')}</button></h3>
      <div class="faq__a" id="faq-{i}" role="region" aria-labelledby="faq-q-{i}"><div>{t(f'faq.items.{i}.1', 'p')}</div></div>
    </div>''' for i in range(len(PT['faq']['items'])))

    ft = PT['footer']
    fcols = ''.join('<div class="footer__col">' + t(f'footer.cols.{ci}.0', 'p', 'footer__h') + '<ul>' + ''.join(
        f'<li><a href="{e(hh)}" {ta([("href", f"footer.cols.{ci}.1.{li}.1")]) if hh.startswith("mailto") else ""}>{t(f"footer.cols.{ci}.1.{li}.0")}</a></li>'
        for li, (_, hh) in enumerate(links)) + '</ul></div>' for ci, (_, links) in enumerate(ft['cols']))
    legal = ''.join(f'<a href="#">{t(f"footer.legal.{i}.0")}</a>' for i in range(len(ft['legal'])))

    # dados embutidos: os dois idiomas + créditos, para a troca sem recarregar
    data = {'pt': PT, 'en': EN, 'credits': CREDITS}
    data_json = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(PT['meta']['title'])}</title>
<meta name="description" content="{e(PT['meta']['description'])}">
<meta name="theme-color" content="#FFFEFA">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(PT['meta']['title'])}">
<meta property="og:description" content="{e(PT['meta']['description'])}">
<!-- DEPLOY STEP: troque DOMAIN pelo endereço final do Vercel no topo de tools/build.py -->
<meta property="og:url" content="{DOMAIN}/">
<meta property="og:image" content="{DOMAIN}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="VÉRANA">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{DOMAIN}/">
<link rel="alternate" hreflang="pt-BR" href="{DOMAIN}/">
<link rel="alternate" hreflang="en" href="{DOMAIN}/?lang=en">
<link rel="icon" href="assets/icons/favicon.svg" type="image/svg+xml">
<script>
  // idioma escolhido antes da primeira pintura: ?lang=en, escolha salva, ou idioma do navegador
  (function(){{try{{var q=new URLSearchParams(location.search).get('lang');var s=null;try{{s=localStorage.getItem('verana-lang')}}catch(_){{}}
  var l=q||s||((navigator.language||'pt').toLowerCase().indexOf('pt')===0?'pt':'en');if(l!=='pt'&&l!=='en')l='pt';
  document.documentElement.dataset.lang=l;try{{if(!sessionStorage.getItem('verana-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-on')}}catch(_){{}}
  if(l==='en'){{document.documentElement.lang='en';document.documentElement.classList.add('lang-pending');setTimeout(function(){{document.documentElement.classList.remove('lang-pending')}},2500)}}}}catch(_){{}}}})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preload" href="assets/fonts/ApfelGrotezk-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap">
<link rel="stylesheet" href="assets/css/tokens.css?v={VERSION}">
<link rel="stylesheet" href="assets/css/site.css?v={VERSION}">
</head>
<body>
{SPRITE}
<a class="skip" href="#main">{t('ui.skip')}</a>
<div class="env" aria-hidden="true"></div>
<div class="intro" data-intro aria-hidden="true">
  <div class="intro__inner">
    <span class="intro__logo">{icon('leaf', 'logo__mark')}<span class="logo__word">VÉRANA</span></span>
    {t('intro.line', 'p', 'intro__line')}
    <span class="intro__bar"><span></span></span>
  </div>
</div>

<header class="header is-over" data-header>
  <div class="header__inner">
    <a class="logo" href="#top" aria-label="VÉRANA">{icon('leaf', 'logo__mark')}<span class="logo__word">VÉRANA</span></a>
    <nav class="nav" {ta([('aria-label', 'ui.menu')])}>
      <ul class="nav__links">{nav}</ul>
      {lang_switch()}
      <a class="btn btn--primary btn--sm nav__cta" href="#search" data-focus-search>{t('ui.navCta')}</a>
    </nav>
    <div class="header__mobile">
      {lang_switch('lang--compact')}
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mnav" data-menu-btn>{t('ui.menu', 'span', 'sr-only', 'data-menu-label')}{icon('menu')}</button>
    </div>
  </div>
  <div class="mnav" id="mnav" hidden data-mnav>
    <ul>{nav}</ul>
    <a class="btn btn--primary btn--block" href="#search" data-focus-search>{t('ui.navCta')}{icon('arrow', 'icon icon--sm')}</a>
  </div>
</header>

<main id="main" tabindex="-1">

<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__frame">
    {pic('hero.image', 'hero__img', '100vw', eager=True)}
    <div class="hero__shade" aria-hidden="true"></div>
    <div class="hero__grid">
      <div class="hero__copy">
        {t('hero.kicker', 'p', 'kicker kicker--light hero__kicker')}
        {t('hero.title', 'h1', 'hero__title', 'id="hero-title"')}
        {t('hero.text', 'p', 'hero__text')}
      </div>
      <form class="booking" id="search" novalidate data-booking aria-labelledby="booking-title">
        {t('form.title', 'h2', 'booking__title', 'id="booking-title"')}
        <div class="field field--dest" data-field="destination">
          {icon('pin', 'icon field__icon')}
          {t('form.destination', 'label', 'field__label', 'for="f-dest"')}
          <input class="field__input" id="f-dest" name="destination" type="text" autocomplete="off" {ta([('placeholder', 'form.destinationPh')])} role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="f-dest-list" aria-describedby="f-error">
          <ul class="combo" id="f-dest-list" role="listbox" {ta([('aria-label', 'form.suggestionsLabel')])} hidden>{sugg}</ul>
        </div>
        <div class="field-row">
          <div class="field field--date" data-field="checkin">
            {icon('calendar', 'icon field__icon')}
            {t('form.checkin', 'label', 'field__label', 'for="f-in"')}
            <span class="field__display" aria-hidden="true" data-ph>{e(PT['form']['datePh'])}</span>
            <input class="field__date" id="f-in" name="checkin" type="date">
          </div>
          <div class="field field--date" data-field="checkout">
            {icon('calendar', 'icon field__icon')}
            {t('form.checkout', 'label', 'field__label', 'for="f-out"')}
            <span class="field__display" aria-hidden="true" data-ph>{e(PT['form']['datePh'])}</span>
            <input class="field__date" id="f-out" name="checkout" type="date">
          </div>
        </div>
        <div class="field field--guests" data-field="guests">
          {icon('guests', 'icon field__icon')}
          {t('form.guests', 'span', 'field__label', 'id="f-guests-label"')}
          <button class="field__button" type="button" id="f-guests" aria-haspopup="dialog" aria-expanded="false" aria-controls="f-guests-pop" aria-labelledby="f-guests-label f-guests"><span data-guests-summary>{e(PT['form']['guestsPh'])}</span>{icon('chevron', 'icon icon--sm field__chev')}</button>
          <div class="guests-pop" id="f-guests-pop" role="dialog" {ta([('aria-label', 'form.guests')])} hidden>
            <div class="stepper" data-stepper="adults" data-min="1" data-max="12">
              <div>{t('form.adults', 'p', 'stepper__name')}{t('form.adultsHint', 'p', 'stepper__hint')}</div>
              <div class="stepper__ctrl"><button type="button" class="round" data-step="-1" {ta([('aria-label', 'form.less')])}>{icon('minus', 'icon icon--sm')}</button><output aria-live="polite">2</output><button type="button" class="round" data-step="1" {ta([('aria-label', 'form.more')])}>{icon('plus', 'icon icon--sm')}</button></div>
            </div>
            <div class="stepper" data-stepper="children" data-min="0" data-max="8">
              <div>{t('form.children', 'p', 'stepper__name')}{t('form.childrenHint', 'p', 'stepper__hint')}</div>
              <div class="stepper__ctrl"><button type="button" class="round" data-step="-1" {ta([('aria-label', 'form.less')])}>{icon('minus', 'icon icon--sm')}</button><output aria-live="polite">0</output><button type="button" class="round" data-step="1" {ta([('aria-label', 'form.more')])}>{icon('plus', 'icon icon--sm')}</button></div>
            </div>
            <button type="button" class="btn btn--ghost btn--sm guests-pop__done" data-guests-done>{t('form.done')}</button>
          </div>
        </div>
        <p class="booking__error" id="f-error" role="alert" aria-live="assertive"></p>
        <button class="btn btn--primary btn--block" type="submit">{t('form.submit')}{icon('arrow', 'icon icon--sm')}</button>
      </form>
    </div>
    <p class="hero__caption">{icon('pin', 'icon icon--sm')}{t('hero.caption')}</p>
  </div>
</section>

<section class="results" id="results" aria-labelledby="results-title" hidden data-results>
  <div class="container">
    <div class="results__head">
      <div>
        {t('results.kicker', 'p', 'kicker')}
        <h2 class="results__title" id="results-title" tabindex="-1" data-results-title></h2>
        <p class="results__meta" data-results-meta></p>
      </div>
      <button class="btn btn--ghost btn--sm" type="button" data-results-clear>{t('results.clear')}</button>
    </div>
    <p class="results__note" data-results-note hidden></p>
    <div class="stays__grid" data-results-grid></div>
  </div>
</section>

<section class="moments" id="moments" {ta([('aria-label', 'story.label')])} data-story>
  <div class="moments__stage">
    <div class="moments__media">{m_media}</div>
    <div class="moments__shade" aria-hidden="true"></div>
    {t('story.label', 'p', 'moments__label kicker kicker--light')}
    <div class="moments__texts">{m_text}</div>
    <div class="moments__progress"><ol>{m_ticks}</ol><p class="moments__count" aria-hidden="true"><span data-moment-now>01</span> / 0{N}</p></div>
  </div>
  <div class="moments__list">{t('story.label', 'p', 'kicker')}{m_list}</div>
</section>

<section class="seasons" id="seasons" aria-labelledby="seasons-title" data-seasons data-active="{e(sz['items'][0]['key'])}">
  <div class="seasons__stage">
    <div class="seasons__bg" aria-hidden="true">{s_bg}</div>
    <div class="seasons__veil" aria-hidden="true"></div>
    <div class="seasons__head container">
      <div class="seasons__intro">
        {t('seasons.kicker', 'p', 'kicker')}
        {t('seasons.title', 'h2', 'seasons__title', 'id="seasons-title"')}
        {t('seasons.text', 'p', 'lead seasons__lead')}
      </div>
      <div class="seasons__nav">
        <p class="seasons__status" aria-live="polite"><span class="seasons__now" data-season-name>{e(sz['items'][0]['name'])}</span> <span class="seasons__count" data-season-count>1 / {M}</span></p>
        <div class="seasons__ctrl">
          <ol class="seasons__dots">{s_dots}</ol>
          <button class="round round--lg" type="button" data-season-prev {ta([('aria-label', 'seasons.prev')])}>{icon('arrow-left', 'icon icon--sm')}</button>
          <button class="round round--lg" type="button" data-season-next {ta([('aria-label', 'seasons.next')])}>{icon('arrow', 'icon icon--sm')}</button>
        </div>
      </div>
    </div>
    <div class="seasons__viewport">
      <div class="seasons__track" data-season-track>{s_cards}</div>
    </div>
  </div>
</section>

{destinations_html()}

<section class="stays" id="stays" aria-labelledby="stays-title">
  <div class="container">
    <div class="stays__head reveal">
      <div>
        {t('stays.title', 'h2', 'section-title', 'id="stays-title"')}
        {t('stays.text', 'p', 'lead')}
      </div>
      <div class="stays__actions">
        <button class="fav-filter" type="button" data-fav-filter aria-pressed="false">{icon('heart', 'icon icon--sm')}{t('fav.nav')}<span class="fav-filter__n" data-fav-count>0</span></button>
        <a class="link-arrow" href="#search" data-focus-search>{t('stays.link')}{icon('arrow', 'icon icon--sm')}</a>
      </div>
    </div>
    <div class="stays__grid" data-stays-grid>{stays}</div>
    {t('fav.empty', 'p', 'stays__empty', 'data-fav-empty hidden')}
  </div>
</section>

<section class="stories" aria-labelledby="stories-title">
  <div class="container">
    <div class="stories__head reveal">
      {t('stories.kicker', 'p', 'kicker')}
      {t('stories.title', 'h2', 'section-title', 'id="stories-title"')}
    </div>
    <div class="stories__grid">{stories}</div>
    {t('stories.note', 'p', 'stories__note')}
  </div>
</section>

<section class="faq" id="faq" aria-labelledby="faq-title">
  <div class="container faq__grid">
    <div class="faq__intro reveal">
      {t('faq.title', 'h2', 'section-title', 'id="faq-title"')}
      {t('faq.text', 'p', 'lead')}
    </div>
    <div class="faq__list">{faq}</div>
  </div>
</section>

<section class="closing" aria-labelledby="closing-title">
  <div class="closing__frame">
    {pic('closing.image', 'closing__img', '100vw')}
    <div class="closing__shade" aria-hidden="true"></div>
    <div class="closing__copy container">
      {t('closing.title', 'h2', 'closing__title', 'id="closing-title"')}
      {t('closing.text', 'p', 'closing__text')}
      <a class="btn btn--light" href="#search" data-focus-search>{t('closing.button')}{icon('arrow', 'icon icon--sm')}</a>
    </div>
    <p class="closing__caption">{icon('pin', 'icon icon--sm')}{t('closing.caption')}</p>
  </div>
</section>

</main>

<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="logo logo--dark" href="#top" aria-label="VÉRANA">{icon('leaf', 'logo__mark')}<span class="logo__word">VÉRANA</span></a>
        {t('footer.tagline', 'p')}
      </div>
      {fcols}
    </div>
    {t('footer.notice', 'p', 'footer__notice')}
    <details class="footer__credits">
      <summary>{t('footer.credits')}{icon('chevron', 'icon icon--sm')}</summary>
      {t('footer.creditsIntro', 'p')}
      <ul data-credits></ul>
    </details>
    <div class="footer__bottom">
      <p>© {e(ft['year'])} VÉRANA</p>
      <div class="footer__legal">{legal}{lang_switch()}</div>
    </div>
  </div>
</footer>

<dialog class="sheet" data-sheet aria-labelledby="sh-title">
  <div class="sheet__bg" aria-hidden="true"><img alt="" data-sh-bg><div class="sheet__veil"></div></div>
  <div class="sheet__panel">
    <div class="sheet__top">
      <button class="round sheet__back" type="button" data-sh-back hidden>{icon('arrow-left', 'icon icon--sm')}<span class="sr-only" data-sh-back-label></span></button>
      <ol class="steps" data-sh-steps {ta([('aria-label', 'sheet.stepsLabel')])}>
        <li class="steps__item" data-k="0"><span class="steps__dot" aria-hidden="true"></span>{t('sheet.steps.0', 'span', 'steps__label')}</li>
        <li class="steps__line" aria-hidden="true"><span></span></li>
        <li class="steps__item" data-k="1"><span class="steps__dot" aria-hidden="true"></span>{t('sheet.steps.1', 'span', 'steps__label')}</li>
        <li class="steps__line" aria-hidden="true"><span></span></li>
        <li class="steps__item" data-k="2"><span class="steps__dot" aria-hidden="true"></span>{t('sheet.steps.2', 'span', 'steps__label')}</li>
      </ol>
      <button class="round sheet__close" type="button" data-sh-close>{icon('close', 'icon icon--sm')}<span class="sr-only" data-sh-close-label></span></button>
    </div>
    <div class="sheet__body" data-sh-body></div>
  </div>
</dialog>

<script id="page-data" type="application/json">{data_json}</script>
<script src="assets/js/site.js?v={VERSION}" defer></script>
<script>
  // Vercel Web Analytics: só carrega no site publicado (ative em Project, Analytics)
  window.va=window.va||function(){{(window.vaq=window.vaq||[]).push(arguments)}};
  if(['localhost','127.0.0.1','[::1]'].indexOf(location.hostname)<0&&location.protocol!=='file:'){{var a=document.createElement('script');a.defer=true;a.src='/_vercel/insights/script.js';document.head.appendChild(a)}}
</script>
</body>
</html>
'''


REDIRECT_EN = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>VÉRANA</title>
<meta http-equiv="refresh" content="0; url=../?lang=en"><link rel="canonical" href="../?lang=en">
<script>location.replace('../?lang=en')</script></head>
<body><a href="../?lang=en">VÉRANA in English</a></body></html>
'''


def stay_page():
    """Página completa da hospedagem: um único arquivo, preenchido por assets/js/stay.js a partir de ?id=."""
    owners = {x['id']: 'pt' for x in PT['stays']['items']}
    owners.update({x['id']: 'en' for x in EN['stays']['items']})
    data = {'pt': PT, 'en': EN, 'credits': CREDITS}
    data_json = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'''<!doctype html>
<html lang="pt-BR" class="sp-pending">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>VÉRANA</title>
<meta name="description" content="{e(PT['meta']['description'])}">
<meta name="theme-color" content="#FFFEFA">
<meta property="og:type" content="website">
<meta property="og:title" content="VÉRANA">
<meta property="og:image" content="{DOMAIN}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
<script>
  // o idioma segue a hospedagem: as do Brasil em português, as de fora em inglês
  (function(){{try{{var o={json.dumps(owners)};var id=new URLSearchParams(location.search).get('id');var l=o[id];
  if(!l){{try{{l=localStorage.getItem('verana-lang')}}catch(_){{}}}}if(l!=='en')l='pt';document.documentElement.dataset.lang=l;if(l==='en')document.documentElement.lang='en'}}catch(_){{}}
  setTimeout(function(){{document.documentElement.classList.remove('sp-pending')}},3000)}})();
</script>
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preload" href="/assets/fonts/ApfelGrotezk-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">
<link rel="stylesheet" href="/assets/css/tokens.css?v={VERSION}">
<link rel="stylesheet" href="/assets/css/site.css?v={VERSION}">
<link rel="stylesheet" href="/assets/css/stay.css?v={VERSION}">
</head>
<body class="sp-page">
{SPRITE}
<a class="skip" href="#main">{t('ui.skip')}</a>
<header class="header is-solid header--page" data-header>
  <div class="header__inner">
    <a class="logo" href="/" data-home="" aria-label="VÉRANA">{icon('leaf', 'logo__mark')}<span class="logo__word">VÉRANA</span></a>
    <div class="sp-nav">
      {lang_switch()}
      <a class="btn btn--primary btn--sm sp-nav__cta" href="/#search" data-home="#search">{t('ui.navCta')}</a>
    </div>
  </div>
</header>

<main id="main" class="sp" data-sp></main>

<footer class="footer footer--page">
  <div class="container">
    <p class="footer__notice" data-sp-demo></p>
    <p class="sp-credits" data-sp-credits></p>
    <div class="footer__bottom">
      <p>© {e(PT['footer']['year'])} VÉRANA</p>
      <a class="logo logo--dark" href="/" data-home="" aria-label="VÉRANA">{icon('leaf', 'logo__mark')}<span class="logo__word">VÉRANA</span></a>
    </div>
  </div>
</footer>

<dialog class="lb" data-lb aria-label="VÉRANA">
  <div class="lb__stage">
    <img class="lb__img" alt="" data-lb-img>
  </div>
  <div class="lb__bar">
    <span class="lb__count" data-lb-count></span>
    <p class="lb__cap" data-lb-cap></p>
    <div class="lb__ctrl">
      <button class="round round--lg" type="button" data-lb-t="prev">{icon('arrow-left', 'icon icon--sm')}</button>
      <button class="round round--lg" type="button" data-lb-t="next">{icon('arrow', 'icon icon--sm')}</button>
      <button class="round round--lg" type="button" data-lb-t="close">{icon('close', 'icon icon--sm')}</button>
    </div>
  </div>
</dialog>
<div class="toast" role="status" aria-live="polite" data-toast></div>

<script id="page-data" type="application/json">{data_json}</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin="" defer></script>
<script src="/assets/js/stay.js?v={VERSION}" defer></script>
<script>
  window.va=window.va||function(){{(window.vaq=window.vaq||[]).push(arguments)}};
  if(['localhost','127.0.0.1','[::1]'].indexOf(location.hostname)<0&&location.protocol!=='file:'){{var a=document.createElement('script');a.defer=true;a.src='/_vercel/insights/script.js';document.head.appendChild(a)}}
</script>
</body>
</html>
'''


def not_found():
    p, n = PT['notFound'], EN['notFound']
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VÉRANA · 404</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#FFFEFA">
<link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap">
<link rel="stylesheet" href="/assets/css/tokens.css?v={VERSION}">
<style>
  body{{margin:0;min-height:100svh;display:grid;place-items:center;background:var(--canvas);color:var(--text-primary);font-family:var(--font-body);padding:24px}}
  main{{max-width:560px;text-align:center;display:grid;justify-items:center;gap:18px;animation:in .9s cubic-bezier(.16,1,.3,1) both}}
  @keyframes in{{from{{opacity:0;transform:translateY(10px)}}}}
  .logo{{display:inline-flex;align-items:center;gap:10px;color:var(--accent);text-decoration:none}}
  .logo svg{{width:28px;height:28px}}
  .logo span{{font-family:var(--font-display);font-size:20px;letter-spacing:.14em;color:var(--text-primary)}}
  .code{{font-family:var(--font-display);font-size:clamp(5rem,3rem + 10vw,9rem);line-height:1;letter-spacing:-.04em;color:var(--gold-soft,#F2C063)}}
  h1{{font-family:var(--font-display);font-weight:400;font-size:clamp(1.75rem,1.3rem + 1.6vw,2.5rem);line-height:1.1;margin:0}}
  p{{color:var(--text-secondary);margin:0;line-height:1.6}}
  a.btn{{margin-top:10px;display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border-radius:12px;background:var(--accent);color:var(--canvas);text-decoration:none;font-weight:500}}
  [data-l="en"]{{display:none}} html[lang="en"] [data-l="pt"]{{display:none}} html[lang="en"] [data-l="en"]{{display:revert}}
  @media (prefers-reduced-motion:reduce){{main{{animation:none}}}}
</style>
<script>try{{var l=localStorage.getItem('verana-lang')||((navigator.language||'pt').toLowerCase().indexOf('pt')===0?'pt':'en');if(l==='en')document.documentElement.lang='en'}}catch(_){{}}</script>
</head>
<body>
<main>
  <a class="logo" href="/" aria-label="VÉRANA"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 28V12"/><path d="M16 22c-6.5-1-9.5-6-9-13 6 .6 9 4.6 9 10"/><path d="M16 18c5.5-.8 8.5-5 8-11-5 .5-8 3.8-8 8.6"/></svg><span>VÉRANA</span></a>
  <p class="code" aria-hidden="true">404</p>
  <h1><span data-l="pt">{e(p['title'])}</span><span data-l="en" lang="en">{e(n['title'])}</span></h1>
  <p><span data-l="pt">{e(p['text'])}</span><span data-l="en" lang="en">{e(n['text'])}</span></p>
  <a class="btn" href="/"><span data-l="pt">{e(p['button'])}</span><span data-l="en" lang="en">{e(n['button'])}</span></a>
</main>
</body>
</html>
'''


def main():
    open(os.path.join(ROOT, '404.html'), 'w', encoding='utf-8').write(not_found())
    open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>{DOMAIN}/</loc><xhtml:link rel="alternate" hreflang="pt-BR" href="{DOMAIN}/"/><xhtml:link rel="alternate" hreflang="en" href="{DOMAIN}/?lang=en"/></url>
{"".join(f'  <url><loc>{DOMAIN}/hospedagem/?id={x["id"]}</loc></url>' + chr(10) for x in PT['stays']['items'] + EN['stays']['items'])}</urlset>
''')
    os.makedirs(os.path.join(ROOT, 'hospedagem'), exist_ok=True)
    open(os.path.join(ROOT, 'hospedagem', 'index.html'), 'w', encoding='utf-8').write(stay_page())
    out = build()
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(out)
    os.makedirs(os.path.join(ROOT, 'en'), exist_ok=True)
    open(os.path.join(ROOT, 'en', 'index.html'), 'w', encoding='utf-8').write(REDIRECT_EN)  # endereço antigo /en/ leva para a página única
    print('ok', len(out))


if __name__ == '__main__':
    main()
