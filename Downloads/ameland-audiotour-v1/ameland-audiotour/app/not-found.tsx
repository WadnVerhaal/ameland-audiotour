import Link from 'next/link'
import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

export default async function NotFound() {
  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <section className="rounded-[2rem] border border-app bg-app-card p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-app-accent">{t.notFoundTitle}</h1>
        <p className="mt-3 text-sm leading-6 text-app-muted">
          {t.notFoundText}
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-3.5 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
          >
            {t.backToHome}
          </Link>
        </div>
      </section>
    </main>
  )
}