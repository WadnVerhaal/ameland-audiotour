import { HEADSET_PARTNER } from '@/lib/player/headset-partner'

export function createHeadsetPartnerStop() {
  return {
    id: 'pre-tour-headset-partner',
    type: 'partner',
    isOfficialTourStop: false,
    title: 'Headset ophalen',
    title_nl: 'Headset ophalen',
    name: 'Headset ophalen',
    subtitle: HEADSET_PARTNER.label,
    short_description:
      'Nog geen geschikte oortjes of open-ear headset? Loop eerst langs Warenhuis Engels. Daarna begeleiden we je automatisch naar de eerste officiële stop van de tour.',
    description:
      'Je bent bijna klaar om te starten. Bij Warenhuis Engels kun je geschikte audio halen voor onderweg. Daarna begeleiden we je automatisch naar de eerste officiële stop van de tour.',
    address: HEADSET_PARTNER.address,
    lat: HEADSET_PARTNER.latitude,
    lng: HEADSET_PARTNER.longitude,
    latitude: HEADSET_PARTNER.latitude,
    longitude: HEADSET_PARTNER.longitude,
    mapsUrl: HEADSET_PARTNER.mapsUrl,
    audio_url: null,
    audio_url_nl: null,
    audio_url_en: null,
    audio_url_de: null,
    trigger_radius_meters: 20,
    order_index: -1,
  }
}
