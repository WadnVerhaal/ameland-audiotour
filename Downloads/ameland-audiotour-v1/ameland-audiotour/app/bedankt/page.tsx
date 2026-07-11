export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    lang?: string;
    token?: string;
    completed?: string;
  }>;
};

type Language = "nl" | "en" | "de";

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    reviewTitle: string;
    reviewText: string;
    shareTitle: string;
    shareText: string;
    backToTours: string;
    home: string;
  }
> = {
  nl: {
    title: "Bedankt voor het luisteren",
    subtitle:
      "Je hebt de audiotour afgerond. Mooi dat je Ameland op deze manier hebt ontdekt.",
    reviewTitle: "Hoe was je ervaring?",
    reviewText:
      "Een korte review helpt ons om de tours beter te maken en helpt andere bezoekers kiezen.",
    shareTitle: "Tip voor straks",
    shareText:
      "Wil je nog een fragment terugluisteren? Open dan je persoonlijke tourlink opnieuw zolang je toegang actief is.",
    backToTours: "Bekijk meer tours",
    home: "Naar Ameland Audiotours",
  },
  en: {
    title: "Thanks for listening",
    subtitle:
      "You have completed the audio tour. We hope you enjoyed discovering Ameland this way.",
    reviewTitle: "How was your experience?",
    reviewText:
      "A short review helps us improve the tours and helps other visitors choose.",
    shareTitle: "Good to know",
    shareText:
      "Want to listen to a fragment again? Reopen your personal tour link while your access is still active.",
    backToTours: "View more tours",
    home: "Go to Ameland Audiotours",
  },
  de: {
    title: "Danke fürs Zuhören",
    subtitle:
      "Du hast die Audiotour beendet. Schön, dass du Ameland auf diese Weise entdeckt hast.",
    reviewTitle: "Wie war deine Erfahrung?",
    reviewText:
      "Eine kurze Bewertung hilft uns, die Touren besser zu machen und hilft anderen Besuchern bei der Auswahl.",
    shareTitle: "Gut zu wissen",
    shareText:
      "Möchtest du ein Fragment noch einmal hören? Öffne deinen persönlichen Tourlink erneut, solange dein Zugang aktiv ist.",
    backToTours: "Weitere Touren ansehen",
    home: "Zu Ameland Audiotours",
  },
};

function normaliseLanguage(value: unknown): Language {
  return value === "en" || value === "de" || value === "nl" ? value : "nl";
}

export default async function BedanktPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const lang = normaliseLanguage(params.lang);
  const copy = COPY[lang];

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />

      <section className="relative mx-auto flex min-h-[90dvh] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(110,231,183,0.24),transparent_35%),linear-gradient(145deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
              Ameland Audiotours
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
              <h2 className="text-lg font-black">{copy.reviewTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {copy.reviewText}
              </p>
              <a
                href="mailto:info@amelandaudiotours.nl?subject=Review%20Ameland%20Audiotours"
                className="mt-5 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-200"
              >
                Review sturen
              </a>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-5">
              <h2 className="text-lg font-black">{copy.shareTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {copy.shareText}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`/tours?lang=${lang}`}
                  className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {copy.backToTours}
                </a>
                <a
                  href={`/?lang=${lang}`}
                  className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {copy.home}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
