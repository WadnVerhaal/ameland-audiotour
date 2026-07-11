import { redirect } from 'next/navigation'
import { getServerLanguage } from '@/lib/app-language-server'

type AppLanguage = 'nl' | 'en' | 'de'

type PageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

function normalizeLanguage(value: string | undefined | null): AppLanguage | null {
  if (value === 'nl' || value === 'en' || value === 'de') {
    return value
  }

  return null
}

export default async function AccessRedirectPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const resolvedSearchParams = await searchParams

  const rawLang = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang

  const serverLanguage = await getServerLanguage()
  const lang = normalizeLanguage(rawLang) ?? normalizeLanguage(serverLanguage) ?? 'nl'

  redirect(`/player/${encodeURIComponent(token)}?lang=${lang}`)
}
