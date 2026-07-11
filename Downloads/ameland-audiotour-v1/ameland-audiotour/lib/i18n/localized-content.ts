import { AppLanguage } from './translations'

type LocalizedTourLike = {
  title?: string | null
  title_nl?: string | null
  title_de?: string | null
  title_en?: string | null
  subtitle?: string | null
  subtitle_nl?: string | null
  subtitle_de?: string | null
  subtitle_en?: string | null
  description?: string | null
  description_nl?: string | null
  description_de?: string | null
  description_en?: string | null
}

type LocalizedStopLike = {
  title?: string | null
  title_nl?: string | null
  title_de?: string | null
  title_en?: string | null
  description?: string | null
  description_nl?: string | null
  description_de?: string | null
  description_en?: string | null
  audio_url?: string | null
  audio_url_nl?: string | null
  audio_url_de?: string | null
  audio_url_en?: string | null
}

function pickLocalizedValue<T extends Record<string, any>>(
  item: T,
  baseKey: string,
  language: AppLanguage
) {
  return (
    item[`${baseKey}_${language}`] ||
    item[`${baseKey}_nl`] ||
    item[baseKey] ||
    ''
  )
}

export function localizeTour<T extends LocalizedTourLike>(
  tour: T,
  language: AppLanguage
) {
  return {
    ...tour,
    localizedTitle: pickLocalizedValue(tour, 'title', language),
    localizedSubtitle: pickLocalizedValue(tour, 'subtitle', language),
    localizedDescription: pickLocalizedValue(tour, 'description', language),
  }
}

export function localizeStop<T extends LocalizedStopLike>(
  stop: T,
  language: AppLanguage
) {
  return {
    ...stop,
    localizedTitle: pickLocalizedValue(stop, 'title', language),
    localizedDescription: pickLocalizedValue(stop, 'description', language),
    localizedAudioUrl: pickLocalizedValue(stop, 'audio_url', language),
  }
}
