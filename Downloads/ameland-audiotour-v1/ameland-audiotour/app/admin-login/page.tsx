import { loginAdmin } from './actions'

type Props = {
  searchParams?: Promise<{
    error?: string
    next?: string
  }>
}

function getErrorMessage(error?: string) {
  if (error === 'invalid') return 'Onjuist wachtwoord.'
  if (error === 'config') return 'Admin login is nog niet goed ingesteld in de omgevingsvariabelen.'
  return ''
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams
  const error = params?.error
  const next = params?.next || '/admin'

  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <div className="w-full rounded-[2rem] border border-[#dbecef] bg-white p-6 shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5a8d93]">
          Beveiligde omgeving
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#143a43]">Admin login</h1>
        <p className="mt-3 text-sm leading-7 text-[#5b757b]">
          Log in om de beheeromgeving van Wad&apos;n Verhaal te openen.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-[#ffd9cf] bg-[#fff4f1] px-4 py-3 text-sm text-[#b85c45]">
            {getErrorMessage(error)}
          </div>
        ) : null}

        <form action={loginAdmin} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#143a43]">Wachtwoord</span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
              placeholder="Voer admin wachtwoord in"
            />
          </label>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f4b58] px-5 py-3 font-semibold text-white transition hover:opacity-90"
          >
            Inloggen
          </button>
        </form>
      </div>
    </main>
  )
}