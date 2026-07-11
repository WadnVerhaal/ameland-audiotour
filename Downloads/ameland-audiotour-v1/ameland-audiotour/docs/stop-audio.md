# Audio per stop - Ameland Audiotours

De player ondersteunt nu per stop audio.

## Velden per stop

De app kijkt per stop naar deze velden:

- `audio_url_nl`
- `audio_url_en`
- `audio_url_de`
- `audio_url`
- `audio_text_nl`
- `audio_text_en`
- `audio_text_de`
- `trigger_radius_meters`

## Werking

1. De gebruiker opent de tour.
2. De gebruiker tikt één keer op `Audio activeren`.
3. De app vraagt locatie-toegang.
4. Zodra de gebruiker binnen de trigger-radius van een stop komt, speelt de app de audio van die stop.
5. Als er geen audio-url is, gebruikt de app de tekst van de stop als fallback via browser-spraak.

## Veiligheidstekst

De app toont bewust dat gebruikers één oordopje of open-ear audio moeten gebruiken en aandacht moeten houden voor verkeer en omgeving.
