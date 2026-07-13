import type { AppLanguage } from '@/lib/app-language'

type LocationHelpInput = {
  language: AppLanguage
  userAgent?: string
  platform?: string
}

type Device = 'iphone' | 'android' | 'mac' | 'windows' | 'other'
type Browser = 'safari' | 'chrome' | 'edge' | 'firefox' | 'other'

function detectDevice(userAgent: string, platform: string): Device {
  const value = `${userAgent} ${platform}`.toLowerCase()
  if (/iphone|ipad|ipod/.test(value)) return 'iphone'
  if (value.includes('android')) return 'android'
  if (/macintosh|macintel|mac os/.test(value)) return 'mac'
  if (/windows|win32|win64/.test(value)) return 'windows'
  return 'other'
}

function detectBrowser(userAgent: string): Browser {
  const value = userAgent.toLowerCase()
  if (/edg\//.test(value)) return 'edge'
  if (/crios|chrome\//.test(value)) return 'chrome'
  if (/fxios|firefox\//.test(value)) return 'firefox'
  if (/safari\//.test(value) && !/crios|chrome\//.test(value)) return 'safari'
  return 'other'
}

const safety = {
  nl: 'Blijf tijdens deze stappen veilig stilstaan. Ga daarna terug naar de tour, ververs de pagina en tik opnieuw op “Begin de tour”.',
  en: 'Stay safely stationary while changing these settings. Then return to the tour, refresh the page and tap “Start the tour” again.',
  de: 'Bleib während dieser Schritte sicher stehen. Kehre danach zur Tour zurück, lade die Seite neu und tippe erneut auf „Tour starten“.',
} satisfies Record<AppLanguage, string>

export function getLocationHelp({ language, userAgent = '', platform = '' }: LocationHelpInput) {
  const device = detectDevice(userAgent, platform)
  const browser = detectBrowser(userAgent)

  const guides: Record<AppLanguage, Record<Device, string[]>> = {
    nl: {
      iphone: browser === 'safari'
        ? [
            'Tik links in de adresbalk op “aA” of het pagina-icoon, kies Website-instellingen en zet Locatie op Sta toe.',
            'Open daarna Instellingen → Privacy en beveiliging → Locatievoorzieningen → Safari-websites.',
            'Kies “Bij gebruik van app” en zet “Exacte locatie” aan.',
          ]
        : [
            `Open Instellingen → Privacy en beveiliging → Locatievoorzieningen → ${browser === 'chrome' ? 'Chrome' : 'je browser'}.`,
            'Kies “Bij gebruik van app” en zet “Exacte locatie” aan.',
            'Controleer in de adresbalk bij de website-instellingen dat Locatie op Sta toe staat.',
          ],
      android: [
        'Tik in Chrome op het icoon links van het webadres → Machtigingen → Locatie → Toestaan.',
        'Open Android Instellingen → Locatie en zet Locatie gebruiken aan.',
        'Ga naar App-machtigingen → Chrome → Toestaan tijdens gebruik en schakel een nauwkeurige locatie in.',
      ],
      mac: [
        `Open de website-instellingen van ${browser === 'safari' ? 'Safari' : 'je browser'} en zet Locatie voor app.amelandaudiotours.nl op Sta toe.`,
        'Open Systeeminstellingen → Privacy en beveiliging → Locatievoorzieningen.',
        `Zet locatie aan voor ${browser === 'safari' ? 'Safari' : 'je browser'}.`,
      ],
      windows: [
        'Klik op het locatie- of instellingenicoon links van het webadres en zet Locatie op Toestaan.',
        'Open Windows Instellingen → Privacy en beveiliging → Locatie.',
        'Zet Locatieservices aan en sta toe dat desktop-apps je locatie gebruiken.',
      ],
      other: [
        'Open de website-instellingen via het icoon links van het webadres en zet Locatie op Toestaan.',
        'Controleer in de privacy-instellingen van je toestel dat locatieservices aanstaan voor je browser.',
        'Zet, indien beschikbaar, Exacte of Nauwkeurige locatie aan.',
      ],
    },
    en: {
      iphone: browser === 'safari'
        ? [
            'Tap “aA” or the page icon on the left of Safari’s address bar, choose Website Settings and set Location to Allow.',
            'Then open Settings → Privacy & Security → Location Services → Safari Websites.',
            'Choose “While Using the App” and enable “Precise Location”.',
          ]
        : [
            `Open Settings → Privacy & Security → Location Services → ${browser === 'chrome' ? 'Chrome' : 'your browser'}.`,
            'Choose “While Using the App” and enable “Precise Location”.',
            'Check the site settings in the address bar and set Location to Allow.',
          ],
      android: [
        'In Chrome, tap the icon left of the web address → Permissions → Location → Allow.',
        'Open Android Settings → Location and enable “Use location”.',
        'Open App permissions → Chrome → Allow while using, and enable precise location.',
      ],
      mac: [
        `Open ${browser === 'safari' ? 'Safari' : 'your browser'} website settings and allow Location for app.amelandaudiotours.nl.`,
        'Open System Settings → Privacy & Security → Location Services.',
        `Enable location access for ${browser === 'safari' ? 'Safari' : 'your browser'}.`,
      ],
      windows: [
        'Click the location or site-settings icon left of the web address and set Location to Allow.',
        'Open Windows Settings → Privacy & security → Location.',
        'Enable Location services and allow desktop apps to access your location.',
      ],
      other: [
        'Open the site settings from the icon left of the web address and set Location to Allow.',
        'In your device privacy settings, make sure location services are enabled for your browser.',
        'Enable Precise or Accurate location if that option is available.',
      ],
    },
    de: {
      iphone: browser === 'safari'
        ? [
            'Tippe links in der Safari-Adressleiste auf „aA“ oder das Seitensymbol, wähle Website-Einstellungen und stelle Standort auf Erlauben.',
            'Öffne danach Einstellungen → Datenschutz & Sicherheit → Ortungsdienste → Safari-Websites.',
            'Wähle „Beim Verwenden der App“ und aktiviere „Genauer Standort“.',
          ]
        : [
            `Öffne Einstellungen → Datenschutz & Sicherheit → Ortungsdienste → ${browser === 'chrome' ? 'Chrome' : 'deinen Browser'}.`,
            'Wähle „Beim Verwenden der App“ und aktiviere „Genauer Standort“.',
            'Prüfe in den Website-Einstellungen der Adressleiste, dass Standort erlaubt ist.',
          ],
      android: [
        'Tippe in Chrome auf das Symbol links neben der Webadresse → Berechtigungen → Standort → Zulassen.',
        'Öffne Android-Einstellungen → Standort und aktiviere „Standort verwenden“.',
        'Öffne App-Berechtigungen → Chrome → Während der Nutzung zulassen und aktiviere den genauen Standort.',
      ],
      mac: [
        `Öffne die Website-Einstellungen von ${browser === 'safari' ? 'Safari' : 'deinem Browser'} und erlaube den Standort für app.amelandaudiotours.nl.`,
        'Öffne Systemeinstellungen → Datenschutz & Sicherheit → Ortungsdienste.',
        `Aktiviere den Standortzugriff für ${browser === 'safari' ? 'Safari' : 'deinen Browser'}.`,
      ],
      windows: [
        'Klicke links neben der Webadresse auf das Standort- oder Website-Symbol und stelle Standort auf Zulassen.',
        'Öffne Windows-Einstellungen → Datenschutz & Sicherheit → Standort.',
        'Aktiviere Ortungsdienste und erlaube Desktop-Apps den Standortzugriff.',
      ],
      other: [
        'Öffne über das Symbol links neben der Webadresse die Website-Einstellungen und erlaube den Standort.',
        'Prüfe in den Datenschutzeinstellungen des Geräts, ob Ortungsdienste für deinen Browser aktiviert sind.',
        'Aktiviere, falls vorhanden, den genauen Standort.',
      ],
    },
  }

  return {
    status: 'instructions_ready' as const,
    detectedDevice: device,
    detectedBrowser: browser,
    steps: guides[language][device],
    finalStep: safety[language],
  }
}
