import fs from 'node:fs'
import path from 'node:path'

const target = path.join(process.cwd(), 'components', 'player', 'tour-player.tsx')
let source = fs.readFileSync(target, 'utf8')

function replaceOnce(name, before, after) {
  if (source.includes(after)) return
  if (!source.includes(before)) throw new Error(`Player patch failed: ${name}`)
  source = source.replace(before, after)
}

const safetyReplacements = [
  {
    name: 'remove nearest-stop override state',
    before: '  const autoSelectedNearestRef = useRef(false)\n',
    after: '',
  },
  {
    name: 'restore progress against stop ids after route reorder',
    before: `        if (Number.isInteger(progress.selectedIndex)) {
          setSelectedIndex(Math.max(0, Math.min(progress.selectedIndex || 0, cleanStops.length - 1)))
        }`,
    after: `        if (Array.isArray(progress.completedKeys) && progress.completedKeys.length > 0) {
          const nextIncomplete = cleanStops.findIndex(
            (stop, index) => !progress.completedKeys!.includes(stopKey(stop, index))
          )
          setSelectedIndex(nextIncomplete >= 0 ? nextIncomplete : Math.max(0, cleanStops.length - 1))
        } else if (Number.isInteger(progress.selectedIndex)) {
          setSelectedIndex(Math.max(0, Math.min(progress.selectedIndex || 0, cleanStops.length - 1)))
        }`,
  },
  {
    name: 'only trigger arrival for the selected route stop',
    before: `  useEffect(() => {
    if (!location || !cleanStops.length) return

    const candidates = cleanStops
      .map((stop, index) => {
        const coordinates = coordinatesFor(stop)
        if (!coordinates) return null
        return {
          index,
          distance: distanceMeters(location, coordinates),
          radius: Math.max(triggerRadiusFor(stop), Math.min(30, location.accuracy)),
        }
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance) as Array<{
      index: number
      distance: number
      radius: number
    }>

    const closest = candidates[0]
    const arrived =
      closest &&
      location.accuracy <= MAX_AUTO_ARRIVAL_ACCURACY_M &&
      closest.distance <= closest.radius
        ? closest.index
        : null

    setArrivedIndex(arrived)
    if (arrived !== null) setSelectedIndex(arrived)

    if (!autoSelectedNearestRef.current && closest && closest.distance <= 250) {
      autoSelectedNearestRef.current = true
      const nearestIncomplete = candidates.find(
        (candidate) => !completedKeys.includes(stopKey(cleanStops[candidate.index], candidate.index))
      )
      if (nearestIncomplete) setSelectedIndex(nearestIncomplete.index)
    }
  }, [cleanStops, completedKeys, location])`,
    after: `  useEffect(() => {
    if (!location || !selectedStop || selectedDistance === null) {
      setArrivedIndex(null)
      return
    }

    const configuredRadius = triggerRadiusFor(selectedStop)
    const accuracyAllowance = Math.min(10, Math.max(0, location.accuracy - 10))
    const arrivalRadius = configuredRadius + accuracyAllowance
    const leaveRadius = arrivalRadius + 12
    const wasAlreadyArrived = arrivedIndex === selectedIndex
    const isInside = selectedDistance <= (wasAlreadyArrived ? leaveRadius : arrivalRadius)
    const isAccurateEnough = location.accuracy <= MAX_AUTO_ARRIVAL_ACCURACY_M

    setArrivedIndex(isAccurateEnough && isInside ? selectedIndex : null)
  }, [arrivedIndex, location, selectedDistance, selectedIndex, selectedStop])`,
  },
]

for (const replacement of safetyReplacements) {
  if (!source.includes(replacement.before)) {
    if (!replacement.after || source.includes(replacement.after)) continue
    throw new Error(`Player patch failed: ${replacement.name}`)
  }
  source = source.replace(replacement.before, replacement.after)
}

replaceOnce(
  'audio seek icons',
  `  Route,
} from 'lucide-react'`,
  `  RotateCcw,
  RotateCw,
  Route,
} from 'lucide-react'`
)

replaceOnce(
  'audio time formatter',
  `function formatDistance(meters: number | null) {
  if (meters === null || !Number.isFinite(meters)) return '—'
  if (meters < 1000) return \`${'${Math.max(0, Math.round(meters))}'} m\`
  return \`${'${(meters / 1000).toFixed(1).replace(\'.\', \',\')}'} km\`
}
`,
  `function formatDistance(meters: number | null) {
  if (meters === null || !Number.isFinite(meters)) return '—'
  if (meters < 1000) return \`${'${Math.max(0, Math.round(meters))}'} m\`
  return \`${'${(meters / 1000).toFixed(1).replace(\'.\', \',\')}'} km\`
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0')
  return \`${'${minutes}'}:${'${remainder}'}\`
}
`
)

replaceOnce(
  'audio timing state',
  `  const [playing, setPlaying] = useState(false)
  const [restoredProgress, setRestoredProgress] = useState(false)`,
  `  const [playing, setPlaying] = useState(false)
  const [audioTime, setAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [restoredProgress, setRestoredProgress] = useState(false)`
)

replaceOnce(
  'audio seek helper',
  `  async function playOrPause() {`,
  `  function seekAudio(seconds: number) {
    const audio = audioRef.current
    if (!audio) return
    const maximum = Number.isFinite(audio.duration) ? audio.duration : Math.max(0, audio.currentTime + seconds)
    const next = Math.min(maximum, Math.max(0, audio.currentTime + seconds))
    audio.currentTime = next
    setAudioTime(next)
  }

  async function playOrPause() {`
)

replaceOnce(
  'reset audio timeline',
  `    setAudioBlocked(false)
    setPlaying(false)
    const audio = audioRef.current`,
  `    setAudioBlocked(false)
    setPlaying(false)
    setAudioTime(0)
    setAudioDuration(0)
    const audio = audioRef.current`
)

replaceOnce(
  'compact player header',
  `              <div className="min-w-0">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{copy.brand}</p>
                <h1 className="mt-1 truncate text-lg font-black tracking-tight text-white sm:text-xl">
                  {selectedIndex + 1}. {selectedTitle}
                </h1>
              </div>`,
  `              <div className="min-w-0">
                <p className="truncate text-sm font-black tracking-tight text-white">{copy.brand}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                  {selectedIndex + 1}/{cleanStops.length}
                </p>
              </div>`
)

replaceOnce(
  'remove repeated resume banner',
  `        {restoredProgress && completedKeys.length > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{copy.resume} · {progress}</span>
          </div>
        ) : null}

`,
  ``
)

replaceOnce(
  'remove metric helper repetition',
  `            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label={copy.distance} value={formatDistance(selectedDistance)} helper={copy.walkToStop} />
              <MetricCard label={copy.progress} value={progress} helper={selectedIsCompleted ? copy.completed : copy.selected} />
            </div>`,
  `            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label={copy.distance} value={formatDistance(selectedDistance)} />
              <MetricCard label={copy.progress} value={progress} />
            </div>`
)

replaceOnce(
  'remove repeated stop-list subtitles',
  `                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black text-white">
                      {titleFor(stop, language) || \`${'${copy.routePoints} ${index + 1}'}\`}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-400">
                      {isArrived
                        ? copy.arrived
                        : isCompleted
                        ? copy.completed
                        : distance !== null
                        ? \`${'${formatDistance(distance)} ${copy.away}'}\`
                        : copy.walkToStop}
                    </span>
                  </span>
                  {isSelected ? <Navigation className="h-5 w-5 shrink-0 text-emerald-300" /> : null}`,
  `                  <span className="min-w-0 flex-1 truncate text-sm font-black text-white">
                    {titleFor(stop, language) || \`${'${copy.routePoints} ${index + 1}'}\`}
                  </span>
                  {isSelected ? (
                    <Navigation className="h-5 w-5 shrink-0 text-emerald-300" />
                  ) : distance !== null ? (
                    <span className="shrink-0 text-xs font-bold text-slate-400">{formatDistance(distance)}</span>
                  ) : null}`
)

replaceOnce(
  'remove native duplicate audio controls',
  `                    controls
                    preload="metadata"
                    playsInline
                    onPlay={() => setPlaying(true)}`,
  `                    preload="metadata"
                    playsInline
                    onLoadedMetadata={(event) => setAudioDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
                    onTimeUpdate={(event) => setAudioTime(event.currentTarget.currentTime)}
                    onPlay={() => setPlaying(true)}`
)

replaceOnce(
  'replace duplicated player buttons with timeline controls',
  `                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void playOrPause()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-3 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
                    >
                      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {playing ? copy.pauseAudio : copy.playAudio}
                    </button>
                    <button
                      type="button"
                      onClick={openWalkingRoute}
                      disabled={!selectedCoordinates}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <Route className="h-4 w-4" /> {copy.openRoute}
                    </button>
                  </div>`,
  `                  <div className="mt-1">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, audioDuration)}
                      step={1}
                      value={Math.min(audioTime, Math.max(0, audioDuration))}
                      onChange={(event) => {
                        const next = Number(event.currentTarget.value)
                        if (audioRef.current) audioRef.current.currentTime = next
                        setAudioTime(next)
                      }}
                      className="h-2 w-full cursor-pointer accent-emerald-300"
                      aria-label="Audio position"
                    />
                    <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>{formatAudioTime(audioTime)}</span>
                      <span>{formatAudioTime(audioDuration)}</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-[auto_auto_1fr] gap-2">
                    <button
                      type="button"
                      onClick={() => seekAudio(-15)}
                      className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20"
                      aria-label="15 seconden terug"
                    >
                      <RotateCcw className="h-4 w-4" /> 15
                    </button>
                    <button
                      type="button"
                      onClick={() => seekAudio(15)}
                      className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/20"
                      aria-label="15 seconden vooruit"
                    >
                      15 <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={openWalkingRoute}
                      disabled={!selectedCoordinates}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <Route className="h-4 w-4" /> {copy.openRoute}
                    </button>
                  </div>`
)

fs.writeFileSync(target, source)
console.log('Tour player safety and streamlined interface are ready.')
