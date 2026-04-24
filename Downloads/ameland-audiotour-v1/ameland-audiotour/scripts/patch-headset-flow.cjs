const fs = require('fs')

const file = 'components/player/tour-player.tsx'
let source = fs.readFileSync(file, 'utf8')

function fail(message) {
  console.error(`❌ ${message}`)
  process.exit(1)
}

if (!source.includes("PreTourAudioCheck")) {
  source = source.replace(
    "import { distanceInMeters } from '@/lib/utils/geo';",
    "import { distanceInMeters } from '@/lib/utils/geo';\nimport { PreTourAudioCheck } from '@/components/player/pre-tour-audio-check';\nimport { createHeadsetPartnerStop } from '@/lib/player/create-headset-partner-stop';"
  )
}

if (!source.includes("const [hasChosenAudioSetup")) {
  source = source.replace(
    "  const lastRouteKeyRef = useRef<string | null>(null);",
    `  const lastRouteKeyRef = useRef<string | null>(null);

  const [hasChosenAudioSetup, setHasChosenAudioSetup] = useState(false);
  const [includeHeadsetPartner, setIncludeHeadsetPartner] = useState(false);`
  )
}

const oldOrderedStops = `  const orderedStops = useMemo(() => {
    return [...stops].sort((a, b) => {
      const indexA = stops.indexOf(a);
      const indexB = stops.indexOf(b);
      return getStopOrder(a, indexA) - getStopOrder(b, indexB);
    });
  }, [stops]);`

const newOrderedStops = `  const orderedStops = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => {
      const indexA = stops.indexOf(a);
      const indexB = stops.indexOf(b);
      return getStopOrder(a, indexA) - getStopOrder(b, indexB);
    });

    if (!includeHeadsetPartner) return sortedStops;

    return [
      createHeadsetPartnerStop() as unknown as TourStop,
      ...sortedStops,
    ];
  }, [includeHeadsetPartner, stops]);`

if (source.includes(oldOrderedStops)) {
  source = source.replace(oldOrderedStops, newOrderedStops)
} else if (!source.includes('createHeadsetPartnerStop() as unknown as TourStop')) {
  fail('Ik kon het orderedStops-blok niet exact vinden. De patch is gestopt zonder je spelerbestand te overschrijven.')
}

if (!source.includes('const isPartnerStop =')) {
  source = source.replace(
    "  const currentStop = orderedStops[currentIndex];",
    `  const currentStop = orderedStops[currentIndex];
  const isPartnerStop = readField(currentStop, 'type') === 'partner';`
  )
}

if (!source.includes('if (!hasChosenAudioSetup)')) {
  const returnIndex = source.lastIndexOf('\n  return (')
  if (returnIndex === -1) {
    fail('Ik kon de laatste return van de TourPlayer niet vinden.')
  }

  const preTourReturn = `
  if (!hasChosenAudioSetup) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-5">
        <PreTourAudioCheck
          onStartWithoutPartner={() => {
            setIncludeHeadsetPartner(false);
            setHasChosenAudioSetup(true);
            setCurrentIndex(0);
          }}
          onStartWithPartner={() => {
            setIncludeHeadsetPartner(true);
            setHasChosenAudioSetup(true);
            setCurrentIndex(0);
          }}
        />
      </div>
    );
  }
`

  source = source.slice(0, returnIndex) + preTourReturn + source.slice(returnIndex)
}

source = source.replace(
  /Stop\s+\{currentIndex \+ 1\}\s+van\s+\{orderedStops\.length\}/g,
  "{isPartnerStop ? 'Voor vertrek' : `Stop ${currentIndex + 1} van ${includeHeadsetPartner ? orderedStops.length - 1 : orderedStops.length}`}"
)

source = source.replace(
  /Stop\s+\{currentIndex \+ 1\}\s*\/\s*\{orderedStops\.length\}/g,
  "{isPartnerStop ? 'Voor vertrek' : `Stop ${currentIndex + 1} / ${includeHeadsetPartner ? orderedStops.length - 1 : orderedStops.length}`}"
)

if (!source.includes('Open route naar Warenhuis Engels')) {
  source = source.replace(
    /(\{getStopDescription\(currentStop\)\})/,
    `$1
                    {isPartnerStop && (
                      <a
                        href={String(readField(currentStop, 'mapsUrl') ?? '#')}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-950/15 transition hover:-translate-y-0.5"
                      >
                        Open route naar Warenhuis Engels
                      </a>
                    )}`
  )
}

fs.writeFileSync(file, source)
console.log('✅ Headset-partnerflow is toegevoegd aan components/player/tour-player.tsx')
