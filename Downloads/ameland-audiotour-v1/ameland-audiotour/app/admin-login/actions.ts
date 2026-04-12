'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_COOKIE = 'wadn_admin_session'

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get('password') || '')
  const next = String(formData.get('next') || '/admin')
  const expectedPassword = process.env.ADMIN_PASSWORD
  const accessToken = process.env.ADMIN_ACCESS_TOKEN

  if (!expectedPassword || !accessToken) {
    redirect('/admin-login?error=config')
  }

  if (password !== expectedPassword) {
    redirect(`/admin-login?error=invalid&next=${encodeURIComponent(next)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  })

  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/admin-login')
}