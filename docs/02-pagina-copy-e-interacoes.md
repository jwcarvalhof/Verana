# 02 · Página, copy e interações

Versão PT (`/`). A versão EN tem a própria copy em `04-versao-en.md`. A estrutura e as interações abaixo valem para as duas, e o header de ambas tem o seletor **PT · EN**.

Texto final, na ordem da página. Vai para o site exatamente assim. (B) = briefing, (N) = novo no mesmo tom.

## 1. Navegação e hero

- Links: **Explorar destinos** · **Estações** · **Como funciona** · botão **Encontrar hospedagem** (B)
- Kicker: **Encontre seu próximo destino** (N)
- Título: **Tem dias que pedem uma mudança de cenário.** (B)
- Texto: **Uma cabana entre as árvores, uma janela de frente para o mar ou alguns dias longe da rotina. Encontre um lugar que combine com o que você precisa agora.** (B)
- Legenda da foto: **Gonçalves, Serra da Mantiqueira, MG** (N)

**Formulário** "Para onde você quer ir?" (N)

| Campo | Placeholder (B) |
|---|---|
| Destino | Cidade, região ou tipo de lugar |
| Entrada | Adicionar data |
| Saída | Adicionar data |
| Hóspedes | Quantas pessoas vão viajar? |

Botão **Encontrar hospedagem**. Sugestões: Gramado e Canela, Urubici, Serra da Mantiqueira, Trancoso. Hóspedes abre seletor de Adultos e Crianças.

**Comportamento:** labels visíveis, foco em terracota, datas validadas (saída depois da entrada), destino com sugestões navegáveis por teclado. Ao buscar, aparece um painel de resultados filtrados dos dados de exemplo com o selo **"Resultados de demonstração. Este é um protótipo e nenhuma reserva é feita."** Sem resultado: **"Ainda não temos lugares de exemplo para essa busca. Que tal olhar as estações logo abaixo?"**

## 2. Um dia no seu tempo

Sem a palavra "Cena". Cada momento tem só a frase, o complemento e o lugar.

| Frase (B) | Complemento (B) |
|---|---|
| Imagine acordar sem olhar as horas. | Luz entrando pela janela, silêncio ao redor e uma manhã que começa no seu tempo. |
| Seu café pode esperar um pouco. | Talvez você prefira ficar mais alguns minutos olhando a paisagem. |
| Hoje, você não precisa chegar a lugar nenhum. | Aproveite o espaço, escolha seu ritmo e deixe o dia acontecer sem tanta pressa. |
| E se hoje terminasse um pouco mais devagar? | Um ambiente acolhedor, uma conversa sem pressa ou simplesmente um tempo só seu. |

**Comportamento:** a foto ocupa a tela inteira, presa por cerca de 460vh, e desliza devagar da direita para a esquerda. O texto de cada momento entra pela direita, para no canto inferior esquerdo e sai pela esquerda quando o próximo chega. Foto e frase mudam juntas. Embaixo, 4 linhas finas de progresso e o contador 01 / 04. No celular e com movimento reduzido, viram 4 fotos grandes empilhadas com o texto por cima.

## 3. Estações

- Título: **Que tipo de viagem está passando pela sua cabeça?** (B)
- Texto: **Talvez você queira o frio, o verde depois da chuva ou dias perto do mar. Escolha a estação e descubra lugares que combinam com ela.** (B)

| Estação | Destino (N) | Frase (B) |
|---|---|---|
| Outono | Gramado e Canela, RS | Para quando você quer aconchego, paisagens douradas e tardes sem pressa. |
| Inverno | Urubici, SC | Para aproveitar o frio, ficar perto da lareira e dormir mais um pouco. |
| Primavera | Serra da Mantiqueira, MG | Para passar mais tempo ao ar livre e descobrir paisagens que mudam a cada caminho. |
| Verão | Trancoso, BA | Para aproveitar os dias longos, estar perto da água e fazer tudo sem tanta hora marcada. |

Botão de todas: **Encontrar meu refúgio** (B), que preenche o formulário com o destino e mostra os resultados.

**Comportamento:** seção fixa de cerca de 480vh, com pouco texto: só o título curto no alto e, no card, o nome da estação grande, o lugar, a frase e o botão. O card ocupa cerca de 72% da largura e 70% da altura da tela; o próximo aparece ao lado. O fundo da seção é a foto da estação ativa, desfocada, e muda junto com o card. Indicador "1 / 4" com pontos e o nome da estação escrito (a estação nunca depende só da cor). Depois da quarta, a página segue normalmente. Teclado: botões anterior e próxima rolam até a estação certa. Celular e movimento reduzido: cards empilhados, sem fixar.

## 4. Acomodações

- Título: **Lugares que podem combinar com seus planos.** (B)
- Texto: **Veja algumas opções para começar a imaginar sua próxima viagem.** (B)
- Selo: **Preços e avaliações ilustrativos, parte do protótipo.** (N)

Cada card fica no mesmo destino de uma estação, então o botão "Encontrar meu refúgio" sempre encontra um lugar. Textos finais em `content/pt.json`.

| Nome | Local | Descrição | Características | Diária* | Nota* |
|---|---|---|---|---|---|
| Cabana entre as montanhas | Urubici, Serra Catarinense, SC | Um espaço tranquilo para aproveitar o frio, a paisagem e o tempo livre. (B) | 2 hóspedes · 1 quarto · lareira | R$ 480 | 4,9 |
| Cabana no campo | Canela, Serra Gaúcha, RS | Madeira antiga, campo aberto e tardes douradas no outono. | 4 hóspedes · 2 quartos · jardim | R$ 540 | 4,8 |
| Fazenda no vale | Virgínia, Serra da Mantiqueira, MG | Cavalos no pasto, café da roça e trilhas entre as montanhas. | 6 hóspedes · 3 quartos · café incluso | R$ 620 | 4,8 |
| Casa no Quadrado | Trancoso, BA | Uma casa colorida sob as árvores, a poucos passos do mar. | 4 hóspedes · 2 quartos · perto da praia | R$ 760 | 4,9 |

\* Valores ilustrativos. Botão de cada card: **Ver hospedagem** (B), abre um painel com mais detalhes e o mesmo selo de demonstração.

Grade: 4 colunas no desktop, 2 no tablet, 1 no celular. Fotos em 4:3.

## 5. FAQ

- Título: **Antes de escolher, vale saber.** · Texto: **Algumas informações ajudam você a planejar a viagem com mais tranquilidade.** (B)

| Pergunta (B) | Resposta (B) |
|---|---|
| Como funciona a reserva? | Você escolhe o destino, informa as datas e o número de hóspedes para consultar as acomodações disponíveis. |
| Posso encontrar uma hospedagem para uma ocasião especial? | Sim. Você pode explorar lugares de acordo com a estação, o tipo de ambiente e as características que fazem sentido para sua viagem. |
| Como sei se uma acomodação está disponível? | Informe as datas desejadas para consultar a disponibilidade correspondente à sua estadia. |
| E se meus planos mudarem? | As condições de alteração e cancelamento dependem de cada hospedagem. Consulte as regras antes de confirmar sua reserva. |

Accordion com `<button aria-expanded>`, linhas finas, chevron que gira, altura animada.

## 6. Encerramento

- **Você já tem uma ideia de como gostaria de passar esses dias?** · **Agora falta encontrar um lugar que combine com ela.** · botão **Vamos encontrar sua hospedagem** (B), volta ao formulário com o Destino em foco.
- Legenda: **Vale do Quilombo, Gramado** (N)

## 7. Rodapé (N)

Logo e a linha **Lugares para o momento da sua viagem.** Colunas Explorar, Estações e Contato fictício (ola@verana.exemplo). Aviso: **VÉRANA é uma marca conceitual criada para este protótipo. Hospedagens, preços, avaliações e contatos são demonstrativos. As imagens foram geradas para o projeto e representam destinos reais.** Links Privacidade e Termos (demonstração). © 2026 VÉRANA.

## Acessibilidade e responsividade

- Landmarks `nav`, `main`, `footer`, link "Ir para o conteúdo", hierarquia de títulos real
- Foco visível em terracota, alvos de toque de 44px, labels em todos os campos
- `alt` descritivo em toda imagem; vídeo decorativo com `aria-hidden`
- `prefers-reduced-motion`: sem vídeo, sem seções fixas, tudo no estado final
- Celular: formulário vertical, cenas e estações empilhadas, títulos sem quebra ruim
- Sem rolagem lateral em nenhuma largura

## Checklist antes de publicar

1. A primeira dobra comunica a proposta e a foto domina?
2. Copy sem travessões, hífens ou frases proibidas?
3. Formulário, sugestões, seletor de hóspedes, FAQ e botões funcionam de verdade?
4. Cenas: frase e imagem sempre sincronizadas?
5. Estações: card ativo no centro, próximo visível, brilho suave, cor muda devagar?
6. Dados fictícios identificados em todo lugar onde aparecem?
7. Funciona em 375px, 768px, 1280px e 1440px, com teclado e com movimento reduzido?
8. Console sem erros, página completa mesmo se o vídeo não carregar?
