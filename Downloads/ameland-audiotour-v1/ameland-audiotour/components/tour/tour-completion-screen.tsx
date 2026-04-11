'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Star,
  Map,
  Clock3,
  Route,
  Gift,
  Share2,
  Copy,
  ArrowRight,
  BadgeCheck,
  MessageSquareText,
} from 'lucide-react';

type Recommendation = 'yes' | 'maybe' | 'no' | null;

type Props = {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  completedAtLabel: string;
  stopsCompleted: number;
  stopsTotal: number;
  durationMinutes: number;
  distanceKm: number;
  onSubmitFeedback: (payload: {
    rating: number;
    feedbackText: string;
    recommendation: Recommendation;
    favoritePart: string;
  }) => Promise<void>;
  onViewNextTour?: () => void;
  onBackToOverview?: () => void;
  shareUrl?: string;
};

const bonusMessages = [
  {
    title: 'Nog één laatste eilandgeheim',
    text: 'De mooiste verhalen van Ameland zitten vaak niet alleen in grote monumenten, maar juist in gewone plekken. Een straat, een uitzicht of een onverwachte bocht vertelt soms meer dan een bord ooit kan doen.',
  },
  {
    title: 'Lokale tip voor na de tour',
    text: 'Neem nog even de tijd om rustig om je heen te kijken of ergens in de buurt iets te drinken. Juist na afloop vallen details vaak pas echt op.',
  },
];

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-stone-500">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-base font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`rounded-full p-2 transition ${
              active
                ? 'bg-amber-50 text-amber-500'
                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            }`}
            aria-label={`Geef ${star} ster${star > 1 ? 'ren' : ''}`}
          >
            <Star className={`h-6 w-6 ${active ? 'fill-current' : ''}`} />
          </button>
        );
      })}
    </div>
  );
}

export default function TourCompletionScreen({
  tourId,
  tourSlug,
  tourTitle,
  completedAtLabel,
  stopsCompleted,
  stopsTotal,
  durationMinutes,
  distanceKm,
  onSubmitFeedback,
  onViewNextTour,
  onBackToOverview,
  shareUrl,
}: Props) {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation>(null);
  const [favoritePart, setFavoritePart] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const bonus = useMemo(() => {
    const index = tourSlug.length % bonusMessages.length;
    return bonusMessages[index];
  }, [tourSlug]);

  const feedbackPrompt =
    rating >= 4
      ? 'Wat vond je het mooiste aan deze tour?'
      : 'Wat kunnen we verbeteren?';

  async function handleSubmit() {
    if (!rating || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmitFeedback({
        rating,
        feedbackText,
        recommendation,
        favoritePart,
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleShare() {
    if (!shareUrl) return;

    const text = `Ik heb net de audiotour "${tourTitle}" op Ameland afgerond. Echt een mooie manier om het eiland te beleven.`;

    if (navigator.share) {
      await navigator.share({
        title: tourTitle,
        text,
        url: shareUrl,
      });
      return;
    }

    await handleCopyLink();
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
      <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-gradient-to-b from-amber-50 via-white to-white shadow-lg">
        <div className="border-b border-stone-200/80 px-5 pb-5 pt-6">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Tour voltooid
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Bedankt dat je met ons op pad ging
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
            We hopen dat je {tourTitle} onderweg nét iets anders hebt leren zien.
            Neem gerust nog even de tijd om om je heen te kijken. Audiofragmenten kun je
            later altijd opnieuw beluisteren, pauzeren en terugspoelen op een veilig moment.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-5">
          <StatCard
            icon={<Map className="h-4 w-4" />}
            label="Stops"
            value={`${stopsCompleted}/${stopsTotal} bezocht`}
          />
          <StatCard
            icon={<Route className="h-4 w-4" />}
            label="Afstand"
            value={`${distanceKm.toFixed(1)} km`}
          />
          <StatCard
            icon={<Clock3 className="h-4 w-4" />}
            label="Duur"
            value={`${durationMinutes} min`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Afgerond"
            value={completedAtLabel}
          />
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-[24px] border border-amber-100 bg-amber-50/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <Gift className="h-5 w-5" />
              <h2 className="text-sm font-semibold">{bonus.title}</h2>
            </div>
            <p className="text-sm leading-6 text-stone-700">{bonus.text}</p>
          </div>
        </div>

        <div className="border-t border-stone-200 px-5 py-5">
          <div className="mb-4 flex items-center gap-2 text-stone-900">
            <MessageSquareText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Hoe heb je deze tour ervaren?</h2>
          </div>

          {!isSubmitted ? (
            <>
              <StarRating value={rating} onChange={setRating} />

              {rating > 0 && (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      {feedbackPrompt}
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                      placeholder={
                        rating >= 4
                          ? 'Bijvoorbeeld: de sfeer, de verhalen, de plekken of de route.'
                          : 'Bijvoorbeeld: de route, de audio, de uitleg of het gebruiksgemak.'
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Welk onderdeel sprong er voor jou uit?
                    </label>
                    <input
                      value={favoritePart}
                      onChange={(e) => setFavoritePart(e.target.value)}
                      className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500"
                      placeholder="Bijvoorbeeld: een specifieke stop, het audioverhaal of het landschap."
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-stone-700">
                      Zou je deze tour aanraden aan anderen?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Ja, zeker', value: 'yes' as const },
                        { label: 'Misschien', value: 'maybe' as const },
                        { label: 'Nee', value: 'no' as const },
                      ].map((option) => {
                        const active = recommendation === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRecommendation(option.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              active
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!rating || isSubmitting}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    {isSubmitting ? 'Bezig met opslaan...' : 'Verstuur beoordeling'}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Dank je wel. Je beoordeling is opgeslagen.
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-stone-900">
                <BadgeCheck className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Badge vrijgespeeld</h3>
              </div>
              <p className="text-base font-semibold text-stone-900">Ameland Ontdekker</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Toegekend voor het voltooien van deze route.
              </p>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-stone-900">
                <Share2 className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Deel jouw Ameland-moment</h3>
              </div>
              <p className="mb-3 text-sm leading-6 text-stone-600">
                Ken je iemand die dit ook mooi zou vinden? Deel de tour eenvoudig.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-500"
                >
                  <Share2 className="h-4 w-4" />
                  Delen
                </button>
                {shareUrl ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-stone-500"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Gekopieerd' : 'Kopieer link'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 px-5 py-5">
          <div className="rounded-[24px] bg-stone-900 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
              Zin in meer?
            </p>
            <h2 className="mt-2 text-xl font-semibold">Ontdek nog een andere route op Ameland</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
              Beleef het eiland opnieuw, met een ander verhaal, een andere sfeer en nieuwe plekken.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onViewNextTour}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
              >
                Bekijk volgende tour
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onBackToOverview}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-600 px-5 py-3 text-sm font-semibold text-white transition hover:border-stone-400"
              >
                Terug naar overzicht
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}