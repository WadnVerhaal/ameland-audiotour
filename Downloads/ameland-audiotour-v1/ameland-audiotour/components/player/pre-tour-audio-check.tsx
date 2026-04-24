'use client'

import { MapPin, Headphones, ShieldCheck, ArrowRight } from 'lucide-react'
import { HEADSET_PARTNER } from '@/lib/player/headset-partner'

type PreTourAudioCheckProps = {
  onStartWithoutPartner: () => void
  onStartWithPartner: () => void
}

export function PreTourAudioCheck({
  onStartWithoutPartner,
  onStartWithPartner,
}: PreTourAudioCheckProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 p-1 shadow-2xl shadow-stone-950/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,222,179,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.22),transparent_38%)]" />

      <div className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Headphones className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/90">
              Voor vertrek
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Heb je geschikte audio bij je?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-200">
              Gebruik onderweg bij voorkeur één oortje of open-ear audio. Zo geniet je van het verhaal,
              maar blijf je alert op verkeer, fietsers en je omgeving. Je kunt audio altijd pauzeren
              of later terugspoelen op een veilig moment.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.07] p-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-200/15 text-amber-100">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Geen headset of oortjes bij je?
              </p>

              <p className="mt-1 text-sm leading-6 text-stone-300">
                Dan nemen we {HEADSET_PARTNER.name} automatisch mee als korte voorbereidingsstop
                vóór de eerste officiële stop van de tour.
              </p>

              <p className="mt-2 text-xs font-medium text-stone-400">
                {HEADSET_PARTNER.address}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onStartWithoutPartner}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-stone-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-stone-100"
          >
            Ik ben klaar om te starten
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={onStartWithPartner}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            Toon partner op mijn route
          </button>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-black/15 px-3 py-3 text-xs leading-5 text-stone-300 ring-1 ring-white/10">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-100" />
          <span>
            Veiligheid eerst: blijf aandacht houden voor verkeer en omgeving. Luister opnieuw door
            te pauzeren of terug te spoelen wanneer je stilstaat.
          </span>
        </div>
      </div>
    </section>
  )
}
