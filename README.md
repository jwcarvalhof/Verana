# VÉRANA

Landing page de descoberta e reserva de hospedagens, em português e inglês. Marca conceitual. HTML, CSS e JavaScript puros, sem framework, pronta para o Vercel.

## Uma página, dois idiomas

Tudo fica em `index.html`. O seletor **PT · EN** troca na hora textos, fotos, destinos, preços e moeda, sem recarregar.

| Idioma | Destinos |
|---|---|
| Português | Só Brasil: Gramado e Canela, Urubici, Serra da Mantiqueira, Trancoso, Praia do Forte |
| English | Só fora do Brasil: Stowe, Zermatt, Val d'Orcia, Mallorca, Dolomitas, Alpes suíços |

O idioma inicial segue o navegador do visitante (português para quem usa português, inglês para os demais). A escolha fica salva, e o link `?lang=en` abre direto em inglês. O endereço antigo `/en/` leva para `?lang=en`.

```
VÉRANA/
├── index.html                     ← página gerada (não edite à mão)
├── hospedagem/index.html          ← página completa de cada hospedagem (gerada)
├── en/index.html                  ← só redireciona para ?lang=en
├── 404.html · robots.txt · sitemap.xml  ← gerados pelo build
├── vercel.json · .vercelignore    ← configuração do Vercel
├── content/                       ← textos, fotos e créditos de cada idioma
├── tools/build.py                 ← gera as duas páginas a partir de content/
├── docs/                          ← decisões de marca, copy, imagens e versão EN
├── referencias/                   ← o que você enviou, sem alterações
└── assets/
    ├── css/tokens.css · site.css
    ├── js/site.js
    ├── fonts/                     ← Apfel Grotezk (OFL)
    ├── icons/
```

## O que a página tem

Abertura curta na primeira visita (logo e uma linha; some sozinha, toque para pular, não aparece com movimento reduzido), hero com busca, um dia no seu tempo (fotos em tela cheia), estações (com o clima do mês em cada card), explorar destinos (com filtros por serra, praia, campo, frio e calor), 6 hospedagens com favoritos (o coração fica salvo neste navegador e o botão Favoritos filtra a lista), perguntas frequentes e encerramento.

Ao clicar numa hospedagem, abre um painel por cima do site, com a foto do lugar desfocada ao fundo. No topo, três palavras ligadas por uma linha fina mostram onde o hóspede está (O lugar · Seus dados · Confirmado). São 3 etapas: detalhes (galeria, o que tem, como chegar, datas e total), dados de quem vai viajar e confirmação com código. A reserva é simulada: nada é cobrado nem enviado.

O painel é um resumo (fotos, texto curto, 4 itens e a reserva). O botão **Ver tudo sobre a hospedagem** abre a página completa em `hospedagem/?id=...`: foto em tela cheia, melhor época, anfitrião, quartos, tudo o que tem, avaliações com notas por tema, mapa (OpenStreetMap, com a área aproximada), bom saber e opções parecidas. Lá o hóspede escolhe as datas, toca em Reservar e volta para a página inicial já na etapa Seus dados. As hospedagens do Brasil abrem em português e as de fora em inglês.

## Editar textos ou fotos

1. Mude `content/pt.json` ou `content/en.json`.
2. Rode `python3 tools/build.py` na pasta do projeto.
3. A página é gerada de novo. PT e EN precisam ter as mesmas listas (4 momentos, 4 estações, 5 destinos, 6 hospedagens); o build avisa se não tiverem.

## Ver no computador

Abra um terminal nesta pasta e rode `npx http-server` (ou `python -m http.server`). Depois abra o endereço que aparecer. A página completa da hospedagem precisa desse servidor local (clicar duas vezes no arquivo não basta).

## Publicar no Vercel

Importe a pasta como projeto estático (Framework: Other, sem build). O `.vercelignore` deixa `docs/`, `content/`, `tools/`, `referencias/` e `Imagens/` fora do ar.

Já vem pronto: imagem de compartilhamento própria (`assets/og.jpg`, 1200x630), página `404.html` nos dois idiomas, `robots.txt` e `sitemap.xml`.

Depois de publicar:
1. Troque `DOMAIN` no topo de `tools/build.py` pelo endereço final e rode o build (atualiza og, canonical, robots e sitemap).
2. No Vercel, abra o projeto e ative **Analytics**. O script de visitas já está na página e só carrega no site publicado. Reservas simuladas contam como o evento `reserva_simulada` (eventos personalizados dependem do plano).

## O que é demonstrativo

Hospedagens, preços, notas e contatos são fictícios e estão identificados na página. A busca filtra os exemplos e não faz reservas. As fotos de lugares são reais, com local conferido, e os créditos estão no rodapé.
