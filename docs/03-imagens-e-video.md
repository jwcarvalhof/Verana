# 03 · Imagens

**Decisão:** sem geração por IA. Todas as fotos de lugar são **fotos reais**, com o local conferido na página de cada foto. Elas vêm do Unsplash (licença Unsplash, uso livre) e, numa delas, do Wikimedia Commons (CC BY-SA 4.0, crédito obrigatório). Os créditos aparecem no rodapé de cada versão e ficam guardados em `content/credits.json`.

**Como carregam:** as fotos do Unsplash e do Commons são carregadas direto dos servidores deles, que já entregam o tamanho certo para cada tela (o que o Unsplash recomenda).

**Vídeo:** sem vídeo por enquanto. Os 4 momentos trocam de foto conforme o scroll, sempre junto com a frase.

**Fotos como ambiente:** os momentos e o encerramento ocupam a tela toda, e o fundo da seção de estações é a própria foto da estação ativa, desfocada.

## Um dia no seu tempo (foto em tela cheia)

Cada idioma tem sua série, sempre num lugar real. A foto ocupa a tela inteira e desliza devagar; o texto de cada momento entra pela direita e sai pela esquerda.

| Momento | PT · Praia do Forte, BA | EN · Alpes |
|---|---|---|
| Acordar | Nascer do sol na praia (Felipe Dias) | Lago com névoa em Toblach, Tirol do Sul (Kevin Schmid) |
| O café | Varanda aberta com jardim (Alef Morais) | Terraço com vista para a neve, Allmendhubel, Suíça (Barney Goodman) |
| Tempo livre | Piscina com espreguiçadeiras (Alef Morais) | Lago de Misurina, Dolomitas (Rafael Peier) |
| Fim do dia | Pôr do sol (Marcus Dall Col) | Refúgio em Seceda ao entardecer (Tobias Reich) |

As fotos de cena enviadas antes (em `assets/images/shared/scenes/`) não são mais usadas.

## Versão PT (só Brasil)

| Lugar no site | Local confirmado | Autor |
|---|---|---|
| Hero | Gonçalves, Serra da Mantiqueira, MG | Rafael Vianna Croffi |
| Outono | Gramado, RS | Luiza Carvalho |
| Inverno | Urubici, SC | Ivan Cheremisin |
| Primavera | Vale da Mantiqueira, Virgínia, MG | Jean Carlos |
| Verão | Trancoso, BA | Mauro Lima |
| Cabana entre as montanhas | Urubici, SC | Ivan Cheremisin |
| Cabana no campo | Canela, RS | Nathan Mateus |
| Fazenda no vale | Vale da Mantiqueira, MG | Jean Carlos |
| Casa no Quadrado | Trancoso, BA | Nathalia Segato |
| Encerramento | Vale do Quilombo, Gramado, RS (Commons, CC BY-SA 4.0) | Yeuxpapilon |

## Versão EN (só fora do Brasil)

| Lugar no site | Local confirmado | Autor |
|---|---|---|
| Hero | Corvara, Dolomitas, Itália | Tobias Rademacher |
| Autumn | Stowe, Vermont, EUA | Abhi Verma |
| Winter | Zermatt, Suíça | Young Shih |
| Spring | Val d'Orcia, Itália | Riccardo Cervia |
| Summer | Cala s'Almunia, Mallorca, Espanha | Reiseuhu |
| Inn among the maples | Stowe, Vermont, EUA | Jeffrey Clayton |
| Cabin in the mountains | Zermatt, Suíça | Franck Ridel |
| Farmhouse in the hills | Val d'Orcia, Itália | Mattia Bericchia |
| House by the sea | Mallorca, Espanha | Shery Arturova |
| Closing | Douro, Portugal | Maksym Kaharlytskyi |

## Trocar uma foto

1. Abra `content/pt.json` ou `content/en.json` e troque o campo `src` da imagem. Use `u:photo-...` para Unsplash, `c:caminho|largura` para Commons ou `l:assets/...` para um arquivo da pasta.
2. Adicione o autor em `content/credits.json`.
3. Rode `python3 tools/build.py` para gerar as páginas de novo.
