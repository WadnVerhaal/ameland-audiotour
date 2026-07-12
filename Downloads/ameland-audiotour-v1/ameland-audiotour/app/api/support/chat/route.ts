import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import type { AppLanguage } from '@/lib/app-language'
import {
  checkOrderStatus,
  createSupportRequest,
  enforceSupportRateLimit,
  getPageSupportState,
  resendAccessLink,
} from '@/lib/support/actions'
import { getSupportKnowledge } from '@/lib/support/knowledge'
import { buildFallbackSupportResponse } from '@/lib/support/fallback'

export const maxDuration = 45

const allowedProductionOrigins = new Set([
  'https://amelandaudiotours.nl',
  'https://www.amelandaudiotours.nl',
  'https://app.amelandaudiotours.nl',
])

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true
  if (allowedProductionOrigins.has(origin)) return true
  if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return true
  return (process.env.SUPPORT_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .includes(origin)
}

function corsHeaders(origin: string | null) {
  const headers = new Headers({
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  })
  if (origin && isAllowedOrigin(origin)) headers.set('Access-Control-Allow-Origin', origin)
  return headers
}

function normalizeLanguage(value: unknown): AppLanguage {
  return value === 'en' || value === 'de' ? value : 'nl'
}

function errorResponse(message: string, status: number, origin: string | null) {
  return Response.json({ error: message }, { status, headers: corsHeaders(origin) })
}

function supportTextResponse(text: string, origin: string | null) {
  const id = `skipper-hidde-${Date.now()}`
  const stream = createUIMessageStream({
    execute({ writer }) {
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: text })
      writer.write({ type: 'text-end', id })
    },
  })
  return createUIMessageStreamResponse({ stream, headers: corsHeaders(origin) })
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) return errorResponse('Origin not allowed', 403, origin)

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await enforceSupportRateLimit(ip))) {
    return errorResponse('Too many requests. Please try again in a few minutes.', 429, origin)
  }

  let body: { messages?: UIMessage[]; locale?: unknown; context?: { pathname?: unknown } }
  try {
    body = await request.json()
  } catch {
    return errorResponse('Invalid request', 400, origin)
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : []
  if (!messages.length) return errorResponse('No messages supplied', 400, origin)

  const totalText = messages.reduce((total, message) => {
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join('')
    return total + text.length
  }, 0)
  if (totalText > 16000) return errorResponse('Conversation is too long', 413, origin)

  const language = normalizeLanguage(body.locale)
  const pathname =
    typeof body.context?.pathname === 'string' ? body.context.pathname.slice(0, 300) : '/'
  const [knowledge, pageContext] = await Promise.all([
    getSupportKnowledge(language),
    getPageSupportState(pathname),
  ])

  // The deterministic service layer keeps support available without an external
  // model. Enable AI augmentation only after the provider account is ready.
  if (process.env.SUPPORT_AI_ENABLED !== 'true') {
    const text = await buildFallbackSupportResponse({
      messages,
      language,
      pageContext,
      knowledge,
    })
    return supportTextResponse(text, origin)
  }

  const result = streamText({
    model: process.env.SUPPORT_AI_MODEL || 'openai/gpt-5.4',
    system: `You are Skipper Hidde, the autonomous customer-service host for Ameland Audiotours.

IDENTITY AND LANGUAGE
- You are a friendly, practical Ameland skipper: calm, lightly playful, never theatrical or verbose.
- Always answer in ${language === 'nl' ? 'Dutch' : language === 'de' ? 'German' : 'English'}, unless the visitor explicitly asks to switch.
- Stay within customer service for the website, checkout and audio-tour app.

BEHAVIOUR
- Solve the issue yourself when the available facts or tools allow it. Ask only one focused question at a time when information is missing.
- Use a tool as soon as its required data is available. Never claim an action succeeded unless the tool confirms it.
- Never invent tour details, prices, payment states, policies or opening hours.
- Never ask for a password, payment-card data, bank details or an access token. You may ask for the order number and purchasing email only when needed.
- Treat personal data minimally. Do not repeat full email addresses or order IDs in your reply.
- For refunds, complaints, expired access or anything you cannot safely decide, create a support request with createSupportRequest. Do not promise a refund.
- Give direct troubleshooting for location/audio: check browser permission, silent mode/media volume, mobile data, refresh, and try Safari/Chrome. Keep safety first while walking or cycling.
- Answers are normally 2-6 short sentences. Use numbered steps only when they genuinely help.

CURRENT PAGE
${pageContext}

PRODUCT FACTS
- This is a browser-based mobile web app; no app-store download is required.
- After a successful Mollie payment, a personal start link is shown and emailed.
- Access links normally remain valid for 48 hours. Never extend expired access yourself.
- Location is used during the tour to show the route and trigger audio. A tour can also be followed manually if location is unavailable.

ACTIVE TOURS
${knowledge.tours}

APPROVED FAQ
${knowledge.faq}`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      checkOrderStatus: tool({
        description: 'Verify an order state only when the visitor supplied both the purchasing email and order number.',
        inputSchema: z.object({
          email: z.string().email(),
          orderId: z.string().uuid(),
        }),
        execute: checkOrderStatus,
      }),
      resendAccessLink: tool({
        description: 'Resend an existing, still-valid personal tour link. Use when the visitor says the email or link is missing. An order number is preferred but optional.',
        inputSchema: z.object({
          email: z.string().email(),
          orderId: z.string().uuid().optional(),
        }),
        execute: ({ email, orderId }) => resendAccessLink({ email, orderId, language }),
      }),
      createSupportRequest: tool({
        description: 'Create a support case autonomously for an unresolved payment, access, audio, location, route or other issue. Summarize facts only.',
        inputSchema: z.object({
          category: z.enum(['payment', 'access', 'location', 'audio', 'route', 'other']),
          summary: z.string().min(10).max(1200),
          email: z.string().email().optional(),
          orderId: z.string().uuid().optional(),
        }),
        execute: (input) => createSupportRequest({ ...input, language, pageContext }),
      }),
    },
  })

  const response = result.toUIMessageStreamResponse({
    onError: () =>
      language === 'de'
        ? 'Skipper Hidde ist kurz nicht erreichbar. Versuche es bitte noch einmal.'
        : language === 'en'
          ? 'Skipper Hidde is briefly unavailable. Please try again.'
          : 'Skipper Hidde is even niet bereikbaar. Probeer het nog eens.',
  })
  corsHeaders(origin).forEach((value, key) => response.headers.set(key, value))
  return response
}
