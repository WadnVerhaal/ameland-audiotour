import type { UIMessage } from 'ai'
import type { AppLanguage } from '@/lib/app-language'
import { checkOrderStatus, createSupportRequest, resendAccessLink } from '@/lib/support/actions'

type SupportKnowledge = {
  faq: string
  tours: string
}

type FallbackInput = {
  messages: UIMessage[]
  language: AppLanguage
  pageContext: string
  knowledge: SupportKnowledge
}

const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/i
const orderPattern = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i

function messageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function answer(language: AppLanguage, values: Record<AppLanguage, string>) {
  return values[language]
}

function orderDetailsPrompt(language: AppLanguage, missingEmail: boolean, missingOrder: boolean) {
  if (missingEmail && missingOrder) {
    return answer(language, {
      nl: 'Stuur me het e-mailadres waarmee je bestelde en je bestelnummer. Je bestelnummer ziet eruit als een lange code met streepjes. Deel hier nooit betaalgegevens of een wachtwoord.',
      en: 'Send me the email address used for the order and your order number. The order number is a long code with hyphens. Never share payment details or a password here.',
      de: 'Schick mir die E-Mail-Adresse der Bestellung und deine Bestellnummer. Die Bestellnummer ist ein langer Code mit Bindestrichen. Teile hier niemals Zahlungsdaten oder ein Passwort.',
    })
  }
  if (missingEmail) {
    return answer(language, {
      nl: 'Ik heb je bestelnummer. Welk e-mailadres heb je bij de bestelling gebruikt?',
      en: 'I have your order number. Which email address did you use for the order?',
      de: 'Ich habe deine Bestellnummer. Welche E-Mail-Adresse hast du bei der Bestellung verwendet?',
    })
  }
  return answer(language, {
    nl: 'Ik heb je e-mailadres. Stuur ook je bestelnummer; dat is de lange code met streepjes uit je bestelbevestiging.',
    en: 'I have your email address. Please also send your order number, the long code with hyphens in your confirmation.',
    de: 'Ich habe deine E-Mail-Adresse. Schick bitte auch die Bestellnummer, den langen Code mit Bindestrichen aus deiner Bestätigung.',
  })
}

export async function buildFallbackSupportResponse({
  messages,
  language,
  pageContext,
  knowledge,
}: FallbackInput) {
  const userMessages = messages.filter((message) => message.role === 'user').map(messageText)
  const latest = (userMessages.at(-1) || '').trim()
  const context = userMessages.join(' ').toLowerCase()
  const latestLower = latest.toLowerCase()
  const email = userMessages.join(' ').match(emailPattern)?.[0]
  const orderId = userMessages.join(' ').match(orderPattern)?.[0]

  const wantsAccessLink = includesAny(context, [
    'startlink', 'start link', 'access link', 'toegangslink', 'zugangslink',
    'link ontbreekt', 'link missing', 'link fehlt', 'mail niet ontvangen',
    'email niet ontvangen', 'e-mail niet ontvangen', 'keine e-mail',
  ])
  const wantsOrderStatus = includesAny(context, [
    'bestelling', 'bestelnummer', 'order status', 'orderstatus', 'payment status',
    'betaling', 'betaald', 'bezahlt', 'bestellung', 'zahlung',
  ])
  const wantsRefundOrComplaint = includesAny(context, [
    'refund', 'terugbetaling', 'geld terug', 'klacht', 'complaint', 'beschwerde',
    'rückerstattung', 'restitutie',
  ])
  const accessExpired = includesAny(context, ['verlopen', 'expired', 'abgelaufen'])
  const asksHowItWorks = includesAny(context, [
    'hoe werkt', 'how does', 'how it works', 'wie funktioniert',
    'download', 'app store', 'install',
  ])

  if (wantsAccessLink && !accessExpired) {
    if (!email) {
      return answer(language, {
        nl: 'Dat zoek ik voor je uit. Welk e-mailadres heb je bij de bestelling gebruikt? Je bestelnummer mag je er ook bij zetten; dat werkt het snelst.',
        en: 'I’ll sort that out. Which email address did you use for the order? You can also add the order number; that is the quickest route.',
        de: 'Das kläre ich für dich. Welche E-Mail-Adresse hast du bei der Bestellung verwendet? Mit der Bestellnummer geht es am schnellsten.',
      })
    }

    const result = await resendAccessLink({ email, orderId, language })
    if (result.status === 'sent') {
      return answer(language, {
        nl: 'Gevonden. Ik heb je nog geldige persoonlijke startlink opnieuw verstuurd. Kijk ook even in je spamfolder; daar spoelt hij soms aan.',
        en: 'Found it. I have resent your still-valid personal start link. Please check your spam folder too; it occasionally washes up there.',
        de: 'Gefunden. Ich habe deinen noch gültigen persönlichen Startlink erneut gesendet. Schau bitte auch im Spam-Ordner nach.',
      })
    }
    if (result.status === 'expired') {
      return answer(language, {
        nl: 'Je startlink is verlopen. Ik kan die niet zelf verlengen, maar ik kan wel direct een supportverzoek voor je aanmaken. Zeg maar kort wat er is gebeurd.',
        en: 'Your start link has expired. I cannot extend it myself, but I can create a support request right away. Tell me briefly what happened.',
        de: 'Dein Startlink ist abgelaufen. Ich kann ihn nicht selbst verlängern, aber sofort eine Supportanfrage anlegen. Sag mir kurz, was passiert ist.',
      })
    }
    if (result.status === 'not_ready') {
      return answer(language, {
        nl: 'Je bestelling is gevonden, maar de startlink staat nog niet klaar. Ik raad aan de betaalpagina één keer te verversen. Blijft dit zo, dan maak ik een supportverzoek voor je aan.',
        en: 'Your order was found, but the start link is not ready yet. Refresh the payment result page once. If it stays this way, I can create a support request.',
        de: 'Deine Bestellung wurde gefunden, aber der Startlink ist noch nicht bereit. Aktualisiere die Zahlungsseite einmal. Bleibt es so, kann ich eine Supportanfrage anlegen.',
      })
    }
    if (result.status === 'not_found') {
      return answer(language, {
        nl: 'Ik vind geen betaalde bestelling met deze combinatie. Controleer het e-mailadres en bestelnummer nog één keer; daarna help ik je verder.',
        en: 'I cannot find a paid order with this combination. Check the email address and order number once more and I’ll help you from there.',
        de: 'Ich finde keine bezahlte Bestellung mit dieser Kombination. Prüfe E-Mail-Adresse und Bestellnummer noch einmal.',
      })
    }
    return answer(language, {
      nl: 'Als er een geldige bestelling op dit e-mailadres staat, is de startlink opnieuw verstuurd. Zo houden we je gegevens netjes privé. Kijk ook even in je spamfolder.',
      en: 'If there is a valid order for this email address, the start link has been resent. This keeps your details private. Please also check spam.',
      de: 'Wenn zu dieser E-Mail-Adresse eine gültige Bestellung gehört, wurde der Startlink erneut gesendet. So bleiben deine Daten geschützt. Prüfe auch den Spam-Ordner.',
    })
  }

  if (wantsOrderStatus) {
    if (!email || !orderId) return orderDetailsPrompt(language, !email, !orderId)
    const result = await checkOrderStatus({ email, orderId })
    if (result.status !== 'found') {
      return answer(language, {
        nl: 'Ik vind geen bestelling met deze combinatie. Controleer het e-mailadres en bestelnummer nog één keer.',
        en: 'I cannot find an order with this combination. Check the email address and order number once more.',
        de: 'Ich finde keine Bestellung mit dieser Kombination. Prüfe E-Mail-Adresse und Bestellnummer noch einmal.',
      })
    }
    const paid = result.paymentStatus === 'paid'
    return answer(language, {
      nl: paid
        ? `Je betaling voor ${result.tourTitle} is gelukt. Als je startlink ontbreekt, zeg dan “stuur mijn startlink opnieuw”.`
        : `Je bestelling voor ${result.tourTitle} staat op “${result.paymentStatus}”. Is dat na enkele minuten nog zo, dan maak ik een supportverzoek voor je aan.`,
      en: paid
        ? `Your payment for ${result.tourTitle} was successful. If the start link is missing, say “resend my start link”.`
        : `Your order for ${result.tourTitle} is currently “${result.paymentStatus}”. If that remains unchanged after a few minutes, I can create a support request.`,
      de: paid
        ? `Deine Zahlung für ${result.tourTitle} war erfolgreich. Fehlt der Startlink, sag „Startlink erneut senden“. `
        : `Deine Bestellung für ${result.tourTitle} steht auf „${result.paymentStatus}“. Bleibt das nach einigen Minuten so, kann ich eine Supportanfrage anlegen.`,
    })
  }

  if (wantsRefundOrComplaint || accessExpired) {
    if (!email) {
      return answer(language, {
        nl: 'Dat pak ik serieus op. Welk e-mailadres mogen we gebruiken om je hierover te bereiken? Deel geen betaalgegevens.',
        en: 'I’ll make sure this is handled properly. Which email address may we use to contact you? Do not share payment details.',
        de: 'Das nehme ich ernst. Unter welcher E-Mail-Adresse dürfen wir dich erreichen? Bitte keine Zahlungsdaten teilen.',
      })
    }
    const request = await createSupportRequest({
      category: wantsRefundOrComplaint ? 'payment' : 'access',
      summary: latest || context.slice(-1000),
      language,
      pageContext,
      email,
      orderId,
    })
    return answer(language, {
      nl: `Ik heb dit vastgelegd voor onze klantenservice. Je referentie is ${request.reference}. Je hoeft je verhaal niet opnieuw te doen.`,
      en: `I have logged this for our customer-service team. Your reference is ${request.reference}. You will not need to tell the story again.`,
      de: `Ich habe das für unseren Kundenservice erfasst. Deine Referenz lautet ${request.reference}. Du musst alles nicht noch einmal erklären.`,
    })
  }

  if (asksHowItWorks) {
    return answer(language, {
      nl: 'Je hoeft niets te installeren. Kies een tour, betaal veilig via Mollie en open daarna je persoonlijke startlink op je telefoon. De link blijft normaal 48 uur geldig en opent direct de route, kaart en audio.',
      en: 'There is nothing to install. Choose a tour, pay securely through Mollie, then open your personal start link on your phone. It normally stays valid for 48 hours and opens the route, map and audio.',
      de: 'Du musst nichts installieren. Wähle eine Tour, bezahle sicher über Mollie und öffne danach deinen persönlichen Startlink auf dem Handy. Er ist normalerweise 48 Stunden gültig und öffnet Route, Karte und Audio.',
    })
  }

  if (includesAny(context, ['locatie', 'gps', 'location', 'standort', 'positie'])) {
    return answer(language, {
      nl: 'Loop dit even na: 1) geef Safari of Chrome toestemming voor je exacte locatie, 2) zet locatievoorzieningen en mobiele data aan, 3) ververs de tourpagina. Je kunt altijd handmatig de volgende stop kiezen. Doe dit alleen als je veilig stilstaat.',
      en: 'Check these steps: 1) allow Safari or Chrome to use your precise location, 2) enable location services and mobile data, 3) refresh the tour page. You can always select the next stop manually. Only do this while safely stationary.',
      de: 'Prüfe bitte: 1) Safari oder Chrome den genauen Standort erlauben, 2) Standortdienste und mobile Daten einschalten, 3) die Tourseite aktualisieren. Den nächsten Stopp kannst du immer manuell wählen. Bitte nur im sicheren Stand.',
    })
  }

  if (includesAny(context, ['audio', 'geluid', 'geen geluid', 'hear', 'sound', 'ton', 'höre'])) {
    return answer(language, {
      nl: 'Probeer dit terwijl je stilstaat: zet mediavolume hoger, controleer stiltemodus en Bluetooth, tik één keer op “Audio activeren” en herlaad daarna de pagina. Werkt het nog niet, probeer Safari of Chrome zonder privémodus.',
      en: 'Try this while stationary: raise media volume, check silent mode and Bluetooth, tap “Enable audio” once, then reload the page. If it still fails, try Safari or Chrome outside private mode.',
      de: 'Probiere dies im sicheren Stand: Medienlautstärke erhöhen, Lautlosmodus und Bluetooth prüfen, einmal auf „Audio aktivieren“ tippen und die Seite neu laden. Falls nötig Safari oder Chrome ohne Privatmodus verwenden.',
    })
  }

  if (includesAny(context, ['route', 'verdwaald', 'lost', 'navigation', 'weg', 'karte', 'map'])) {
    return answer(language, {
      nl: 'Open in de tour de kaart en kies de eerstvolgende onvoltooide stop. Met “Volg mij” centreert de kaart weer op je locatie. De lijn toont de wandelroute; blijf voor je veiligheid altijd op toegankelijke paden.',
      en: 'Open the map in the tour and select the next incomplete stop. “Follow me” centres the map on your location again. The line shows the walking route; always stay on accessible paths.',
      de: 'Öffne die Karte in der Tour und wähle den nächsten offenen Stopp. Mit „Mir folgen“ wird die Karte wieder auf deinen Standort zentriert. Bleibe immer auf zugänglichen Wegen.',
    })
  }

  if (includesAny(context, ['welke tour', 'which tour', 'tour suits', 'welche tour', 'angebot', 'tours', 'route kiezen'])) {
    return answer(language, {
      nl: `Dit zijn de tours die nu beschikbaar zijn:\n\n${knowledge.tours}\n\nWil je vooral dorp, natuur of fietsen? Dan help ik je gericht kiezen.`,
      en: `These are the tours currently available:\n\n${knowledge.tours}\n\nWould you prefer village stories, nature or cycling? I’ll help you choose.`,
      de: `Diese Touren sind derzeit verfügbar:\n\n${knowledge.tours}\n\nMöchtest du lieber Dorfgeschichten, Natur oder Radfahren? Dann helfe ich dir bei der Wahl.`,
    })
  }

  if (/^(hoi|hallo|hey|goedemorgen|goedemiddag|hello|hi|moin|guten tag|guten morgen)[!. ]*$/i.test(latestLower)) {
    return answer(language, {
      nl: 'Moin! Waarmee zal ik je helpen: een tour kiezen, je bestelling controleren of iets oplossen tijdens de route?',
      en: 'Moin! Shall I help you choose a tour, check an order or solve something during the route?',
      de: 'Moin! Soll ich dir bei der Tourwahl, einer Bestellung oder unterwegs bei der Route helfen?',
    })
  }

  return answer(language, {
    nl: 'Ik help je graag. Gaat je vraag over een tour kiezen, betaling, een ontbrekende startlink, locatie, route of audio? Vertel in één zin wat er gebeurt; dan pak ik de juiste lijn.',
    en: 'I’m happy to help. Is this about choosing a tour, payment, a missing start link, location, route or audio? Tell me in one sentence what is happening and I’ll take the right course.',
    de: 'Ich helfe gern. Geht es um die Tourwahl, Zahlung, einen fehlenden Startlink, Standort, Route oder Audio? Beschreibe kurz, was passiert, dann nehme ich den richtigen Kurs.',
  })
}
