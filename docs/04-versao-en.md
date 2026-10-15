# 04 · Versão em inglês (/en/)

## Regra de separação

Uma página só (`index.html`). O seletor **PT · EN** troca o conteúdo na hora:

| | Português | Inglês |
|---|---|---|
| Destinos | Só Brasil | **Só fora do Brasil. Nada brasileiro aparece** |
| Moeda | R$ por diária | US$ per night |
| Datas | formato brasileiro | formato americano |

Os dois idiomas ficam em `content/pt.json` e `content/en.json` e vão embutidos na página. O idioma inicial segue o navegador; `?lang=en` abre em inglês.

## Destinations by season

| Season | Real destination | Why | Best time |
|---|---|---|---|
| Autumn | **Stowe, Vermont, USA** | New England maples turn red and gold | Late Sep to mid Oct |
| Winter | **Zermatt, Switzerland** | Reliable snow, wooden chalets, the Matterhorn | Dec to Mar |
| Spring | **Val d'Orcia, Tuscany, Italy** | Green rolling hills, cypress lines, wildflowers | Apr to May |
| Summer | **Mallorca, Spain** | Long days, calm coves, houses with pools by the sea | Jun to Sep |

Hero: **Corvara, Dolomites, Italy**. Moments: Toblach, Allmendhubel, Misurina and Seceda (Alps). Closing: **Douro Valley, Portugal**.

## Copy (ships exactly as written)

### Nav and hero
- Links: **Explore destinations** · **Seasons** · **How it works** · button **Find a place to stay**
- Kicker: **Find your next destination**
- Title: **Some days ask for a change of scenery.**
- Text: **A cabin among the trees, a window facing the sea, or a few days away from routine. Find a place that fits what you need right now.**
- Photo caption: **Corvara, Dolomites, Italy**

### Booking form: "Where would you like to go?"
| Field | Placeholder |
|---|---|
| Destination | City, region or kind of place |
| Check in | Add date |
| Check out | Add date |
| Guests | How many people are traveling? |

Button **Find a place to stay**. Suggestions: Stowe, Vermont · Zermatt, Switzerland · Val d'Orcia, Tuscany · Mallorca, Spain. Guests: **Adults** (13 or older) · **Children** (2 to 12) · **Done**.

Messages: **Tell us where you'd like to go, or pick one of the suggestions.** · **Check out needs to come after check in.** · **We found {n} places that may fit {destination}.** · **Demo results. This is a prototype and no booking is made.** · **We don't have sample places for that search yet. How about the seasons below?**

### Scenes
| Scene | Line | Supporting text |
|---|---|---|
| 01 · The room | Imagine waking up without checking the time. | Light coming through the window, quiet all around, and a morning that starts at your pace. |
| 02 · The view | Your coffee can wait a little. | Maybe you'd rather spend a few more minutes looking at the view. |
| 03 · Free time | Today, you don't need to be anywhere. | Enjoy the space, choose your rhythm and let the day happen without rushing. |
| 04 · End of the day | What if today ended a little slower? | A cozy room, an unhurried conversation, or simply some time of your own. |

Caption: **A chalet in the Dolomites, South Tyrol**

### Seasons
- Title: **What kind of trip is on your mind?**
- Text: **Maybe you want the cold, the green after the rain, or days close to the sea. Pick a season and find places that match it.**

| Season | Destination | Line |
|---|---|---|
| Autumn | Stowe, Vermont · late Sep to mid Oct | For when you want warmth, golden landscapes and slow afternoons. |
| Winter | Zermatt, Switzerland · December to March | For enjoying the cold, staying close to the fireplace and sleeping in a little. |
| Spring | Val d'Orcia, Tuscany · April to May | For spending more time outdoors and finding landscapes that change with every path. |
| Summer | Mallorca, Spain · June to September | For long days, staying close to the water and doing everything without a set schedule. |

Button: **Find my getaway**

### Stays
- Title: **Places that may fit your plans.**
- Text: **Here are a few options to start picturing your next trip.**
- Badge: **Illustrative prices and ratings, part of the prototype.**
- Button: **View stay**

Each card sits in the same destination as one season, so "Find my getaway" always finds a place. Final copy in `content/en.json`.

| Name | Location | Description | Features | Night* | Rating* |
|---|---|---|---|---|---|
| Inn among the maples | Stowe, Vermont, USA | Golden hills, quiet roads and warm evenings by the window. | 2 guests · 1 bedroom · fireplace | US$ 210 | 4.9 |
| Cabin in the mountains | Zermatt, Switzerland | A quiet place to enjoy the cold, the view and your free time. | 2 guests · 1 bedroom · fireplace | US$ 290 | 4.9 |
| Farmhouse in the hills | Val d'Orcia, Tuscany, Italy | Stone walls, cypress trees and long lunches outside. | 4 guests · 2 bedrooms · garden | US$ 240 | 4.8 |
| House by the sea | Mallorca, Spain | A few steps from the water, with mornings that start slowly. | 4 guests · 2 bedrooms · sea view | US$ 320 | 4.9 |

\* Illustrative values.

### FAQ
- Title: **Good to know before you choose.** · Text: **A few details help you plan the trip with more peace of mind.**

| Question | Answer |
|---|---|
| How does booking work? | You choose the destination, add your dates and the number of guests to see the places available. |
| Can I find a place for a special occasion? | Yes. You can explore places by season, type of setting and the features that make sense for your trip. |
| How do I know if a place is available? | Add the dates you want to check availability for your stay. |
| What if my plans change? | Change and cancellation terms depend on each place. Check the rules before confirming your booking. |

### Closing and footer
- **Do you already have an idea of how you'd like to spend these days?** · **Now all that's left is finding a place that fits it.** · button **Let's find your place to stay** · caption **Douro Valley, Portugal**
- Footer line: **Places for the moment of your trip.** · columns Explore, Seasons, Contact (fictional): hello@verana.example
- Notice: **VÉRANA is a concept brand created for this prototype. Stays, prices, ratings and contacts are for demonstration. Images were generated for the project and depict real destinations.**
- Privacy · Terms (demo) · © 2026 VÉRANA

## Imagens da versão EN

Fotos reais com local confirmado, listadas em `03-imagens-e-video.md`. Nenhuma imagem da versão EN mostra o Brasil.
