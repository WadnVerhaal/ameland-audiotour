'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

type Props = {
  idleLabel?: string
  loadingLabel?: string
}

export function CheckoutSubmitButton({
  idleLabel = 'Betalen',
  loadingLabel = 'Even wachten…',
}: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="relative w-full overflow-hidden rounded-2xl bg-[#536b4d] px-5 py-4 text-base font-bold text-white shadow-lg shadow-[#536b4d]/20 transition hover:bg-[#465d41] disabled:cursor-wait disabled:opacity-90"
    >
      <span className="flex items-center justify-center gap-2">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? loadingLabel : idleLabel}
      </span>

      {pending && (
        <span className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/20">
          <span className="block h-full w-1/2 animate-[paymentLoading_1.1s_ease-in-out_infinite] rounded-full bg-white/80" />
        </span>
      )}
    </button>
  )
}
