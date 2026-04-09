# Ameland Audiotour

Mobiele web-app voor GPS-gestuurde audiotours op Ameland.

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Mollie
- Resend

## Eerste setup
1. `npm install`
2. Maak `.env.local` op basis van `.env.example`
3. Voer `scripts/schema.sql` uit in Supabase
4. Voer `scripts/seed-first-tour.sql` uit
5. Start lokaal met `npm run dev`

## Kernflow
QR → tour kiezen → betalen → startlink → GPS → audio per stop

## Let op
- `/admin` gebruikt Basic Auth via middleware
- `success/[orderId]` wacht op bevestiging van Mollie webhook
- audio-uploads zijn in deze versie URL-velden; storage upload kan later worden toegevoegd
