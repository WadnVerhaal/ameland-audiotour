import { Tour, TourStop } from '@/types/tour'

export type AppLanguage = 'nl' | 'en' | 'de'

export const APP_LANGUAGE_COOKIE = 'wadnverhaal-language'
export const APP_LANGUAGE_STORAGE_KEY = 'wadnverhaal-language'

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'nl' || value === 'en' || value === 'de'
}

export const translations = {
  nl: {
    appName: "Wad'n Verhaal",

    chooseLanguage: 'Kies taal',
    chooseLanguageText:
      'Kies hier je taal. De app gebruikt deze keuze daarna overal automatisch.',

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
    privacyTitle: 'Privacy',
    privacyText1:
      'Deze app verwerkt alleen gegevens die nodig zijn om de audiotour te leveren, zoals je e-mailadres, betaalstatus en beperkte gebruiksgegevens voor verbetering van de dienst.',
    privacyText2:
      'Locatie wordt alleen gebruikt tijdens de tour om het juiste audiofragment op het juiste moment te starten.',

    terms: 'Voorwaarden',
    termsTitle: 'Voorwaarden',
    termsText1:
      'Na aankoop krijg je toegang tot jouw audiotour. De toegang is persoonlijk en bedoeld voor normaal gebruik tijdens je bezoek.',
    termsText2:
      'Wad’n Verhaal is niet aansprakelijk voor schade die ontstaat door onjuist gebruik van de app of het negeren van verkeers- en veiligheidsregels.',

    back: 'Terug',
    backToHome: 'Terug naar home',
    backToTours: 'Terug naar alle tours',

    notFoundTitle: 'Pagina niet gevonden',
    notFoundText: 'De pagina die je zoekt bestaat niet of is verplaatst.',

    availableRoutes: 'Beschikbare routes',
    chooseTour: 'Kies je tour',
    chooseTourText:
      'Kies de route die past bij jouw dag op Ameland en start eenvoudig op je telefoon.',
    noToursAvailable: 'Er zijn op dit moment nog geen tours beschikbaar.',
    noTours: 'Er zijn op dit moment nog geen tours beschikbaar.',

    walkingTour: 'Wandeltour',
    walkingTourShort: 'Wandeltour',
    bikeTour: 'Fietstour',
    walkTour: 'Wandeltour',

    checkoutLabel: 'Afrekenen',
    checkoutTitle: 'Bijna klaar',
    almostDone: 'Bijna klaar',
    checkoutText: 'Rond je bestelling af en ontvang direct toegang tot jouw tour.',
    yourEmail: 'Jouw e-mailadres',
    emailAddress: 'Jouw e-mailadres',
    yourEmailPlaceholder: 'naam@voorbeeld.nl',
    emailPlaceholder: 'naam@voorbeeld.nl',
    completeOrder: 'Bestelling afronden',
    securePayment: 'Veilig betalen',
    directAccess: 'Direct toegang',
    directAccessText: 'Na betaling kun je jouw tour meteen openen.',
    paymentBenefit1: 'Direct na betaling ontvang je een persoonlijke startlink.',
    paymentBenefit2: 'Je opent de tour eenvoudig op je telefoon.',
    paymentBenefit3: 'Veilig betalen en daarna meteen op pad.',

    payAndReceiveLink: 'Betaal en ontvang je startlink',

    accessActive: 'Toegang actief',
    accessBadge: 'Toegang actief',
    accessText:
      'Je tour staat klaar. We gebruiken je locatie alleen om het volgende verhaal op het juiste moment te starten.',
    accessBenefit1: 'Je kunt direct starten op je telefoon.',
    accessBenefit2: 'Audio speelt automatisch af op de juiste plekken.',
    accessBenefit3: 'Je kunt ook handmatig naar de volgende stop gaan.',
    startMyTour: 'Start tour',

    routePreview: 'Voorproefje van de route',
    stopsLabel: 'stops',

    whatToExpect: 'Wat je kunt verwachten',
    discoverAtYourOwnPace: 'Ontdek Ameland in je eigen tempo.',
    listenAtSpecialPlaces: 'Luister naar verhalen op bijzondere plekken.',
    directStartAfterPurchase: 'Na aankoop kun je direct starten.',

    successBadge: 'Je bestelling is gelukt',
    successTitle: 'Je tour staat klaar',
    successText:
      'Alles is gelukt. Je kunt direct verder naar jouw persoonlijke tour.',
    successBenefit1: 'Je betaling is bevestigd',
    successBenefit2: 'Je audio staat klaar op je telefoon',
    successBenefit3: 'Je kunt direct starten wanneer jij wilt',
    openMyTourNow: 'Open mijn tour nu',
    viewMoreTours: 'Bekijk meer tours',
    tryAgain: 'Opnieuw proberen',

    tourActive: 'Tour actief',
    status: 'Status',
    arrived: 'Aangekomen',
    underway: 'Onderweg',
    stopLabel: 'Stop',
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
    locationPromptNotOpened:
      'De browser heeft de locatiemelding niet geopend. Probeer het nog eens.',
    locationStillBlocked:
      'Locatie blijft geblokkeerd door de browser. Klik op het slotje links van de adresbalk en zet locatie op toestaan.',
    locationRetryFailed:
      'Locatie kon niet opnieuw worden ingeschakeld. Controleer je browserinstellingen en sta locatie toe.',
    locationRestartFailed: 'Locatie kon niet opnieuw worden gestart.',
    audioAutoStartFailed:
      'Audio kon niet automatisch starten. Druk op afspelen om handmatig te starten.',

    safeListeningTitle: 'Luister veilig onderweg',
    safeListeningText:
      'Gebruik bij voorkeur één oortje of open-ear audio, houd aandacht voor verkeer en omgeving, en pauzeer of spoel later terug als een fragment even niet veilig uitkomt.',
    locationOffTitle: 'Locatie staat uit',
    locationOffText:
      'Je kunt de tour nog steeds volgen, maar automatische audio en live routebegeleiding werken beter als locatie is toegestaan.',

    completionBadge: 'Tour voltooid',
    completionTitle: 'Bedankt dat je met ons op pad ging',
    completionIntro:
      'We hopen dat je {tourTitle} onderweg nét iets anders hebt leren zien. Neem gerust nog even de tijd om om je heen te kijken. Audiofragmenten kun je later altijd opnieuw beluisteren, pauzeren en terugspoelen op een veilig moment.',
    completionStopsLabel: 'Stops',
    completionStopsValue: 'bezocht',
    completionDurationLabel: 'Duur',
    completionFinishedLabel: 'Afgerond',
    completionExperienceTitle: 'Hoe heb je deze tour ervaren?',
    completionFeedbackPromptPositive: 'Wat vond je het mooiste aan deze tour?',
    completionFeedbackPromptImprove: 'Wat kunnen we verbeteren?',
    completionFeedbackPlaceholderPositive:
      'Bijvoorbeeld: de sfeer, de verhalen, de plekken of de route.',
    completionFeedbackPlaceholderImprove:
      'Bijvoorbeeld: de route, de audio, de uitleg of het gebruiksgemak.',
    completionFavoriteLabel: 'Welk onderdeel sprong er voor jou uit?',
    completionFavoritePlaceholder:
      'Bijvoorbeeld: een specifieke stop, het audioverhaal of het landschap.',
    completionRecommendLabel: 'Zou je deze tour aanraden aan anderen?',
    recommendYes: 'Ja, zeker',
    recommendMaybe: 'Misschien',
    recommendNo: 'Nee',
    completionSubmitting: 'Bezig met opslaan...',
    completionSubmit: 'Verstuur beoordeling',
    completionSubmitted: 'Dank je wel. Je beoordeling is opgeslagen.',
    completionBadgeCardTitle: 'Badge vrijgespeeld',
    completionBadgeCardName: 'Ameland Ontdekker',
    completionBadgeCardText: 'Toegekend voor het voltooien van deze route.',
    completionShareTitle: 'Deel jouw Ameland-moment',
    completionShareBody: 'Ken je iemand die dit ook mooi zou vinden? Deel de tour eenvoudig.',
    completionShareButton: 'Delen',
    completionCopy: 'Kopieer link',
    completionCopied: 'Gekopieerd',
    completionShareText:
      'Ik heb net de audiotour "{tourTitle}" op Ameland afgerond. Echt een mooie manier om het eiland te beleven.',
    completionMoreLabel: 'Zin in meer?',
    completionMoreTitle: 'Ontdek nog een andere route op Ameland',
    completionMoreText:
      'Beleef het eiland opnieuw, met een ander verhaal, een andere sfeer en nieuwe plekken.',
    completionNextTourButton: 'Bekijk volgende tour',
    completionBackButton: 'Terug naar overzicht',
  },

  en: {
    appName: "Wad'n Verhaal",

    chooseLanguage: 'Choose language',
    chooseLanguageText:
      'Choose your language here. The app will then use this choice everywhere automatically.',

    discoverTitle: 'Discover Ameland through stories on the map',
    discoverText:
      'Start a calm audio tour on your phone, follow your live location, and easily walk to the next story point.',
    startTour: 'Start a tour',

    liveMap: 'Live map',
    liveMapText: 'See exactly where you are and where you are going.',
    audioOnTheGo: 'Audio on the go',
    audioOnTheGoText: 'Stories and experience at exactly the right place.',
    startDirectly: 'Start right away',
    startDirectlyText: 'No hassle, just open and begin.',
    walkOrBike: 'Walk or bike',
    walkOrBikeText: 'Choose the route that fits your day on Ameland.',

    howItWorks: 'How it works',
    step1: 'Choose your tour',
    step2: 'Open the tour on your phone',
    step3: 'Follow the route live and listen along the way',

    privacy: 'Privacy',
    privacyTitle: 'Privacy',
    privacyText1:
      'This app only processes data needed to provide the audio tour, such as your email address, payment status, and limited usage data to improve the service.',
    privacyText2:
      'Location is only used during the tour to start the correct audio fragment at the right moment.',

    terms: 'Terms',
    termsTitle: 'Terms',
    termsText1:
      'After purchase you receive access to your audio tour. Access is personal and intended for normal use during your visit.',
    termsText2:
      'Wad’n Verhaal is not liable for damage caused by improper use of the app or by ignoring traffic and safety rules.',

    back: 'Back',
    backToHome: 'Back to home',
    backToTours: 'Back to all tours',

    notFoundTitle: 'Page not found',
    notFoundText: 'The page you are looking for does not exist or has been moved.',

    availableRoutes: 'Available routes',
    chooseTour: 'Choose your tour',
    chooseTourText:
      'Choose the route that fits your day on Ameland and start easily on your phone.',
    noToursAvailable: 'There are currently no tours available.',
    noTours: 'There are currently no tours available.',

    walkingTour: 'Walking tour',
    walkingTourShort: 'Walking tour',
    bikeTour: 'Bike tour',
    walkTour: 'Walking tour',

    checkoutLabel: 'Checkout',
    checkoutTitle: 'Almost done',
    almostDone: 'Almost done',
    checkoutText: 'Complete your order and get direct access to your tour.',
    yourEmail: 'Your email address',
    emailAddress: 'Your email address',
    yourEmailPlaceholder: 'name@example.com',
    emailPlaceholder: 'name@example.com',
    completeOrder: 'Complete order',
    securePayment: 'Secure payment',
    directAccess: 'Direct access',
    directAccessText: 'After payment you can open your tour immediately.',
    paymentBenefit1: 'Right after payment you receive a personal start link.',
    paymentBenefit2: 'You can open the tour easily on your phone.',
    paymentBenefit3: 'Pay securely and start right away.',

    payAndReceiveLink: 'Pay and receive your start link',

    accessActive: 'Access active',
    accessBadge: 'Access active',
    accessText:
      'Your tour is ready. We only use your location to start the next story at the right moment.',
    accessBenefit1: 'You can start directly on your phone.',
    accessBenefit2: 'Audio plays automatically at the right places.',
    accessBenefit3: 'You can also manually go to the next stop.',
    startMyTour: 'Start tour',

    routePreview: 'Route preview',
    stopsLabel: 'stops',

    whatToExpect: 'What to expect',
    discoverAtYourOwnPace: 'Discover Ameland at your own pace.',
    listenAtSpecialPlaces: 'Listen to stories at special places.',
    directStartAfterPurchase: 'You can start immediately after purchase.',

    successBadge: 'Your order was successful',
    successTitle: 'Your tour is ready',
    successText:
      'Everything worked. You can continue directly to your personal tour.',
    successBenefit1: 'Your payment has been confirmed',
    successBenefit2: 'Your audio is ready on your phone',
    successBenefit3: 'You can start immediately whenever you want',
    openMyTourNow: 'Open my tour now',
    viewMoreTours: 'View more tours',
    tryAgain: 'Try again',

    tourActive: 'Tour active',
    status: 'Status',
    arrived: 'Arrived',
    underway: 'On the way',
    stopLabel: 'Stop',
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
    locationPromptNotOpened:
      'The browser did not open the location prompt. Please try again.',
    locationStillBlocked:
      'Location is still blocked by the browser. Click the lock icon in the address bar and allow location access.',
    locationRetryFailed:
      'Location could not be enabled again. Check your browser settings and allow location access.',
    locationRestartFailed: 'Location could not be restarted.',
    audioAutoStartFailed:
      'Audio could not start automatically. Press play to start it manually.',

    safeListeningTitle: 'Listen safely on the move',
    safeListeningText:
      'Prefer using one earbud or open-ear audio, keep your attention on traffic and surroundings, and pause or rewind later if a fragment is not safe to hear right now.',
    locationOffTitle: 'Location is off',
    locationOffText:
      'You can still follow the tour, but automatic audio and live route guidance work better when location access is allowed.',

    completionBadge: 'Tour completed',
    completionTitle: 'Thanks for exploring with us',
    completionIntro:
      'We hope {tourTitle} helped you see Ameland a little differently along the way. Feel free to take another moment to look around. You can always replay, pause, or rewind audio fragments later at a safe moment.',
    completionStopsLabel: 'Stops',
    completionStopsValue: 'visited',
    completionDurationLabel: 'Duration',
    completionFinishedLabel: 'Completed',
    completionExperienceTitle: 'How did you experience this tour?',
    completionFeedbackPromptPositive: 'What did you enjoy most about this tour?',
    completionFeedbackPromptImprove: 'What could we improve?',
    completionFeedbackPlaceholderPositive:
      'For example: the atmosphere, the stories, the places, or the route.',
    completionFeedbackPlaceholderImprove:
      'For example: the route, the audio, the explanations, or the ease of use.',
    completionFavoriteLabel: 'What part stood out most to you?',
    completionFavoritePlaceholder:
      'For example: a specific stop, the audio story, or the landscape.',
    completionRecommendLabel: 'Would you recommend this tour to others?',
    recommendYes: 'Yes, definitely',
    recommendMaybe: 'Maybe',
    recommendNo: 'No',
    completionSubmitting: 'Saving...',
    completionSubmit: 'Submit review',
    completionSubmitted: 'Thank you. Your review has been saved.',
    completionBadgeCardTitle: 'Badge unlocked',
    completionBadgeCardName: 'Ameland Explorer',
    completionBadgeCardText: 'Awarded for completing this route.',
    completionShareTitle: 'Share your Ameland moment',
    completionShareBody: 'Know someone who would enjoy this too? Share the tour easily.',
    completionShareButton: 'Share',
    completionCopy: 'Copy link',
    completionCopied: 'Copied',
    completionShareText:
      'I just completed the "{tourTitle}" audio tour on Ameland. Such a beautiful way to experience the island.',
    completionMoreLabel: 'Ready for more?',
    completionMoreTitle: 'Discover another route on Ameland',
    completionMoreText:
      'Experience the island again with a different story, a different atmosphere, and new places.',
    completionNextTourButton: 'View next tour',
    completionBackButton: 'Back to overview',
  },

  de: {
    appName: "Wad'n Verhaal",

    chooseLanguage: 'Sprache wählen',
    chooseLanguageText:
      'Wähle hier deine Sprache. Die App verwendet diese Auswahl danach automatisch überall.',

    discoverTitle: 'Entdecke Ameland mit Geschichten auf der Karte',
    discoverText:
      'Starte eine ruhige Audiotour auf deinem Handy, verfolge deinen Standort live und laufe einfach zum nächsten Erzählpunkt.',
    startTour: 'Tour starten',

    liveMap: 'Live-Karte',
    liveMapText: 'Sieh direkt, wo du bist und wohin du gehst.',
    audioOnTheGo: 'Audio unterwegs',
    audioOnTheGoText: 'Geschichten und Erlebnis genau am richtigen Ort.',
    startDirectly: 'Direkt starten',
    startDirectlyText: 'Kein Aufwand, einfach öffnen und loslegen.',
    walkOrBike: 'Wandern oder Radfahren',
    walkOrBikeText: 'Wähle die Route, die zu deinem Tag auf Ameland passt.',

    howItWorks: 'So funktioniert es',
    step1: 'Wähle deine Tour',
    step2: 'Öffne die Tour auf deinem Handy',
    step3: 'Folge der Route live und höre unterwegs zu',

    privacy: 'Datenschutz',
    privacyTitle: 'Datenschutz',
    privacyText1:
      'Diese App verarbeitet nur Daten, die für die Audiotour notwendig sind, wie deine E-Mail-Adresse, den Zahlungsstatus und begrenzte Nutzungsdaten zur Verbesserung des Dienstes.',
    privacyText2:
      'Der Standort wird nur während der Tour verwendet, um das richtige Audiofragment im richtigen Moment zu starten.',

    terms: 'Bedingungen',
    termsTitle: 'Bedingungen',
    termsText1:
      'Nach dem Kauf erhältst du Zugang zu deiner Audiotour. Der Zugang ist persönlich und für die normale Nutzung während deines Besuchs bestimmt.',
    termsText2:
      'Wad’n Verhaal haftet nicht für Schäden, die durch unsachgemäße Nutzung der App oder durch das Ignorieren von Verkehrs- und Sicherheitsregeln entstehen.',

    back: 'Zurück',
    backToHome: 'Zurück zur Startseite',
    backToTours: 'Zurück zu allen Touren',

    notFoundTitle: 'Seite nicht gefunden',
    notFoundText: 'Die Seite, die du suchst, existiert nicht oder wurde verschoben.',

    availableRoutes: 'Verfügbare Routen',
    chooseTour: 'Wähle deine Tour',
    chooseTourText:
      'Wähle die Route, die zu deinem Tag auf Ameland passt, und starte einfach auf deinem Handy.',
    noToursAvailable: 'Zurzeit sind noch keine Touren verfügbar.',
    noTours: 'Zurzeit sind noch keine Touren verfügbar.',

    walkingTour: 'Wandertour',
    walkingTourShort: 'Wandertour',
    bikeTour: 'Fahrradtour',
    walkTour: 'Wandertour',

    checkoutLabel: 'Kasse',
    checkoutTitle: 'Fast fertig',
    almostDone: 'Fast fertig',
    checkoutText:
      'Schließe deine Bestellung ab und erhalte direkten Zugang zu deiner Tour.',
    yourEmail: 'Deine E-Mail-Adresse',
    emailAddress: 'Deine E-Mail-Adresse',
    yourEmailPlaceholder: 'name@beispiel.de',
    emailPlaceholder: 'name@beispiel.de',
    completeOrder: 'Bestellung abschließen',
    securePayment: 'Sicher bezahlen',
    directAccess: 'Direkter Zugang',
    directAccessText: 'Nach der Zahlung kannst du deine Tour sofort öffnen.',
    paymentBenefit1: 'Direkt nach der Zahlung erhältst du einen persönlichen Startlink.',
    paymentBenefit2: 'Du öffnest die Tour ganz einfach auf deinem Handy.',
    paymentBenefit3: 'Sicher bezahlen und danach sofort loslegen.',

    payAndReceiveLink: 'Bezahlen und Startlink erhalten',

    accessActive: 'Zugang aktiv',
    accessBadge: 'Zugang aktiv',
    accessText:
      'Deine Tour ist bereit. Wir verwenden deinen Standort nur, um die nächste Geschichte im richtigen Moment zu starten.',
    accessBenefit1: 'Du kannst direkt auf deinem Handy starten.',
    accessBenefit2: 'Audio spielt automatisch an den richtigen Orten ab.',
    accessBenefit3: 'Du kannst auch manuell zum nächsten Stopp gehen.',
    startMyTour: 'Tour starten',

    routePreview: 'Routenvorschau',
    stopsLabel: 'Stopps',

    whatToExpect: 'Was dich erwartet',
    discoverAtYourOwnPace: 'Entdecke Ameland in deinem eigenen Tempo.',
    listenAtSpecialPlaces: 'Höre Geschichten an besonderen Orten.',
    directStartAfterPurchase: 'Nach dem Kauf kannst du sofort starten.',

    successBadge: 'Deine Bestellung war erfolgreich',
    successTitle: 'Deine Tour ist bereit',
    successText:
      'Alles hat geklappt. Du kannst direkt mit deiner persönlichen Tour weitermachen.',
    successBenefit1: 'Deine Zahlung wurde bestätigt',
    successBenefit2: 'Dein Audio ist auf deinem Handy bereit',
    successBenefit3: 'Du kannst sofort starten, wann immer du möchtest',
    openMyTourNow: 'Meine Tour jetzt öffnen',
    viewMoreTours: 'Weitere Touren ansehen',
    tryAgain: 'Erneut versuchen',

    tourActive: 'Tour aktiv',
    status: 'Status',
    arrived: 'Angekommen',
    underway: 'Unterwegs',
    stopLabel: 'Stopp',
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
    locationPromptNotOpened:
      'Der Browser hat die Standortabfrage nicht geöffnet. Bitte versuche es erneut.',
    locationStillBlocked:
      'Der Standort ist weiterhin im Browser blockiert. Klicke auf das Schloss links in der Adressleiste und erlaube den Standort.',
    locationRetryFailed:
      'Standort konnte nicht erneut aktiviert werden. Prüfe deine Browsereinstellungen und erlaube den Standort.',
    locationRestartFailed: 'Standort konnte nicht erneut gestartet werden.',
    audioAutoStartFailed:
      'Audio konnte nicht automatisch gestartet werden. Drücke auf Play, um es manuell zu starten.',

    safeListeningTitle: 'Unterwegs sicher hören',
    safeListeningText:
      'Verwende am besten einen Ohrhörer oder Open-Ear-Audio, achte auf Verkehr und Umgebung und pausiere oder spule später zurück, wenn ein Abschnitt gerade nicht sicher anzuhören ist.',
    locationOffTitle: 'Standort ist aus',
    locationOffText:
      'Du kannst der Tour weiterhin folgen, aber automatische Audioausgabe und Live-Routenführung funktionieren besser, wenn der Standort erlaubt ist.',

    completionBadge: 'Tour abgeschlossen',
    completionTitle: 'Danke, dass du mit uns unterwegs warst',
    completionIntro:
      'Wir hoffen, dass dir {tourTitle} unterwegs einen neuen Blick auf Ameland gegeben hat. Schau dich gern noch einen Moment um. Audioabschnitte kannst du später jederzeit an einem sicheren Moment erneut anhören, pausieren oder zurückspulen.',
    completionStopsLabel: 'Stopps',
    completionStopsValue: 'besucht',
    completionDurationLabel: 'Dauer',
    completionFinishedLabel: 'Abgeschlossen',
    completionExperienceTitle: 'Wie hast du diese Tour erlebt?',
    completionFeedbackPromptPositive: 'Was hat dir an dieser Tour am besten gefallen?',
    completionFeedbackPromptImprove: 'Was können wir verbessern?',
    completionFeedbackPlaceholderPositive:
      'Zum Beispiel: die Atmosphäre, die Geschichten, die Orte oder die Route.',
    completionFeedbackPlaceholderImprove:
      'Zum Beispiel: die Route, das Audio, die Erklärungen oder die Benutzerfreundlichkeit.',
    completionFavoriteLabel: 'Welcher Teil ist dir besonders in Erinnerung geblieben?',
    completionFavoritePlaceholder:
      'Zum Beispiel: ein bestimmter Stopp, die Audiogeschichte oder die Landschaft.',
    completionRecommendLabel: 'Würdest du diese Tour anderen empfehlen?',
    recommendYes: 'Ja, auf jeden Fall',
    recommendMaybe: 'Vielleicht',
    recommendNo: 'Nein',
    completionSubmitting: 'Wird gespeichert...',
    completionSubmit: 'Bewertung senden',
    completionSubmitted: 'Danke. Deine Bewertung wurde gespeichert.',
    completionBadgeCardTitle: 'Abzeichen freigeschaltet',
    completionBadgeCardName: 'Ameland-Entdecker',
    completionBadgeCardText: 'Verliehen für das Abschließen dieser Route.',
    completionShareTitle: 'Teile deinen Ameland-Moment',
    completionShareBody:
      'Kennst du jemanden, dem das auch gefallen würde? Teile die Tour ganz einfach.',
    completionShareButton: 'Teilen',
    completionCopy: 'Link kopieren',
    completionCopied: 'Kopiert',
    completionShareText:
      'Ich habe gerade die Audiotour "{tourTitle}" auf Ameland abgeschlossen. Eine wirklich schöne Art, die Insel zu erleben.',
    completionMoreLabel: 'Lust auf mehr?',
    completionMoreTitle: 'Entdecke noch eine andere Route auf Ameland',
    completionMoreText:
      'Erlebe die Insel noch einmal – mit einer anderen Geschichte, einer anderen Stimmung und neuen Orten.',
    completionNextTourButton: 'Nächste Tour ansehen',
    completionBackButton: 'Zurück zur Übersicht',
  },
} as const

export function getTourTitle(tour: Tour, language: AppLanguage) {
  if (language === 'en' && tour.title_en) return tour.title_en
  if (language === 'de' && tour.title_de) return tour.title_de
  return tour.title
}

export function getTourSubtitle(tour: Tour, language: AppLanguage) {
  if (language === 'en' && tour.subtitle_en) return tour.subtitle_en
  if (language === 'de' && tour.subtitle_de) return tour.subtitle_de
  return tour.subtitle
}

export function getTourDescription(tour: Tour, language: AppLanguage) {
  if (language === 'en' && tour.description_en) return tour.description_en
  if (language === 'de' && tour.description_de) return tour.description_de
  return tour.description
}

export function getStopTitle(stop: TourStop | null, language: AppLanguage) {
  if (!stop) return null
  if (language === 'en' && stop.title_en) return stop.title_en
  if (language === 'de' && stop.title_de) return stop.title_de
  return stop.title
}

export function getStopShortDescription(stop: TourStop, language: AppLanguage) {
  if (language === 'en' && stop.short_description_en) return stop.short_description_en
  if (language === 'de' && stop.short_description_de) return stop.short_description_de
  return stop.short_description
}