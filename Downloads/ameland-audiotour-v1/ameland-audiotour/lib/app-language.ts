import { TourStop } from '@/types/tour'

export const APP_LANGUAGE_COOKIE = 'wadnverhaal-language'

export type AppLanguage = 'nl' | 'en' | 'de'

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'nl' || value === 'en' || value === 'de'
}

export function getStopTitle(stop: TourStop | null, language: AppLanguage) {
  if (!stop) return null
  if (language === 'en' && stop.title_en) return stop.title_en
  if (language === 'de' && stop.title_de) return stop.title_de
  return stop.title
}

export function getStopShortDescription(stop: TourStop | null, language: AppLanguage) {
  if (!stop) return null
  if (language === 'en' && stop.short_description_en) return stop.short_description_en
  if (language === 'de' && stop.short_description_de) return stop.short_description_de
  return stop.short_description
}

export const translations = {
  nl: {
    appName: "Wad'n Verhaal",
    chooseLanguage: 'Kies taal',
    chooseLanguageText: 'Selecteer je taal. Deze keuze wordt in de hele app gebruikt.',
    back: 'Terug',
    backToHome: 'Terug naar home',
    backToTours: 'Terug naar alle tours',
    availableRoutes: 'Beschikbare routes',

    discoverTitle: 'Ontdek Ameland met verhalen op de kaart',
    discoverText:
      'Start een rustige audiotour op je telefoon, volg live waar je bent en loop eenvoudig naar het volgende verhaalpunt.',
    startTour: 'Start tour',
    liveMap: 'Live kaart',
    liveMapText: 'Zie direct waar je staat en waar je naartoe loopt.',
    audioOnTheGo: 'Audio onderweg',
    audioOnTheGoText: 'Verhalen en beleving precies op de juiste plek.',
    startDirectly: 'Direct starten',
    startDirectlyText: 'Geen gedoe, gewoon openen en beginnen.',
    walkOrBike: 'Wandelen of fietsen',
    walkOrBikeText: 'Kies de route die past bij jouw dag op Ameland.',

    howItWorks: 'Zo werkt het',
    step1: 'Kies jouw tour',
    step2: 'Open de tour op je telefoon',
    step3: 'Volg live de route en luister onderweg',

    privacy: 'Privacy',
    terms: 'Voorwaarden',
    privacyTitle: 'Privacy',
    privacyText1:
      'Deze app verwerkt alleen gegevens die nodig zijn om de audiotour te leveren, zoals je e-mailadres, betaalstatus en beperkte gebruiksgegevens voor verbetering van de dienst.',
    privacyText2:
      'Locatie wordt alleen gebruikt tijdens de tour om het juiste audiofragment op het juiste moment te starten.',
    termsTitle: 'Voorwaarden',
    termsText1:
      'Na betaling ontvang je een persoonlijke startlink voor jouw tour. Deze link is bedoeld voor eigen gebruik.',
    termsText2:
      'De audiotour werkt het best met een stabiele internetverbinding en locatie aan op je telefoon.',
    termsText3:
      'Gebruik tijdens het lopen of fietsen bij voorkeur één oortje of open-ear audio en blijf altijd letten op verkeer en omgeving.',

    chooseTour: 'Kies je tour',
    chooseTourText: 'Kies de route die past bij jouw dag op Ameland en start eenvoudig op je telefoon.',
    noTours: 'Er zijn op dit moment nog geen tours beschikbaar.',

    walkingTour: 'Wandeltour',
    bikeTour: 'Fietstour',
    stopsLabel: 'stops',
    whatToExpect: 'Wat je kunt verwachten',
    routePreview: 'Voorproefje van de route',
    previewRoute: 'Voorproefje van de route',
    discoverAtYourOwnPace: 'Ontdek Ameland op je eigen tempo',
    listenAtSpecialPlaces: 'Luister onderweg naar verhalen op bijzondere plekken',
    directStartAfterPurchase: 'Direct te starten op je telefoon na aankoop',
    openOnPhone: 'Je opent de tour eenvoudig op je telefoon',

    checkoutLabel: 'Checkout',
    almostDone: 'Bijna klaar',
    checkoutText: 'Rond je bestelling af en ontvang direct je startlink per e-mail.',
    emailAddress: 'E-mailadres',
    emailPlaceholder: 'jij@email.nl',
    paymentBenefit1: 'Direct na betaling ontvang je een persoonlijke startlink',
    paymentBenefit2: 'Je opent de tour eenvoudig op je telefoon',
    paymentBenefit3: 'Veilig betalen en daarna meteen op pad',
    payAndReceiveLink: 'Betaal en ontvang startlink',

    successBadge: 'Je bestelling is gelukt',
    successTitle: 'Je tour staat klaar',
    successText: 'Je startlink is verstuurd per e-mail. Je kunt hieronder ook direct je tour openen.',
    successBenefit1: 'Je bestelling is succesvol afgerond',
    successBenefit2: 'Je persoonlijke tour staat klaar om te starten',
    successBenefit3: 'Start wanneer jij er klaar voor bent op Ameland',
    openMyTourNow: 'Open mijn tour nu',
    viewMoreTours: 'Bekijk meer tours',

    accessBadge: 'Toegang actief',
    accessTitle: 'Je tour staat klaar',
    accessText:
      'Je tour staat klaar. We gebruiken je locatie alleen om het volgende verhaal op het juiste moment te starten.',
    accessBenefit1: 'Je kunt direct starten op je telefoon',
    accessBenefit2: 'Audio speelt automatisch af op de juiste plekken',
    accessBenefit3: 'Je kunt ook handmatig naar de volgende stop gaan',

    notFoundTitle: 'Pagina niet gevonden',
    notFoundText: 'Deze pagina bestaat niet of is niet meer beschikbaar.',

    chooseLanguageShort: 'Taal',
    tourActive: 'Tour actief',
    status: 'Status',
    arrived: 'Aangekomen',
    onTheWay: 'Onderweg',
    stop: 'Stop',
    of: 'van',
    youAreHere: 'Jij bent hier',
    nextStop: 'Volgende stop',
    you: 'Jij',
    locationActive: 'Locatie actief',
    locationOff: 'Locatie uit',
    direction: 'Richting',
    shortestWalkingRoute: 'Kortste wandelroute',
    distance: 'Afstand',
    time: 'Tijd',
    previous: 'Vorige',
    next: 'Volgende',
    enableLocation: 'Locatie inschakelen',
    openWalkingRoute: 'Open wandelroute',
    pauseAudio: 'Pauzeer audio',
    playAudio: 'Speel audio af',
    allStops: 'Alle stops',
    activeStopFallback: 'Tour',
    permissionUnsupported: 'Je apparaat ondersteunt geen locatie.',
    locationDenied:
      'Locatie is geweigerd. Sta locatie toe in je browser of probeer het opnieuw met de knop hieronder.',
    locationUnavailable:
      'Locatie kon niet worden opgehaald. Je kunt de tour nog wel handmatig volgen.',
    locationPromptNotOpened: 'De browser heeft de locatiemelding niet geopend. Probeer het nog eens.',
    locationStillBlocked:
      'Locatie blijft geblokkeerd door de browser. Klik op het slotje links van de adresbalk en zet locatie op toestaan.',
    locationRetryFailed:
      'Locatie kon niet opnieuw worden ingeschakeld. Controleer je browserinstellingen en sta locatie toe.',
    locationRestartFailed: 'Locatie kon niet opnieuw worden gestart.',
    audioAutoStartFailed:
      'Audio kon niet automatisch starten. Druk op afspelen om handmatig te starten.',
  },

  en: {
    appName: "Wad'n Verhaal",
    chooseLanguage: 'Choose language',
    chooseLanguageText: 'Select your language. This choice is used throughout the app.',
    back: 'Back',
    backToHome: 'Back to home',
    backToTours: 'Back to all tours',
    availableRoutes: 'Available routes',

    discoverTitle: 'Discover Ameland with stories on the map',
    discoverText:
      'Start a calm audio tour on your phone, follow your live position and walk easily to the next story point.',
    startTour: 'Start tour',
    liveMap: 'Live map',
    liveMapText: 'See exactly where you are and where you are heading.',
    audioOnTheGo: 'Audio on the go',
    audioOnTheGoText: 'Stories and atmosphere at exactly the right place.',
    startDirectly: 'Start instantly',
    startDirectlyText: 'No hassle, just open and begin.',
    walkOrBike: 'Walk or bike',
    walkOrBikeText: 'Choose the route that fits your day on Ameland.',

    howItWorks: 'How it works',
    step1: 'Choose your tour',
    step2: 'Open the tour on your phone',
    step3: 'Follow the route live and listen along the way',

    privacy: 'Privacy',
    terms: 'Terms',
    privacyTitle: 'Privacy',
    privacyText1:
      'This app only processes data needed to deliver the audio tour, such as your email address, payment status and limited usage data to improve the service.',
    privacyText2:
      'Location is only used during the tour to start the right audio fragment at the right moment.',
    termsTitle: 'Terms',
    termsText1:
      'After payment you receive a personal start link for your tour. This link is intended for your own use.',
    termsText2:
      'The audio tour works best with a stable internet connection and location enabled on your phone.',
    termsText3:
      'While walking or cycling, preferably use one earbud or open-ear audio and always keep attention on traffic and your surroundings.',

    chooseTour: 'Choose your tour',
    chooseTourText: 'Choose the route that fits your day on Ameland and start easily on your phone.',
    noTours: 'There are currently no tours available.',

    walkingTour: 'Walking tour',
    bikeTour: 'Bike tour',
    stopsLabel: 'stops',
    whatToExpect: 'What to expect',
    routePreview: 'Route preview',
    previewRoute: 'Route preview',
    discoverAtYourOwnPace: 'Discover Ameland at your own pace',
    listenAtSpecialPlaces: 'Listen to stories at special places along the way',
    directStartAfterPurchase: 'Ready to start on your phone right after purchase',
    openOnPhone: 'You can easily open the tour on your phone',

    checkoutLabel: 'Checkout',
    almostDone: 'Almost done',
    checkoutText: 'Complete your order and receive your start link directly by email.',
    emailAddress: 'Email address',
    emailPlaceholder: 'you@email.com',
    paymentBenefit1: 'Right after payment you receive a personal start link',
    paymentBenefit2: 'You can easily open the tour on your phone',
    paymentBenefit3: 'Secure payment and then start right away',
    payAndReceiveLink: 'Pay and receive start link',

    successBadge: 'Your order was successful',
    successTitle: 'Your tour is ready',
    successText: 'Your start link has been sent by email. You can also open your tour directly below.',
    successBenefit1: 'Your order has been completed successfully',
    successBenefit2: 'Your personal tour is ready to start',
    successBenefit3: 'Start whenever you are ready on Ameland',
    openMyTourNow: 'Open my tour now',
    viewMoreTours: 'View more tours',

    accessBadge: 'Access active',
    accessTitle: 'Your tour is ready',
    accessText:
      'Your tour is ready. We only use your location to start the next story at the right moment.',
    accessBenefit1: 'You can start directly on your phone',
    accessBenefit2: 'Audio plays automatically at the right locations',
    accessBenefit3: 'You can also manually go to the next stop',

    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist or is no longer available.',

    chooseLanguageShort: 'Language',
    tourActive: 'Tour active',
    status: 'Status',
    arrived: 'Arrived',
    onTheWay: 'On the way',
    stop: 'Stop',
    of: 'of',
    youAreHere: 'You are here',
    nextStop: 'Next stop',
    you: 'You',
    locationActive: 'Location active',
    locationOff: 'Location off',
    direction: 'Direction',
    shortestWalkingRoute: 'Shortest walking route',
    distance: 'Distance',
    time: 'Time',
    previous: 'Previous',
    next: 'Next',
    enableLocation: 'Enable location',
    openWalkingRoute: 'Open walking route',
    pauseAudio: 'Pause audio',
    playAudio: 'Play audio',
    allStops: 'All stops',
    activeStopFallback: 'Tour',
    permissionUnsupported: 'Your device does not support location access.',
    locationDenied:
      'Location access was denied. Allow location in your browser or try again with the button below.',
    locationUnavailable:
      'Location could not be retrieved. You can still follow the tour manually.',
    locationPromptNotOpened: 'The browser did not open the location prompt. Please try again.',
    locationStillBlocked:
      'Location is still blocked by the browser. Click the lock icon in the address bar and allow location access.',
    locationRetryFailed:
      'Location could not be enabled again. Check your browser settings and allow location access.',
    locationRestartFailed: 'Location could not be restarted.',
    audioAutoStartFailed:
      'Audio could not start automatically. Press play to start it manually.',
  },

  de: {
    appName: "Wad'n Verhaal",
    chooseLanguage: 'Sprache wählen',
    chooseLanguageText: 'Wähle deine Sprache. Diese Auswahl wird in der ganzen App verwendet.',
    back: 'Zurück',
    backToHome: 'Zurück zur Startseite',
    backToTours: 'Zurück zu allen Touren',
    availableRoutes: 'Verfügbare Routen',

    discoverTitle: 'Entdecke Ameland mit Geschichten auf der Karte',
    discoverText:
      'Starte eine ruhige Audiotour auf deinem Handy, verfolge live deinen Standort und gehe einfach zum nächsten Erzählpunkt.',
    startTour: 'Tour starten',
    liveMap: 'Live-Karte',
    liveMapText: 'Sieh sofort, wo du bist und wohin du gehst.',
    audioOnTheGo: 'Audio unterwegs',
    audioOnTheGoText: 'Geschichten und Atmosphäre genau am richtigen Ort.',
    startDirectly: 'Direkt starten',
    startDirectlyText: 'Kein Aufwand, einfach öffnen und loslegen.',
    walkOrBike: 'Zu Fuß oder mit dem Rad',
    walkOrBikeText: 'Wähle die Route, die zu deinem Tag auf Ameland passt.',

    howItWorks: 'So funktioniert es',
    step1: 'Wähle deine Tour',
    step2: 'Öffne die Tour auf deinem Handy',
    step3: 'Folge live der Route und höre unterwegs zu',

    privacy: 'Datenschutz',
    terms: 'Bedingungen',
    privacyTitle: 'Datenschutz',
    privacyText1:
      'Diese App verarbeitet nur Daten, die für die Bereitstellung der Audiotour nötig sind, wie deine E-Mail-Adresse, Zahlungsstatus und begrenzte Nutzungsdaten zur Verbesserung des Dienstes.',
    privacyText2:
      'Der Standort wird nur während der Tour verwendet, um das richtige Audiofragment im richtigen Moment zu starten.',
    termsTitle: 'Bedingungen',
    termsText1:
      'Nach der Zahlung erhältst du einen persönlichen Startlink für deine Tour. Dieser Link ist nur für den eigenen Gebrauch bestimmt.',
    termsText2:
      'Die Audiotour funktioniert am besten mit einer stabilen Internetverbindung und aktiviertem Standort auf deinem Handy.',
    termsText3:
      'Nutze beim Gehen oder Radfahren am besten nur einen Ohrhörer oder Open-Ear-Audio und achte immer auf Verkehr und Umgebung.',

    chooseTour: 'Wähle deine Tour',
    chooseTourText: 'Wähle die Route, die zu deinem Tag auf Ameland passt, und starte ganz einfach auf deinem Handy.',
    noTours: 'Zurzeit sind noch keine Touren verfügbar.',

    walkingTour: 'Wandertour',
    bikeTour: 'Fahrradtour',
    stopsLabel: 'Stopps',
    whatToExpect: 'Was dich erwartet',
    routePreview: 'Vorschau der Route',
    previewRoute: 'Vorschau der Route',
    discoverAtYourOwnPace: 'Entdecke Ameland in deinem eigenen Tempo',
    listenAtSpecialPlaces: 'Höre unterwegs Geschichten an besonderen Orten',
    directStartAfterPurchase: 'Direkt nach dem Kauf auf deinem Handy startklar',
    openOnPhone: 'Du kannst die Tour ganz einfach auf deinem Handy öffnen',

    checkoutLabel: 'Checkout',
    almostDone: 'Fast fertig',
    checkoutText: 'Schließe deine Bestellung ab und erhalte deinen Startlink direkt per E-Mail.',
    emailAddress: 'E-Mail-Adresse',
    emailPlaceholder: 'du@email.de',
    paymentBenefit1: 'Direkt nach der Zahlung erhältst du einen persönlichen Startlink',
    paymentBenefit2: 'Du öffnest die Tour ganz einfach auf deinem Handy',
    paymentBenefit3: 'Sicher bezahlen und danach sofort losgehen',
    payAndReceiveLink: 'Bezahlen und Startlink erhalten',

    successBadge: 'Deine Bestellung war erfolgreich',
    successTitle: 'Deine Tour ist bereit',
    successText:
      'Dein Startlink wurde per E-Mail versendet. Du kannst deine Tour unten auch direkt öffnen.',
    successBenefit1: 'Deine Bestellung wurde erfolgreich abgeschlossen',
    successBenefit2: 'Deine persönliche Tour ist startbereit',
    successBenefit3: 'Starte, wenn du auf Ameland bereit bist',
    openMyTourNow: 'Meine Tour jetzt öffnen',
    viewMoreTours: 'Weitere Touren ansehen',

    accessBadge: 'Zugang aktiv',
    accessTitle: 'Deine Tour ist bereit',
    accessText:
      'Deine Tour ist bereit. Wir verwenden deinen Standort nur, um die nächste Geschichte im richtigen Moment zu starten.',
    accessBenefit1: 'Du kannst direkt auf deinem Handy starten',
    accessBenefit2: 'Audio wird an den richtigen Orten automatisch abgespielt',
    accessBenefit3: 'Du kannst auch manuell zum nächsten Stopp gehen',

    notFoundTitle: 'Seite nicht gefunden',
    notFoundText: 'Diese Seite existiert nicht oder ist nicht mehr verfügbar.',

    chooseLanguageShort: 'Sprache',
    tourActive: 'Tour aktiv',
    status: 'Status',
    arrived: 'Angekommen',
    onTheWay: 'Unterwegs',
    stop: 'Stopp',
    of: 'von',
    youAreHere: 'Du bist hier',
    nextStop: 'Nächster Stopp',
    you: 'Du',
    locationActive: 'Standort aktiv',
    locationOff: 'Standort aus',
    direction: 'Richtung',
    shortestWalkingRoute: 'Kürzeste Fußroute',
    distance: 'Entfernung',
    time: 'Zeit',
    previous: 'Zurück',
    next: 'Weiter',
    enableLocation: 'Standort aktivieren',
    openWalkingRoute: 'Fußroute öffnen',
    pauseAudio: 'Audio pausieren',
    playAudio: 'Audio abspielen',
    allStops: 'Alle Stopps',
    activeStopFallback: 'Tour',
    permissionUnsupported: 'Dein Gerät unterstützt keine Standortfreigabe.',
    locationDenied:
      'Standort wurde verweigert. Erlaube den Standort im Browser oder versuche es erneut mit der Schaltfläche unten.',
    locationUnavailable:
      'Standort konnte nicht abgerufen werden. Du kannst der Tour trotzdem manuell folgen.',
    locationPromptNotOpened: 'Der Browser hat die Standortabfrage nicht geöffnet. Bitte versuche es erneut.',
    locationStillBlocked:
      'Der Standort ist weiterhin im Browser blockiert. Klicke auf das Schloss links in der Adressleiste und erlaube den Standort.',
    locationRetryFailed:
      'Standort konnte nicht erneut aktiviert werden. Prüfe deine Browsereinstellungen und erlaube den Standort.',
    locationRestartFailed: 'Standort konnte nicht erneut gestartet werden.',
    audioAutoStartFailed:
      'Audio konnte nicht automatisch gestartet werden. Drücke auf Play, um es manuell zu starten.',
  },
} as const