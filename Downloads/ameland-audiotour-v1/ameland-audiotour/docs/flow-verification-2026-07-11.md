# Flowverificatie — 11 juli 2026

## Geteste klantreis

1. Marketingwebsite naar checkout.
2. Checkout met gelokaliseerde tourgegevens, e-mailveld, Mollie-doorstuuractie en vertrouwensinformatie.
3. Mollie-webhook en idempotente aanmaak van een persoonlijke toegangstoken.
4. Toegangspagina met controle op betaalstatus en vervaldatum.
5. Mobiele tourplayer met GPS, stopselectie, looproute, audio en persistente voortgang.
6. Afronding via één beveiligde API-call.
7. Automatische bedankmail en geplande reviewherinnering.
8. Beveiligde reviewlink en intern signaal bij een score van drie of lager.

## UX-verbeteringen

- Eén audiomotor in plaats van dubbele bediening.
- GPS-nauwkeurigheid en de ingestelde radius per stop worden meegenomen.
- Aankomst en beluisterde voortgang zijn afzonderlijke statussen.
- Voortgang en taal blijven lokaal bewaard na verversen of opnieuw openen.
- Na afloop van een verhaal wordt de volgende onbeluisterde stop geselecteerd.
- Vaste mobiele navigatie met vorige, afspelen/pauzeren en volgende/afronden.
- Alle stops blijven zichtbaar en selecteerbaar op kaart en in de routelijst.
- Looproute met duidelijke fallback als de externe routebron niet beschikbaar is.
- Duidelijkere checkout met prijs in de betaalbutton, 48-uurs toegang, e-mailcontrole en juridische links.
- Nieuwe bedank- en reviewpagina's in Nederlands, Engels en Duits.

## Aftersales en betrouwbaarheid

- Eén tourafronding per bestelling.
- Eén reviewtoken per bestelling, dertig dagen geldig.
- Eén directe afrondingsmail en één geplande herinnering per bestelling.
- Idempotente registratie voorkomt dubbele nazorg bij herhaalde requests.
- Scores van drie of lager maken één intern opvolgsignaal aan.
- Nazorgtabellen zijn afgeschermd met RLS en niet toegankelijk voor anonieme of ingelogde browserclients.

## Technische verificatie

- Next.js production build voltooid.
- Typecontrole en paginageneratie voltooid.
- Nieuwe routes `/api/tours/complete`, `/bedankt`, `/review/[token]` en `/icon.svg` opgenomen in de deployment.
- Openbare checkout en bedankpagina geven HTTP 200.
- Databasegestuurde eindtest wordt na merge uitgevoerd op de productieomgeving, omdat previewdeployments geen productiegeheimen gebruiken.
