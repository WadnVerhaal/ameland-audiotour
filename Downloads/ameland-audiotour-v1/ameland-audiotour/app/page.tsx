import PremiumHomePage from '@/components/home/PremiumHomePage'

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams
  const raw = Array.isArray(query.lang) ? query.lang[0] : query.lang
  const language = raw === 'en' || raw === 'de' ? raw : raw === 'nl' ? 'nl' : undefined
  return <PremiumHomePage requestedLanguage={language} />
}
