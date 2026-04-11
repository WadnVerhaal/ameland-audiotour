import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

export default async function VoorwaardenPage() {
  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">{t.termsTitle}</h1>

        <p className="mt-4 text-sm leading-6 text-stone-600">
          {t.termsText1}
        </p>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          {t.termsText2}
        </p>
      </div>
    </main>
  )
}