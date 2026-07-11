import Link from 'next/link'
import { AatCard, AatFooter, AatHero, AatPage } from '@/components/ui/aat-layout'

export default function VoorwaardenPage() {
  return (
    <AatPage>
      <AatCard>
        <AatHero
          eyebrow="Voorwaarden"
          title="Helder voor vertrek."
          text="Hier vind je de belangrijkste afspraken rondom aankoop, toegang en gebruik van de audiotours."
          backHref="/"
          backLabel="← Terug naar begin"
        />

        <div style={{ padding: 22, background: '#fffdf8' }}>
          <div style={{ borderRadius: 28, background: '#f7f2e8', border: '1px solid #eee6d8', padding: 20 }}>
            <h2 style={{ margin: 0, color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Toegang
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Na aankoop ontvang je toegang tot de gekozen audiotour. De persoonlijke link is bedoeld voor eigen gebruik.
            </p>

            <h2 style={{ margin: '22px 0 0', color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Gebruik onderweg
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Gebruik één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.
            </p>

            <h2 style={{ margin: '22px 0 0', color: '#20372f', fontSize: 22, fontWeight: 950, letterSpacing: '-0.035em' }}>
              Contact
            </h2>
            <p className="aat-text" style={{ margin: '10px 0 0', fontSize: 15 }}>
              Vragen of problemen? Mail naar info@amelandaudiotours.nl.
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
