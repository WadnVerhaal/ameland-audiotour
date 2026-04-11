import { cookies } from 'next/headers'
import { TourStop } from '@/types/tour'

export type AppLanguage = 'nl' | 'en' | 'de'

export const APP_LANGUAGE_COOKIE = 'wadnverhaal_language'

export async function getServerLanguage(): Promise<AppLanguage> {
  const cookieStore = await cookies()
  const value = cookieStore.get(APP_LANGUAGE_COOKIE)?.value

  if (value === 'en' || value === 'de' || value === 'nl') {
    return value
  }

  return 'nl'
}

export const translations = {
  nl: {
    appName: "Wad'n Verhaal",
    chooseLanguage: 'Taal',
    chooseLanguageText: 'Kies hier je taal. De hele app gebruikt daarna automatisch deze taal.',
    discoverTitle: 'Ontdek Ameland met verhalen op de kaart',
    discoverText:
      'Start een rustige audiotour op je telefoon, volg live waar je bent en loop eenvoudig naar het volgende verhaalpunt.',
    startTour: 'Start een tour',
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
    back: 'Terug',
    availableRoutes: 'Beschikbare routes',
    chooseTour: 'Kies je tour',
    chooseTourText: 'Kies de route die past bij jouw dag op Ameland en start eenvoudig op je telefoon.',
    noTours: 'Er zijn op dit moment nog geen tours beschikbaar.',
    walkingTour: 'Wandeltour',
    bikeTour: 'Fietstour',
    tourActive: 'Tour actief',
    status: 'Status',
    arrived: 'Aangekomen',
    onTheWay: 'Onderweg',
    stopLabel: 'Stop',
    of: 'van',
    activeStopFallback: 'Tour',
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
    permissionUnsupported: 'Je apparaat ondersteunt geen locatie.',
    locationDenied:
      'Locatie is geweigerd. Sta locatie toe in je browser of probeer het opnieuw met de knop hieronder.',
    locationUnavailable:
      'Locatie kon niet worden opgehaald. Je kunt de tour nog wel handmatig volgen.',
    locationPromptNotOpened:
      'De browser heeft de locatiemelding niet geopend. Probeer het nog eens.',
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
    chooseLanguage: 'Language',
    chooseLanguageText: 'Choose your language here. The entire app will then automatically use this language.',
    discoverTitle: 'Discover Ameland with stories on the map',
    discoverText:
      'Start a calm audio tour on your phone, follow your live position and walk easily to the next story point.',
    startTour: 'Start a tour',
    liveMap: 'Live map',
    liveMapText: 'See exactly where you are and where you are going.',
    audioOnTheGo: 'Audio on the go',
    audioOnTheGoText: 'Stories and atmosphere exactly at the right location.',
    startDirectly: 'Start directly',
    startDirectlyText: 'No hassle, just open and begin.',
    walkOrBike: 'Walk or bike',
    walkOrBikeText: 'Choose the route that fits your day on Ameland.',
    howItWorks: 'How it works',
    step1: 'Choose your tour',
    step2: 'Open the tour on your phone',
    step3: 'Follow the route live and listen along the way',
    privacy: 'Privacy',
    terms: 'Terms',
    back: 'Back',
    availableRoutes: 'Available routes',
    chooseTour: 'Choose your tour',
    chooseTourText: 'Choose the route that fits your day on Ameland and start easily on your phone.',
    noTours: 'There are currently no tours available.',
    walkingTour: 'Walking tour',
    bikeTour: 'Bike tour',
    tourActive: 'Tour active',
    status: 'Status',
    arrived: 'Arrived',
    onTheWay: 'On the way',
    stopLabel: 'Stop',
    of: 'of',
    activeStopFallback: 'Tour',
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
    permissionUnsupported: 'Your device does not support location access.',
    locationDenied:
      'Location access was denied. Allow location in your browser or try again with the button below.',
    locationUnavailable:
      'Location could not be retrieved. You can still follow the tour manually.',
    locationPromptNotOpened:
      'The browser did not open the location prompt. Please try again.',
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
    chooseLanguage: 'Sprache',
    chooseLanguageText: 'Wähle hier deine Sprache. Die ganze App verwendet danach automatisch diese Sprache.',
    discoverTitle: 'Entdecke Ameland mit Geschichten auf der Karte',
    discoverText:
      'Starte eine ruhige Audiotour auf deinem Handy, verfolge deinen Standort live und gehe einfach zum nächsten Erzählpunkt.',
    startTour: 'Tour starten',
    liveMap: 'Live-Karte',
    liveMapText: 'Sieh sofort, wo du bist und wohin du gehst.',
    audioOnTheGo: 'Audio unterwegs',
    audioOnTheGoText: 'Geschichten und Atmosphäre genau am richtigen Ort.',
    startDirectly: 'Direkt starten',
    startDirectlyText: 'Kein Aufwand, einfach öffnen und loslegen.',
    walkOrBike: 'Wandern oder Radfahren',
    walkOrBikeText: 'Wähle die Route, die zu deinem Tag auf Ameland passt.',
    howItWorks: 'So funktioniert es',
    step1: 'Wähle deine Tour',
    step2: 'Öffne die Tour auf deinem Handy',
    step3: 'Folge der Route live und höre unterwegs zu',
    privacy: 'Datenschutz',
    terms: 'Bedingungen',
    back: 'Zurück',
    availableRoutes: 'Verfügbare Routen',
    chooseTour: 'Wähle deine Tour',
    chooseTourText: 'Wähle die Route, die zu deinem Tag auf Ameland passt, und starte ganz einfach auf deinem Handy.',
    noTours: 'Zurzeit sind noch keine Touren verfügbar.',
    walkingTour: 'Wandertour',
    bikeTour: 'Fahrradtour',
    tourActive: 'Tour aktiv',
    status: 'Status',
    arrived: 'Angekommen',
    onTheWay: 'Unterwegs',
    stopLabel: 'Stopp',
    of: 'von',
    activeStopFallback: 'Tour',
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
    permissionUnsupported: 'Dein Gerät unterstützt keinen Standortzugriff.',
    locationDenied:
      'Der Standortzugriff wurde verweigert. Erlaube den Standort im Browser oder versuche es erneut mit der Schaltfläche unten.',
    locationUnavailable:
      'Der Standort konnte nicht abgerufen werden. Du kannst der Tour trotzdem manuell folgen.',
    locationPromptNotOpened:
      'Der Browser hat die Standortabfrage nicht geöffnet. Bitte versuche es erneut.',
    locationStillBlocked:
      'Der Standort ist weiterhin im Browser blockiert. Klicke auf das Schloss in der Adressleiste und erlaube den Standortzugriff.',
    locationRetryFailed:
      'Der Standort konnte nicht erneut aktiviert werden. Prüfe deine Browsereinstellungen und erlaube den Standortzugriff.',
    locationRestartFailed: 'Der Standort konnte nicht erneut gestartet werden.',
    audioAutoStartFailed:
      'Audio konnte nicht automatisch gestartet werden. Drücke auf Play, um manuell zu starten.',
  },
} as const

export function getStopTitle(
  stop: TourStop | null,
  language: AppLanguage
) {
  if (!stop) return null

  if (language === 'en' && 'title_en' in stop && stop.title_en) {
    return stop.title_en
  }

  if (language === 'de' && 'title_de' in stop && stop.title_de) {
    return stop.title_de
  }

  return stop.title
}

export function getStopShortDescription(
  stop: TourStop,
  language: AppLanguage
) {
  if (language === 'en' && 'short_description_en' in stop && stop.short_description_en) {
    return stop.short_description_en
  }

  if (language === 'de' && 'short_description_de' in stop && stop.short_description_de) {
    return stop.short_description_de
  }

  return stop.short_description
}