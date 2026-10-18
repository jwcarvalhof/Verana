"""Gera case/index.html (página de portfólio, fora do site) a partir de case/src.html."""
import os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://verana-jet.vercel.app/'
src = open(os.path.join(ROOT, 'case', 'src.html'), encoding='utf-8').read()
home = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
sprite = re.search(r'<svg xmlns="http://www.w3.org/2000/svg" style="display:none">.*?</svg>', home, re.S).group(0)
names = ['mountain', 'wave', 'fireplace', 'coffee', 'bed', 'guests', 'garden', 'pool', 'bath', 'thermo', 'calendar', 'pin', 'heart', 'star', 'leaf']
icons = ''.join(f'<span title="{n}"><svg class="icon" aria-hidden="true"><use href="#i-{n}"/></svg></span>' for n in names if f'id="i-{n}"' in sprite)
out = src.replace('{{SPRITE}}', sprite).replace('{{ICONS}}', icons).replace('{{SITE_SHORT}}', SITE.replace('https://', '').rstrip('/')).replace('{{SITE}}', SITE)
os.makedirs(os.path.join(ROOT, 'case', 'assets'), exist_ok=True)
for f in ('ApfelGrotezk-Regular.woff2', 'ApfelGrotezk-Mittel.woff2'):
    shutil.copy(os.path.join(ROOT, 'assets', 'fonts', f), os.path.join(ROOT, 'case', 'assets', f))
shutil.copy(os.path.join(ROOT, 'assets', 'icons', 'favicon.svg'), os.path.join(ROOT, 'case', 'assets', 'favicon.svg'))
open(os.path.join(ROOT, 'case', 'index.html'), 'w', encoding='utf-8').write(out)
print('ok', len(out), icons.count('<span'))
