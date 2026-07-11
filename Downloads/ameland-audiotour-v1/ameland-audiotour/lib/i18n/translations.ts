export type AppLanguage = 'nl' | 'de' | 'en'

export const DEFAULT_LANGUAGE: AppLanguage = 'nl'

export const APP_LANGUAGE_COOKIE = 'ameland-audiotours-language'
export const APP_LANGUAGE_STORAGE_KEY = 'ameland-audiotours-language'
export const APP_LANGUAGE_CHOSEN_KEY = 'ameland-audiotours-language-chosen'

export const languages: {
  code: AppLanguage
  label: string
  shortLabel: string
  flag: string
}[] = [
  { code: 'nl', label: 'Nederlands', shortLabel: 'NL', flag: '🇳🇱' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE', flag: '🇩🇪' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
]

export const translations = {
  nl: {
    appName: 'Ameland Audiotours',
    chooseLanguage: 'Kies je taal',
    chooseLanguageSubtitle: 'Beleef de audiotour in de taal die bij je past.',
    language: 'Taal',
    changeLanguage: 'Taal wijzigen',
    continue: 'Doorgaan',
    startTour: 'Start tour',
    continueTour: 'Ga verder',
    availableRoutes: 'Beschikbare routes',
    back: 'Terug',
    loading: 'Laden...',
    routeLoading: 'Route laden',
    liveRoute: 'Live route',
    gpsActive: 'GPS actief',
    gpsInactive: 'GPS niet actief',
    currentStop: 'Je volgt nu',
    stop: 'Stop',
    of: 'van',
    enableLocation: 'Locatie inschakelen',
    locationPermissionTitle: 'Locatie nodig',
    locationPermissionText: 'Om de audiotour automatisch te laten starten bij de juiste plekken, hebben we je locatie nodig.',
    audioUnavailable: 'Audio is nog niet beschikbaar in deze taal.',
    tourUnavailable: 'Deze tour is nog niet beschikbaar in deze taal.',
    listenSafelyTitle: 'Luister veilig onderweg',
    listenSafelyText: 'Gebruik bij voorkeur één oortje of open-ear audio. Blijf goed letten op verkeer en je omgeving. Je kunt audiofragmenten altijd pauzeren en later opnieuw beluisteren op een veilig moment.',
    nextStop: 'Volgende stop',
    previousStop: 'Vorige stop',
    finishTour: 'Tour afronden',
    tourCompleted: 'Tour voltooid',
    thanksForListening: 'Bedankt voor het luisteren.',
  },
  de: {
    appName: 'Ameland Audiotours',
    chooseLanguage: 'Sprache wählen',
    chooseLanguageSubtitle: 'Erlebe die Audiotour in der Sprache, die zu dir passt.',
    language: 'Sprache',
    changeLanguage: 'Sprache ändern',
    continue: 'Weiter',
    startTour: 'Tour starten',
    continueTour: 'Fortfahren',
    availableRoutes: 'Verfügbare Routen',
    back: 'Zurück',
    loading: 'Laden...',
    routeLoading: 'Route wird geladen',
    liveRoute: 'Live-Route',
    gpsActive: 'GPS aktiv',
    gpsInactive: 'GPS nicht aktiv',
    currentStop: 'Du folgst jetzt',
    stop: 'Stopp',
    of: 'von',
    enableLocation: 'Standort aktivieren',
    locationPermissionTitle: 'Standort erforderlich',
    locationPermissionText: 'Damit die Audiotour automatisch an den richtigen Orten startet, benötigen wir deinen Standort.',
    audioUnavailable: 'Audio ist in dieser Sprache noch nicht verfügbar.',
    tourUnavailable: 'Diese Tour ist in dieser Sprache noch nicht verfügbar.',
    listenSafelyTitle: 'Sicher unterwegs hören',
    listenSafelyText: 'Nutze am besten einen Ohrhörer oder Open-Ear-Audio. Achte weiterhin gut auf Verkehr und deine Umgebung. Du kannst Audio jederzeit pausieren und später an einem sicheren Moment erneut anhören.',
    nextStop: 'Nächster Stopp',
    previousStop: 'Vorheriger Stopp',
    finishTour: 'Tour beenden',
    tourCompleted: 'Tour abgeschlossen',
    thanksForListening: 'Danke fürs Zuhören.',
  },
  en: {
    appName: 'Ameland Audiotours',
    chooseLanguage: 'Choose your language',
    chooseLanguageSubtitle: 'Experience the audio tour in the language that suits you best.',
    language: 'Language',
    changeLanguage: 'Change language',
    continue: 'Continue',
    startTour: 'Start tour',
    continueTour: 'Continue tour',
    availableRoutes: 'Available routes',
    back: 'Back',
    loading: 'Loading...',
    routeLoading: 'Loading route',
    liveRoute: 'Live route',
    gpsActive: 'GPS active',
    gpsInactive: 'GPS inactive',
    currentStop: 'You are now following',
    stop: 'Stop',
    of: 'of',
    enableLocation: 'Enable location',
    locationPermissionTitle: 'Location needed',
    locationPermissionText: 'To automatically start the audio tour at the right places, we need access to your location.',
    audioUnavailable: 'Audio is not yet available in this language.',
    tourUnavailable: 'This tour is not yet available in this language.',
    listenSafelyTitle: 'Listen safely on the move',
    listenSafelyText: 'Preferably use one earbud or open-ear audio. Keep paying attention to traffic and your surroundings. You can always pause and replay audio fragments later at a safe moment.',
    nextStop: 'Next stop',
    previousStop: 'Previous stop',
    finishTour: 'Finish tour',
    tourCompleted: 'Tour completed',
    thanksForListening: 'Thanks for listening.',
  },
} as const

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'nl' || value === 'de' || value === 'en'
}

export function getTranslation(language: AppLanguage) {
  return translations[language] ?? translations[DEFAULT_LANGUAGE]
}
