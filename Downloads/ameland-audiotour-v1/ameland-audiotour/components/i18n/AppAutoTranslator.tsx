'use client'

import { useEffect } from 'react'

type Lang = 'nl' | 'de' | 'en'

const translations: Record<Exclude<Lang, 'nl'>, Record<string, string>> = {
  de: {
    'Audiotours op Ameland': 'Audiotouren auf Ameland',
    'Ameland Audiotours': 'Ameland Audiotours',
    'Beleef Ameland met gevoel.': 'Erlebe Ameland mit Gefühl.',
    'Route, verhaal en sfeer komen samen in een rustige audiotour op je telefoon.':
      'Route, Geschichte und Atmosphäre kommen in einer ruhigen Audiotour auf deinem Handy zusammen.',
    'Bekijk tours': 'Touren ansehen',
    'Hoe het werkt': 'So funktioniert es',
    'Kies': 'Wählen',
    'Kies jouw tour': 'Wähle deine Tour',
    'Kies de route die past bij jouw dag op Ameland.':
      'Wähle die Route, die zu deinem Tag auf Ameland passt.',
    'Open': 'Öffnen',
    'Bestel direct online': 'Direkt online buchen',
    'Open de tour eenvoudig op je telefoon en start wanneer je wilt.':
      'Öffne die Tour einfach auf deinem Handy und starte, wann du möchtest.',
    'Beleef': 'Erleben',
    'Ga op pad': 'Mach dich auf den Weg',
    'Ontdek dorp, duin en landschap met verhalen onderweg.':
      'Entdecke Dorf, Dünen und Landschaft mit Geschichten unterwegs.',
    'Van kiezen naar beleven': 'Vom Wählen zum Erleben',
    'Alles is opgezet om je soepel van stap naar stap te brengen. Daardoor voelt starten eenvoudig, logisch en uitnodigend.':
      'Alles ist so aufgebaut, dass du ruhig und einfach starten kannst. Schritt für Schritt.',
    'Luister veilig met één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.':
      'Höre sicher mit einem Ohrhörer oder Open-Ear-Audio und achte weiter auf Verkehr und Umgebung.',
    'Start jouw audiotour': 'Audiotour starten',

    'Tours': 'Touren',
    '← Terug naar begin': '← Zurück zum Start',
    'Kies de tour die bij jouw dag past': 'Wähle die Tour, die zu deinem Tag passt',
    'Beschikbare tours kun je direct starten. De andere routes komen binnenkort online.':
      'Verfügbare Touren kannst du direkt starten. Weitere Routen kommen bald online.',
    'Nu beschikbaar': 'Jetzt verfügbar',
    'Beschikbaar': 'Verfügbar',
    'Binnenkort': 'Bald verfügbar',
    'Nog geen actieve tour gevonden': 'Noch keine aktive Tour gefunden',
    'Zet in Supabase minimaal één tour actief met een slug. Dan verschijnt hij hier automatisch.':
      'Aktiviere in Supabase mindestens eine Tour mit einem Slug. Dann erscheint sie hier automatisch.',
    'Een rustige audiotour langs bijzondere plekken op Ameland.':
      'Eine ruhige Audiotour entlang besonderer Orte auf Ameland.',
    'Maak kennis met Hollum': 'Lerne Hollum kennen',
    'Historische Dorpswandeling': 'Historischer Dorfrundgang',
    'Fietsroute door Duin & Dorp': 'Fahrradroute durch Dünen und Dorf',
    'Meest gekozen': 'Am beliebtesten',
    'Rustig ontdekken': 'Ruhig entdecken',
    'Fietsroute': 'Fahrradroute',
    'Verhalen over dorp, geschiedenis en het oude Ameland.':
      'Geschichten über Dorf, Geschichte und das alte Ameland.',
    'Een complete eilandbeleving tussen landschap, dorp en zee.':
      'Ein komplettes Inselerlebnis zwischen Landschaft, Dorf und Meer.',

    'Voor vertrek': 'Vor dem Start',
    'Klaar om te luisteren?': 'Bereit zum Zuhören?',
    'Gebruik bij voorkeur één oortje of open-ear audio. Zo hoor je het verhaal én blijf je alert op je omgeving.':
      'Nutze am besten einen Ohrhörer oder Open-Ear-Audio. So hörst du die Geschichte und bleibst aufmerksam.',
    'Tip onderweg': 'Tipp unterwegs',
    'Geen oortjes bij je?': 'Keine Ohrhörer dabei?',
    'Voeg Warenhuis Engels toe als korte voorbereidingsstop.':
      'Füge Warenhuis Engels als kurzen Vorbereitungsstopp hinzu.',
    'Start mijn tour →': 'Tour starten →',
    'Voeg voorbereidingsstop toe': 'Vorbereitungsstopp hinzufügen',
    'Pauzeren of terugspoelen kan altijd. Luister opnieuw op een rustig en veilig moment.':
      'Pausieren oder Zurückspulen ist jederzeit möglich. Höre später an einem sicheren Ort erneut.',

    'Betaling gelukt': 'Zahlung erfolgreich',
    'Je audiotour staat klaar.': 'Deine Audiotour ist bereit.',
    'Open je persoonlijke toegang en ga op pad wanneer het jou uitkomt.':
      'Öffne deinen persönlichen Zugang und starte, wann es dir passt.',
    'Jouw toegang': 'Dein Zugang',
    'Je persoonlijke link is aangemaakt. Bewaar deze pagina of open de link vanuit je e-mail.':
      'Dein persönlicher Link wurde erstellt. Speichere diese Seite oder öffne den Link aus deiner E-Mail.',
    'Open mijn audiotour': 'Meine Audiotour öffnen',
    'Terug naar tours': 'Zurück zu den Touren',

    'Privacy': 'Datenschutz',
    'Zorgvuldig met je gegevens.': 'Sorgfältig mit deinen Daten.',
    'We gebruiken gegevens alleen om je bestelling en toegang tot de audiotour goed te laten werken.':
      'Wir verwenden Daten nur, damit Bestellung und Zugang zur Audiotour gut funktionieren.',
    'Wat we bewaren': 'Was wir speichern',
    'We bewaren de gegevens die nodig zijn voor betaling, toegang tot de tour en service rondom je aankoop.':
      'Wir speichern die Daten, die für Zahlung, Tourzugang und Service rund um deinen Kauf nötig sind.',
    'Waarom': 'Warum',
    'Zodat je persoonlijke tourlink werkt en we je kunnen helpen als er iets misgaat.':
      'Damit dein persönlicher Tourlink funktioniert und wir dir helfen können, wenn etwas nicht klappt.',
    'Contact': 'Kontakt',
    'Voor vragen kun je mailen naar info@amelandaudiotours.nl.':
      'Bei Fragen kannst du an info@amelandaudiotours.nl mailen.',

    'Voorwaarden': 'Bedingungen',
    'Helder voor vertrek.': 'Klar vor dem Start.',
    'Hier vind je de belangrijkste afspraken rondom aankoop, toegang en gebruik van de audiotours.':
      'Hier findest du die wichtigsten Vereinbarungen zu Kauf, Zugang und Nutzung der Audiotouren.',
    'Toegang': 'Zugang',
    'Na aankoop ontvang je toegang tot de gekozen audiotour. De persoonlijke link is bedoeld voor eigen gebruik.':
      'Nach dem Kauf erhältst du Zugang zur gewählten Audiotour. Der persönliche Link ist für den eigenen Gebrauch bestimmt.',
    'Gebruik onderweg': 'Nutzung unterwegs',
    'Gebruik één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.':
      'Nutze einen Ohrhörer oder Open-Ear-Audio und achte weiter auf Verkehr und Umgebung.',
    'Vragen of problemen? Mail naar info@amelandaudiotours.nl.':
      'Fragen oder Probleme? Mail an info@amelandaudiotours.nl.',
    'Terug naar begin': 'Zurück zum Start',

    'Afrekenen': 'Bezahlen',
    'Bestelling': 'Bestellung',
    'Naam': 'Name',
    'E-mailadres': 'E-Mail-Adresse',
    'E-mail': 'E-Mail',
    'Betalen': 'Bezahlen',
    'Verder naar betalen': 'Weiter zur Zahlung',
    'Start betaling': 'Zahlung starten',
    'Koop tour': 'Tour kaufen',
    'Koop audiotour': 'Audiotour kaufen',
  },

  en: {
    'Audiotours op Ameland': 'Audio tours on Ameland',
    'Ameland Audiotours': 'Ameland Audiotours',
    'Beleef Ameland met gevoel.': 'Experience Ameland with feeling.',
    'Route, verhaal en sfeer komen samen in een rustige audiotour op je telefoon.':
      'Route, story and atmosphere come together in a calm audio tour on your phone.',
    'Bekijk tours': 'View tours',
    'Hoe het werkt': 'How it works',
    'Kies': 'Choose',
    'Kies jouw tour': 'Choose your tour',
    'Kies de route die past bij jouw dag op Ameland.':
      'Choose the route that fits your day on Ameland.',
    'Open': 'Open',
    'Bestel direct online': 'Book online',
    'Open de tour eenvoudig op je telefoon en start wanneer je wilt.':
      'Open the tour on your phone and start whenever you like.',
    'Beleef': 'Experience',
    'Ga op pad': 'Head out',
    'Ontdek dorp, duin en landschap met verhalen onderweg.':
      'Discover village, dunes and landscape with stories along the way.',
    'Van kiezen naar beleven': 'From choosing to experiencing',
    'Alles is opgezet om je soepel van stap naar stap te brengen. Daardoor voelt starten eenvoudig, logisch en uitnodigend.':
      'Everything is designed to guide you smoothly from step to step, so starting feels simple and inviting.',
    'Luister veilig met één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.':
      'Listen safely with one earbud or open-ear audio and stay aware of traffic and your surroundings.',
    'Start jouw audiotour': 'Start your audio tour',

    'Tours': 'Tours',
    '← Terug naar begin': '← Back to start',
    'Kies de tour die bij jouw dag past': 'Choose the tour that fits your day',
    'Beschikbare tours kun je direct starten. De andere routes komen binnenkort online.':
      'Available tours can be started right away. More routes are coming soon.',
    'Nu beschikbaar': 'Available now',
    'Beschikbaar': 'Available',
    'Binnenkort': 'Coming soon',
    'Nog geen actieve tour gevonden': 'No active tour found yet',
    'Zet in Supabase minimaal één tour actief met een slug. Dan verschijnt hij hier automatisch.':
      'Activate at least one tour with a slug in Supabase. It will appear here automatically.',
    'Een rustige audiotour langs bijzondere plekken op Ameland.':
      'A calm audio tour along special places on Ameland.',
    'Maak kennis met Hollum': 'Meet Hollum',
    'Historische Dorpswandeling': 'Historic village walk',
    'Fietsroute door Duin & Dorp': 'Bike route through dunes and village',
    'Meest gekozen': 'Most popular',
    'Rustig ontdekken': 'Calm discovery',
    'Fietsroute': 'Bike route',
    'Verhalen over dorp, geschiedenis en het oude Ameland.':
      'Stories about the village, history and old Ameland.',
    'Een complete eilandbeleving tussen landschap, dorp en zee.':
      'A complete island experience between landscape, village and sea.',

    'Voor vertrek': 'Before you start',
    'Klaar om te luisteren?': 'Ready to listen?',
    'Gebruik bij voorkeur één oortje of open-ear audio. Zo hoor je het verhaal én blijf je alert op je omgeving.':
      'Use one earbud or open-ear audio if possible. That way you hear the story and stay aware of your surroundings.',
    'Tip onderweg': 'On-the-go tip',
    'Geen oortjes bij je?': 'No earbuds with you?',
    'Voeg Warenhuis Engels toe als korte voorbereidingsstop.':
      'Add Warenhuis Engels as a short preparation stop.',
    'Start mijn tour →': 'Start my tour →',
    'Voeg voorbereidingsstop toe': 'Add preparation stop',
    'Pauzeren of terugspoelen kan altijd. Luister opnieuw op een rustig en veilig moment.':
      'You can pause or rewind anytime. Listen again later at a safe moment.',

    'Betaling gelukt': 'Payment successful',
    'Je audiotour staat klaar.': 'Your audio tour is ready.',
    'Open je persoonlijke toegang en ga op pad wanneer het jou uitkomt.':
      'Open your personal access link and start whenever it suits you.',
    'Jouw toegang': 'Your access',
    'Je persoonlijke link is aangemaakt. Bewaar deze pagina of open de link vanuit je e-mail.':
      'Your personal link has been created. Save this page or open the link from your email.',
    'Open mijn audiotour': 'Open my audio tour',
    'Terug naar tours': 'Back to tours',

    'Privacy': 'Privacy',
    'Zorgvuldig met je gegevens.': 'Careful with your data.',
    'We gebruiken gegevens alleen om je bestelling en toegang tot de audiotour goed te laten werken.':
      'We only use data to make your order and access to the audio tour work properly.',
    'Wat we bewaren': 'What we store',
    'We bewaren de gegevens die nodig zijn voor betaling, toegang tot de tour en service rondom je aankoop.':
      'We store the data needed for payment, tour access and service around your purchase.',
    'Waarom': 'Why',
    'Zodat je persoonlijke tourlink werkt en we je kunnen helpen als er iets misgaat.':
      'So your personal tour link works and we can help if something goes wrong.',
    'Contact': 'Contact',
    'Voor vragen kun je mailen naar info@amelandaudiotours.nl.':
      'For questions, email info@amelandaudiotours.nl.',

    'Voorwaarden': 'Terms',
    'Helder voor vertrek.': 'Clear before you start.',
    'Hier vind je de belangrijkste afspraken rondom aankoop, toegang en gebruik van de audiotours.':
      'Here you’ll find the main terms around purchase, access and use of the audio tours.',
    'Toegang': 'Access',
    'Na aankoop ontvang je toegang tot de gekozen audiotour. De persoonlijke link is bedoeld voor eigen gebruik.':
      'After purchase, you receive access to the selected audio tour. The personal link is for your own use.',
    'Gebruik onderweg': 'Use on the go',
    'Gebruik één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.':
      'Use one earbud or open-ear audio and stay aware of traffic and your surroundings.',
    'Vragen of problemen? Mail naar info@amelandaudiotours.nl.':
      'Questions or problems? Email info@amelandaudiotours.nl.',
    'Terug naar begin': 'Back to start',

    'Afrekenen': 'Checkout',
    'Bestelling': 'Order',
    'Naam': 'Name',
    'E-mailadres': 'Email address',
    'E-mail': 'Email',
    'Betalen': 'Pay',
    'Verder naar betalen': 'Continue to payment',
    'Start betaling': 'Start payment',
    'Koop tour': 'Buy tour',
    'Koop audiotour': 'Buy audio tour',
  },
}

function getLang(): Lang {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('lang')
  const stored = window.localStorage.getItem('ameland-audiotours-language')

  if (fromUrl === 'de' || fromUrl === 'en' || fromUrl === 'nl') return fromUrl
  if (stored === 'de' || stored === 'en' || stored === 'nl') return stored
  return 'nl'
}

function translateString(value: string, lang: Lang) {
  if (lang === 'nl') return value

  const dictionary = translations[lang]
  const trimmed = value.trim()
  const translated = dictionary[trimmed]

  if (!translated) return value

  return value.replace(trimmed, translated)
}

function translateNode(root: ParentNode, lang: Lang) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const parent = node.parentElement

    if (!parent) continue
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(parent.tagName)) continue

    const original = parent.getAttribute('data-aat-original-text') || node.nodeValue || ''

    if (!parent.getAttribute('data-aat-original-text') && original.trim()) {
      parent.setAttribute('data-aat-original-text', original)
    }

    nodes.push(node)
  }

  for (const node of nodes) {
    const parent = node.parentElement
    if (!parent) continue

    const original = parent.getAttribute('data-aat-original-text') || node.nodeValue || ''
    node.nodeValue = lang === 'nl' ? original : translateString(original, lang)
  }

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((element) => {
    const input = element as HTMLInputElement | HTMLTextAreaElement
    const original = input.getAttribute('data-aat-original-placeholder') || input.placeholder

    if (!input.getAttribute('data-aat-original-placeholder')) {
      input.setAttribute('data-aat-original-placeholder', original)
    }

    input.placeholder = lang === 'nl' ? original : translateString(original, lang)
  })
}

function updateLinks(lang: Lang) {
  document.querySelectorAll('a[href^="/"]').forEach((element) => {
    const anchor = element as HTMLAnchorElement
    const href = anchor.getAttribute('href')

    if (!href || href.startsWith('/api/') || href.startsWith('/_next/')) return

    const url = new URL(href, window.location.origin)
    url.searchParams.set('lang', lang)
    anchor.setAttribute('href', `${url.pathname}${url.search}${url.hash}`)
  })
}

export default function AppAutoTranslator() {
  useEffect(() => {
    if (window.location.pathname.startsWith('/player/')) return
    let timeout: ReturnType<typeof setTimeout> | null = null

    const run = () => {
      const lang = getLang()
      document.documentElement.lang = lang
      translateNode(document.body, lang)
      updateLinks(lang)
    }

    run()

    const observer = new MutationObserver(() => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(run, 80)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    window.addEventListener('app-language-change', run)

    return () => {
      observer.disconnect()
      window.removeEventListener('app-language-change', run)
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  return null
}

export { AppAutoTranslator }
