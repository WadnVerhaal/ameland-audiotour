import Link from 'next/link'
import { AatCard, AatFooter, AatHero, AatPage } from '@/components/ui/aat-layout'

export default function PrivacyPage() {
  return (
    <AatPage>
      <AatCard>
        <AatHero
          eyebrow="Privacy"
          title="Zorgvuldig met je gegevens."
          text="We gebruiken gegevens alleen om je bestelling en toegang tot de audiotour goed te laten werken."
          backHref="/"
          backLabel="← Terug naar begin"
        />

        <div style={{ padding: 22, background: '#fffdf8' }}>
          <div style={{ borderRadius: 28, background: '#f7f2e8', border: '1px solid #eee6d8', padding: 20 }}>
            <h2 style={{ margin: 0, color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Wat we bewaren
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              We bewaren de gegevens die nodig zijn voor betaling, toegang tot de tour en service rondom je aankoop.
            </p>

            <h2 style={{ margin: '22px 0 0', color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Waarom
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Zodat je persoonlijke tourlink werkt en we je kunnen helpen als er iets misgaat.
            </p>

            <h2 style={{ margin: '22px 0 0', color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Skipper Hidde
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Skipper Hidde gebruikt slimme automatisering en, wanneer beschikbaar, kunstmatige intelligentie om klantenservicevragen te beantwoorden. Berichten en gegevens die je zelf in de chat deelt, gebruiken we alleen om je vraag af te handelen, misbruik te voorkomen en waar nodig een supportverzoek te registreren. Deel nooit betaalgegevens of wachtwoorden in de chat.
            </p>

            <h2 style={{ margin: '22px 0 0', color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Contact
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Voor vragen kun je mailen naar info@amelandaudiotours.nl.
            </p>
          </div>

          <Link
            href="/"
            className="aat-button-teal"
            style={{ marginTop: 16, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Terug naar begin
          </Link>
        </div>
      </AatCard>

      <AatFooter />
    </AatPage>
  )
}
