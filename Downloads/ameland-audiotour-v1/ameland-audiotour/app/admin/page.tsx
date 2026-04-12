import Link from 'next/link'
import { logoutAdmin } from '@/app/admin-login/actions'

const links = [
  { href: '/admin/tours', label: 'Tours beheren' },
  { href: '/admin/marketing-tours', label: 'Marketing tours beheren' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/reviews', label: 'Reviews' },
  { href: '/admin/partners', label: 'Partners' },
]

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="rounded-[2rem] border border-[#dbecef] bg-white p-6 shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5a8d93]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#143a43]">Dashboard</h1>
            <p className="mt-3 text-sm leading-7 text-[#5b757b]">
              Beheer hier je audiotours, marketing tours, orders en reviews.
            </p>
          </div>

          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-2xl border border-[#dce8e9] bg-[#f8fbfb] px-5 py-3 font-semibold text-[#0f4b58]"
            >
              Uitloggen
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.5rem] border border-[#dbecef] bg-[#fbfdfd] p-5 text-lg font-semibold text-[#143a43] transition hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}