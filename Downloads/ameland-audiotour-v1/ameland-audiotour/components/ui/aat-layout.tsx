import Link from 'next/link'
import type { ReactNode } from 'react'

export function AatPage({ children }: { children: ReactNode }) {
  return (
    <main className="aat-page">
      <div className="aat-shell">{children}</div>
    </main>
  )
}

export function AatCard({ children }: { children: ReactNode }) {
  return <section className="aat-card">{children}</section>
}

export function AatHero({
  eyebrow,
  title,
  text,
  backHref,
  backLabel = '← Terug',
}: {
  eyebrow: string
  title: string
  text?: string
  backHref?: string
  backLabel?: string
}) {
  return (
    <div className="aat-hero" style={{ padding: '30px 24px 24px' }}>
      {backHref && (
        <Link
          href={backHref}
          style={{
            display: 'inline-flex',
            color: '#657064',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 850,
            marginBottom: 18,
          }}
        >
          {backLabel}
        </Link>
      )}

      <p className="aat-eyebrow" style={{ margin: 0 }}>
        {eyebrow}
      </p>

      <h1
        className="aat-title"
        style={{
          margin: '10px 0 0',
          fontSize: 'clamp(40px, 10vw, 54px)',
        }}
      >
        {title}
      </h1>

      {text && (
        <p
          className="aat-text"
          style={{
            margin: '16px 0 0',
            maxWidth: 380,
            fontSize: 17,
          }}
        >
          {text}
        </p>
      )}
    </div>
  )
}

export function AatFooter() {
  return <p className="aat-footer">© Ameland Audiotours</p>
}
