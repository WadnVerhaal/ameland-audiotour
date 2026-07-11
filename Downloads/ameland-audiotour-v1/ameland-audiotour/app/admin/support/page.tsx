import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { updateSupportStatus } from './actions'

export const dynamic = 'force-dynamic'

type SupportRequest = {
  id: string
  category: string
  summary: string
  locale: string
  page_context: string | null
  customer_email: string | null
  order_id: string | null
  status: 'open' | 'in_progress' | 'resolved'
  created_at: string
}

const statusLabels = {
  open: 'Open',
  in_progress: 'In behandeling',
  resolved: 'Afgerond',
}

export default async function SupportPage() {
  const supabase = createServerSupabase()
  const { data } = await supabase
    .from('support_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  const requests = (data || []) as SupportRequest[]

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <Link href="/admin" className="text-sm font-semibold text-[#0f4b58]">
        ← Terug naar dashboard
      </Link>

      <div className="mt-4 rounded-[2rem] border border-[#dbecef] bg-white p-6 shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5a8d93]">
          De Jutter
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#143a43]">Supportverzoeken</h1>
        <p className="mt-3 text-sm leading-7 text-[#5b757b]">
          Hier staan alleen vragen die De Jutter niet zelfstandig kon oplossen.
        </p>

        {requests.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-[#f3f9f8] p-5 text-sm text-[#5b757b]">
            Er zijn nog geen supportverzoeken. Mooi rustig op het strand.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-[1.5rem] border border-[#dbecef] bg-[#fbfdfd] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span className="rounded-full bg-[#e8f5f4] px-3 py-1 text-[#0f4b58]">
                        {request.category}
                      </span>
                      <span className="rounded-full bg-[#fff0eb] px-3 py-1 text-[#a1513e]">
                        {statusLabels[request.status]}
                      </span>
                      <span className="text-[#78979a]">{request.locale.toUpperCase()}</span>
                    </div>
                    <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-[#284e54]">
                      {request.summary}
                    </p>
                  </div>
                  <time className="text-xs text-[#78979a]" dateTime={request.created_at}>
                    {new Intl.DateTimeFormat('nl-NL', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Europe/Amsterdam',
                    }).format(new Date(request.created_at))}
                  </time>
                </div>

                <dl className="mt-4 grid gap-2 text-xs text-[#5b757b] md:grid-cols-2">
                  <div><dt className="font-semibold">E-mail</dt><dd>{request.customer_email || 'Niet opgegeven'}</dd></div>
                  <div><dt className="font-semibold">Bestelnummer</dt><dd className="break-all">{request.order_id || 'Niet opgegeven'}</dd></div>
                  <div className="md:col-span-2"><dt className="font-semibold">Pagina</dt><dd>{request.page_context || 'Onbekend'}</dd></div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(['open', 'in_progress', 'resolved'] as const).map((status) => (
                    <form key={status} action={updateSupportStatus}>
                      <input type="hidden" name="id" value={request.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        disabled={request.status === status}
                        className="rounded-xl border border-[#cfe3e5] bg-white px-3 py-2 text-xs font-semibold text-[#0f4b58] disabled:cursor-default disabled:bg-[#0f4b58] disabled:text-white"
                      >
                        {statusLabels[status]}
                      </button>
                    </form>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
