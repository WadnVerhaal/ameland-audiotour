'use client'

import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

type Props = {
  idleLabel: string
  loadingLabel: string
}

export function CheckoutSubmitButton({ idleLabel, loadingLabel }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        idleLabel
      )}
    </button>
  )
}