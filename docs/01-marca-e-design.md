# 01 · Marca e design

## Conceito

**VÉRANA ajuda a encontrar um lugar que combine com o momento da viagem.** Marca conceitual de hospedagem: acolhedora, calma, natural. Não é rede hoteleira, não é marketplace genérico, não é luxo ostentoso.

**Voz:** alguém ajudando a planejar uma viagem. Frases curtas, sensoriais, títulos que parecem pensamentos. Sem hífens ou travessões na copy. Dado fictício sempre identificado como demonstração.

**Proibido:** "Luxo à sua espera", "As melhores acomodações", "Experiência inesquecível", "Descubra o extraordinário", "Momentos únicos", "Seu refúgio perfeito".

**Elemento assinatura:** a luz que muda com a estação. Brilho difuso atrás do card ativo e cor ambiente que acompanha o scroll. O resto da interface fica quieto para a fotografia aparecer.

**Logo:** VÉRANA em Apfel Grotezk 500, caixa alta, espaçamento 0.24em, com uma folha em traço único dourado. A folha vira o favicon.

**Idiomas:** português em `/` (só destinos no Brasil) e inglês em `/en/` (só destinos fora do Brasil). A identidade visual é a mesma nas duas, e o conteúdo é totalmente separado. A versão EN está em `04-versao-en.md`.

## Destinos reais por estação (versão PT)

| Estação | Destino | Por que é real | Época |
|---|---|---|---|
| Outono | Gramado e Canela, RS | Plátanos dourados, auge em maio | Abr a mai |
| Inverno | Urubici, SC | Geada, temperaturas abaixo de zero, chalés com lareira entre araucárias | Jun a ago |
| Primavera | Serra da Mantiqueira, MG | Mata verde depois das chuvas, trilhas, flores | Set a nov |
| Verão | Trancoso, BA | Dias longos, mar calmo, casas entre coqueiros | Dez a mar |

Neve em Urubici não acontece todo ano, então o inverno mostra **geada e névoa**, o que o visitante realmente encontra.

**O que hóspedes valorizam** (avaliações reais): "a paz e o silêncio", "lareira perfeita", "exatamente como nas fotos", "fomos muito bem recebidos". **O que trava a reserva:** regras de cancelamento confusas. Por isso preços claros, características concretas e FAQ objetivo.

Fontes: [Melhores Destinos](https://www.melhoresdestinos.com.br/quando-ir-a-gramado.html) · [Quanto Custa Viajar](https://quantocustaviajar.com/blog/pousada-em-urubici-tem-chales-com-hidromassagem-e-lareira) · [Estado de Minas](https://www.em.com.br/turismo/2024/09/6950033-ode-a-primavera.html) · [Wanderlog](https://wanderlog.com/place/details/4449298/cabanas-charme-da-serra)

## Cores

Valores em `assets/css/tokens.css`.

| Token | Hex | Uso |
|---|---|---|
| Branco quente | `#FFFEFA` | Fundo predominante |
| Creme natural | `#F2ECD8` | Superfícies secundárias |
| Amarelo outonal | `#D9C252` | Luz e detalhes, nunca texto |
| Dourado suave | `#F2C063` | Brilho das estações, nunca texto |
| Terracota | `#8C2F0D` | Ações principais e seleção, em doses raras |
| Marrom acinzentado | `#655D52` | Texto secundário |
| Texto principal | `#2B2621` | Títulos e corpo |

**Contraste medido:** texto principal 14.8:1 · terracota 8.2:1 · botão (branco sobre terracota) 8.2:1 · marrom acinzentado 6.4:1 no branco, 5.5:1 no creme · amarelo e dourado 1.7:1, por isso nunca em texto.

**Cor ambiente das estações:** outono `#F6ECD6` · inverno `#EDEBE6` · primavera `#EEF0E1` · verão `#F6EBD8`. Todas da família creme, troca lenta de 1.2s.

A variante "Brukt" da Apfel Grotezk tem textura gasta e não é um peso leve, por isso fica fora do site.

Nota: creme com terracota costuma ser visual genérico, mas aqui é o mundo da marca (madeira, pedra, linho, fim de tarde). Fica, com a terracota rara e as cores calibradas pela fotografia.

## Tipografia

| Papel | Fonte | Pesos |
|---|---|---|
| Títulos, frases editoriais, estações, logo | **Apfel Grotezk** (OFL, local em `assets/fonts/`) | 400 Regular, 500 Mittel |
| Navegação, texto, formulário, preços, botões | **DM Sans** (Google Fonts) | 400, 500 |

| Nível | Desktop | Mobile |
|---|---|---|
| Hero | 72px | 40px |
| Título de seção | 44px | 30px |
| Frase de cena | 40px | 28px |
| Título de card | 22px | 18px |
| Introdução | 19px | 17px |
| Corpo | 16px | 16px |
| Labels | 12 a 13px, caixa alta, 0.18em | 12px |

## Layout, raios, sombras, movimento

- Conteúdo até 1440px · margens 64px (desktop) a 20px (celular) · 96 a 144px entre seções
- Raios: campos e botões 10px · cards 16px · imagens principais 24px
- Sombras: só no formulário sobre a foto e no hover dos cards
- Ícones lineares, traço 1.5px, só onde ajudam a ler
- Movimento: só `transform` e `opacity`. Entradas com `cubic-bezier(.16,1,.3,1)` (começa decidida, pousa macia), 0,9 a 1,1 s, deslocamento de 12 a 14 px e sequência de 80 ms entre itens vizinhos. Saídas curtas (0,2 a 0,3 s). Trocas de foto em 0,8 s com leve assentamento da imagem. Tudo desliga com movimento reduzido

## Componentes

Header · BookingForm · ScrollStory · SeasonExperience · SeasonCard · AccommodationCard · FAQ · Footer
