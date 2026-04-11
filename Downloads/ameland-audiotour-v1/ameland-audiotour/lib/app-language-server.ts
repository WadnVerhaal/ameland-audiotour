import { cookies } from 'next/headers'
import { APP_LANGUAGE_COOKIE, AppLanguage } from '@/lib/app-language'

export async function getServerLanguage(): Promise<AppLanguage> {
  const cookieStore = await cookies()
  const value = cookieStore.get(APP_LANGUAGE_COOKIE)?.value

  if (value === 'nl' || value === 'en' || value === 'de') {
    return value
  }

  return 'nl'
}