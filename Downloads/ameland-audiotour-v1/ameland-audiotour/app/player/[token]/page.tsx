import { createClient } from "@supabase/supabase-js";
import {
  TourPlayer,
  type PlayerLanguage,
  type PlayerStop,
  type PlayerTour,
} from "../../../components/player/tour-player";

import { StopAudioAutoplayer } from '@/components/player/stop-audio-autoplayer'
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ lang?: string | string[] }>;
};

const VALID_LANGUAGES: PlayerLanguage[] = ["nl", "en", "de"];

function normaliseLanguage(value: unknown): PlayerLanguage {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_LANGUAGES.includes(raw as PlayerLanguage)
    ? (raw as PlayerLanguage)
    : "nl";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function readNestedObject(
  source: Record<string, unknown> | null,
  key: string
): Record<string, unknown> | null {
  if (!source) return null;

  const value = source[key];

  if (Array.isArray(value)) {
    return asRecord(value[0]);
  }

  return asRecord(value);
}

function readString(
  source: Record<string, unknown> | null,
  key: string
): string | null {
  if (!source) return null;

  const value = source[key];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;

  const time = new Date(expiresAt).getTime();

  if (Number.isNaN(time)) return false;

  return time < Date.now();
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase configuratie ontbreekt. Controleer NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function errorCopy(type: "invalid" | "expired" | "unpaid" | "empty") {
  if (type === "expired") {
    return {
      title: "Deze toegang is verlopen",
      message:
        "Je persoonlijke tourlink is niet meer actief. Bestel opnieuw of open de nieuwste link uit je e-mail.",
    };
  }

  if (type === "unpaid") {
    return {
      title: "Betaling nog niet bevestigd",
      message:
        "Deze tour is nog niet vrijgegeven. Zodra de betaling bevestigd is, werkt je persoonlijke link automatisch.",
    };
  }

  if (type === "empty") {
    return {
      title: "Deze tour heeft nog geen actieve stops",
      message:
        "De toegang is geldig, maar er zijn nog geen actieve routepunten gevonden voor deze tour.",
    };
  }

  return {
    title: "Deze tourlink werkt niet",
    message:
      "Controleer of je de volledige persoonlijke link uit de e-mail hebt geopend.",
  };
}

async function getPlayerData(token: string) {
  const supabase = getSupabaseServerClient();

  let accessResponse = await supabase
    .from("access_tokens")
    .select("*, orders(*), tours(*)")
    .eq("token", token)
    .maybeSingle();

  if (accessResponse.error) {
    accessResponse = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();
  }

  const access = asRecord(accessResponse.data);

  if (!access) {
    return { ok: false as const, ...errorCopy("invalid") };
  }

  const expiresAt = readString(access, "expires_at");

  if (isExpired(expiresAt)) {
    return { ok: false as const, ...errorCopy("expired") };
  }

  let order =
    readNestedObject(access, "orders") || readNestedObject(access, "order");

  const orderId = readString(access, "order_id") || readString(order, "id");

  if (!order && orderId) {
    const orderResponse = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    order = asRecord(orderResponse.data);
  }

  const orderStatus = readString(order, "status");

  if (orderStatus && orderStatus !== "paid") {
    return { ok: false as const, ...errorCopy("unpaid") };
  }

  let tour =
    readNestedObject(access, "tours") || readNestedObject(access, "tour");

  const tourId =
    readString(access, "tour_id") ||
    readString(order, "tour_id") ||
    readString(tour, "id");

  if (!tour && tourId) {
    const tourResponse = await supabase
      .from("tours")
      .select("*")
      .eq("id", tourId)
      .maybeSingle();

    tour = asRecord(tourResponse.data);
  }

  if (!tourId) {
    return { ok: false as const, ...errorCopy("invalid") };
  }

  let stopsResponse = await supabase
    .from("tour_stops")
    .select("*")
    .eq("tour_id", tourId)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  if (stopsResponse.error || !stopsResponse.data?.length) {
    stopsResponse = await supabase
      .from("tour_stops")
      .select("*")
      .eq("tour_id", tourId)
      .order("order_index", { ascending: true });
  }

  const stops = Array.isArray(stopsResponse.data)
    ? (stopsResponse.data as PlayerStop[])
    : [];

  if (!stops.length) {
    return { ok: false as const, ...errorCopy("empty") };
  }

  return {
    ok: true as const,
    tour: {
      id: tourId,
      title: "Ameland Audiotours",
      ...(tour || {}),
    } as PlayerTour,
    stops,
    expiresAt,
  };
}

function AccessError({
  title,
  message,
  lang,
}: {
  title: string;
  message: string;
  lang: PlayerLanguage;
}) {
  const backLabel =
    lang === "en"
      ? "Back to tours"
      : lang === "de"
      ? "Zurück zu den Touren"
      : "Terug naar tours";

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[80dvh] max-w-xl items-center justify-center">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Ameland Audiotours
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-200">{message}</p>
          <a
            href={`/tours?lang=${lang}`}
            className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-100"
          >
            {backLabel}
          </a>
        </div>
      </section>
    </main>
  );
}

export default async function PlayerPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const lang = normaliseLanguage(resolvedSearchParams.lang);

  try {
    const data = await getPlayerData(token);

    if (!data.ok) {
      return <AccessError title={data.title} message={data.message} lang={lang} />;
    }

    return (
      <>
      <TourPlayer
        token={token}
        tour={data.tour}
        stops={data.stops}
        initialLanguage={lang}
        expiresAt={data.expiresAt}
      />
        <StopAudioAutoplayer stops={data.stops} />
      </>
    );
  } catch (error) {
    return (
      <AccessError
        title="De player kon niet geladen worden"
        message={
          error instanceof Error
            ? error.message
            : "Er ging iets mis bij het ophalen van de tourgegevens."
        }
        lang={lang}
      />
    );
  }
}
