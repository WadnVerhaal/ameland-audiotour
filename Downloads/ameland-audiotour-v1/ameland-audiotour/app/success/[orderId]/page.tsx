import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, Headphones, MapPinned, ArrowLeft } from 'lucide-react'
import { getAccessTokenByOrderId } from '@/lib/data/access'
import { translations } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'

type Props = {
  params: Promise<{ orderId: string }>
}

export default async function SuccessPage({ params }: Props) {
  const { orderId } = await params
  const token = await getAccessTokenByOrderId(orderId)

  if (!token) {
    redirect('/tours')
  }

  const language = await getServerLanguage()
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="h-28 bg-[linear-gradient(90deg,#ece0b2_0%,#dde8e0_100%)]" />

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {t.successBadge}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-app-accent">{t.successTitle}</h1>

          <p className="mt-4 text-sm leading-8 text-app-muted">{t.successText}</p>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-4 text-sm text-app-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit1}</span>
          </div>

          <div className="flex items-start gap-3">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit2}</span>
          </div>

          <div className="flex items-start gap-3">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>{t.successBenefit3}</span>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <Link
          href={`/access/${token}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
        >
          {t.openMyTourNow}
        </Link>

        <Link
          href="/tours"
          className="inline-flex w-full items-center justify-center rounded-2xl border border-app bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:bg-app-card"
        >
          {t.viewMoreTours}
        </Link>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center text-sm font-medium text-app-muted transition hover:text-app-accent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t.backToHome}
        </Link>
      </div>
    </main>
  )
}