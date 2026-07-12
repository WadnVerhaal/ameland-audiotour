import fs from 'node:fs'
import path from 'node:path'

const target = path.join(
  process.cwd(),
  'components',
  'player',
  'tour-player.tsx'
)

let source = fs.readFileSync(target, 'utf8')

const replacements = [
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
  {
    name: 'add personal guide metrics',
    before: `  const progress = \`${'${Math.min(completedKeys.length, cleanStops.length)}/${cleanStops.length}'}\`
  const storageKey = \`aat.progress.${'${token}'}\``,
    after: `  const progress = \`${'${Math.min(completedKeys.length, cleanStops.length)}/${cleanStops.length}'}\`
  const progressPercent = cleanStops.length
    ? Math.round((Math.min(completedKeys.length, cleanStops.length) / cleanStops.length) * 100)
    : 0
  const remainingStops = Math.max(0, cleanStops.length - completedKeys.length)
  const storageKey = \`aat.progress.${'${token}'}\``,
  },
  {
    name: 'add walking time after distance calculation',
    before: `  const selectedDistance = useMemo(() => {
    if (!location || !selectedCoordinates) return null
    return distanceMeters(location, selectedCoordinates)
  }, [location, selectedCoordinates])

  const selectedIsArrived = arrivedIndex === selectedIndex`,
    after: `  const selectedDistance = useMemo(() => {
    if (!location || !selectedCoordinates) return null
    return distanceMeters(location, selectedCoordinates)
  }, [location, selectedCoordinates])
  const walkingMinutes = selectedDistance === null ? null : Math.max(1, Math.ceil(selectedDistance / 75))

  const selectedIsArrived = arrivedIndex === selectedIndex`,
  },
  {
    name: 'add personal guide feedback below metrics',
    before: `            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard label={copy.distance} value={formatDistance(selectedDistance)} helper={copy.walkToStop} />
              <MetricCard label={copy.progress} value={progress} helper={selectedIsCompleted ? copy.completed : copy.selected} />
            </div>`,
    after: `            <div className="mt-4 grid grid-cols-2 gap-3">
              <MetricCard
                label={copy.distance}
                value={formatDistance(selectedDistance)}
                helper={walkingMinutes === null
                  ? copy.walkToStop
                  : language === 'nl'
                  ? \`ongeveer ${'${walkingMinutes}'} min lopen\`
                  : language === 'de'
                  ? \`ca. ${'${walkingMinutes}'} Min. zu Fuß\`
                  : \`about ${'${walkingMinutes}'} min walk\`}
              />
              <MetricCard
                label={copy.progress}
                value={progress}
                helper={language === 'nl'
                  ? \`${'${remainingStops}'} verhalen te gaan\`
                  : language === 'de'
                  ? \`${'${remainingStops}'} Geschichten übrig\`
                  : \`${'${remainingStops}'} stories remaining\`}
              />
            </div>

            <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3">
              <div className="flex items-center justify-between gap-3 text-xs font-black text-slate-300">
                <span>{language === 'nl' ? 'Jouw ontdekkingstocht' : language === 'de' ? 'Deine Entdeckungstour' : 'Your discovery walk'}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-300 transition-all duration-500" style={{ width: \`${'${progressPercent}'}%\` }} />
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-emerald-100">
                {selectedIsArrived
                  ? language === 'nl'
                    ? 'Je bent er. Neem rustig de tijd om rond te kijken en start het verhaal.'
                    : language === 'de'
                    ? 'Du bist da. Schau dich in Ruhe um und starte die Geschichte.'
                    : 'You have arrived. Take a moment to look around and start the story.'
                  : selectedDistance !== null && selectedDistance <= 120
                  ? language === 'nl'
                    ? 'Je bent bijna bij de volgende stop. Kijk alvast goed om je heen.'
                    : language === 'de'
                    ? 'Du bist fast am nächsten Stopp. Schau dich schon einmal gut um.'
                    : 'You are almost at the next stop. Start looking around.'
                  : language === 'nl'
                  ? 'Volg de route naar het volgende verhaal. Je voortgang wordt automatisch bewaard.'
                  : language === 'de'
                  ? 'Folge der Route zur nächsten Geschichte. Dein Fortschritt wird automatisch gespeichert.'
                  : 'Follow the route to the next story. Your progress is saved automatically.'}
              </p>
            </div>`,
  },
]

for (const replacement of replacements) {
  if (!source.includes(replacement.before)) {
    if (!replacement.after || source.includes(replacement.after)) continue
    throw new Error(`Player patch failed: ${replacement.name}`)
  }
  source = source.replace(replacement.before, replacement.after)
}

fs.writeFileSync(target, source)
console.log('Tour player arrival logic and personal guidance are ready.')
