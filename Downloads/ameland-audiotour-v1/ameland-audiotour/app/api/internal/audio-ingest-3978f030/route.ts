import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXPECTED_SHA256 = '3978f030a5124c7a78eb7c1d2688fc72cb28aa5e798bfecf98abd78c3553b8b3'
const EXPECTED_SIZE = 1341688
const STOP_ID = '5e7e10f7-6e15-4b76-81f6-5ee54e02e804'
const BUCKET = 'Fietsen door Hollum'
const OBJECT_PATH = 'human-voice/stop-02-museum-sorgdrager-nl-2026-07-11.mp3'
const SIGNED_URL_TTL_SECONDS = 10 * 365 * 24 * 60 * 60

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('audio/mpeg') && !contentType.includes('application/octet-stream')) {
    return NextResponse.json({ ok: false, error: 'Invalid content type' }, { status: 415 })
  }

  const bytes = Buffer.from(await request.arrayBuffer())
  const sha256 = createHash('sha256').update(bytes).digest('hex')

  if (bytes.length !== EXPECTED_SIZE || sha256 !== EXPECTED_SHA256) {
    return NextResponse.json({ ok: false, error: 'File validation failed' }, { status: 400 })
  }

  const supabase = createAdminSupabase()
  const storage = supabase.storage.from(BUCKET)

  const { error: uploadError } = await storage.upload(OBJECT_PATH, bytes, {
    contentType: 'audio/mpeg',
    cacheControl: '31536000',
    upsert: true,
  })

  if (uploadError) {
    return NextResponse.json(
      { ok: false, error: 'Upload failed', detail: uploadError.message },
      { status: 500 }
    )
  }

  const { data: signed, error: signedError } = await storage.createSignedUrl(
    OBJECT_PATH,
    SIGNED_URL_TTL_SECONDS
  )

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: 'Signed URL failed', detail: signedError?.message },
      { status: 500 }
    )
  }

  const { data: stop, error: updateError } = await supabase
    .from('tour_stops')
    .update({
      audio_url: signed.signedUrl,
      audio_url_nl: signed.signedUrl,
      estimated_duration_seconds: 82,
      updated_at: new Date().toISOString(),
    })
    .eq('id', STOP_ID)
    .select('id,title,audio_url_nl,estimated_duration_seconds')
    .single()

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: 'Stop update failed', detail: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, objectPath: OBJECT_PATH, stop })
}
