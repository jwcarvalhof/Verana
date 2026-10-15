"""Gera uma prévia para ver no Claude (pasta fora do projeto). Não vai para o Vercel.
Na prévia: caminhos relativos, #id no lugar de ?id=, e fotos externas trocadas por fundos da paleta
(a área de prévia bloqueia imagens de outros sites)."""
import os, re, sys, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1]
PH = r'''<script>window.VR_PREVIEW=1;(function(){var P=[['#D9C252','#8C2F0D'],['#F2C063','#655D52'],['#E9DFC2','#C9A64A'],['#8C2F0D','#F2C063'],['#655D52','#E9DFC2'],['#B98A3E','#4E3A2A']];
function ph(t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))|0;var c=P[Math.abs(h)%P.length];
return 'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#g)"/><circle cx="1180" cy="320" r="140" fill="#F2C063" opacity=".5"/><ellipse cx="420" cy="1120" rx="900" ry="400" fill="#4E3A2A" opacity=".28"/><ellipse cx="1320" cy="1160" rx="820" ry="380" fill="#8C2F0D" opacity=".3"/></svg>')}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&(t.getAttribute('src')||'').indexOf('data:')!==0){t.removeAttribute('srcset');t.dataset.fallback='1';t.src=ph(t.alt||t.getAttribute('src')||'v')}},true)})();</script>'''
ANALYTICS = re.compile(r'<script>\s*(// Vercel Web Analytics[^\n]*\n)?\s*window\.va=.*?</script>\s*', re.S)
LEAF_CSS = '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="">'

def prep(html, wrap):
    html = ANALYTICS.sub('', html)
    html = html.replace(LEAF_CSS, '<link rel="stylesheet" href="assets/leaflet.css">')
    html = html.replace('"/assets/', '"assets/').replace('href="/"', 'href="./"')
    if wrap:  # a página principal é envolvida pelo Claude: tira doctype, html, head e body
        html = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*', '', html, flags=re.I)
        html = html.replace('</head>\n<body>', '').replace('</body>\n</html>', '')
        return PH + '\n' + html
    return html.replace('<head>', '<head>\n' + PH, 1)

os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(prep(open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read(), True))
open(os.path.join(OUT, 'hospedagem.html'), 'w', encoding='utf-8').write(prep(open(os.path.join(ROOT, 'hospedagem', 'index.html'), encoding='utf-8').read(), False))
for d in ('assets/css', 'assets/js', 'assets/fonts', 'assets/icons'):
    shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d), dirs_exist_ok=True)
if len(sys.argv) > 2: shutil.copy(sys.argv[2], os.path.join(OUT, 'assets', 'leaflet.css'))
print('ok')
