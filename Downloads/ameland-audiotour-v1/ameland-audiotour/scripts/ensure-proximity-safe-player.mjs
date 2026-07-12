import fs from 'node:fs'
import path from 'node:path'

const target = path.join(process.cwd(), 'components', 'player', 'tour-player.tsx')

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
]

for (const replacement of replacements) {
  if (!source.includes(replacement.before)) {
    if (!replacement.after || source.includes(replacement.after)) continue
    throw new Error(`Player patch failed: ${replacement.name}`)
  }
  source = source.replace(replacement.before, replacement.after)
}

if (!source.includes("import { TourExperiencePanel } from './tour-experience-panel'")) {
  const importAnchor = "import Image from 'next/image'\n"
  if (!source.includes(importAnchor)) throw new Error('Player patch failed: experience import anchor')
  source = source.replace(
    importAnchor,
    `${importAnchor}import { TourExperiencePanel } from './tour-experience-panel'\n`
  )
}

if (!source.includes('<TourExperiencePanel')) {
  const sectionAnchor =
    '        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">'

  if (!source.includes(sectionAnchor)) throw new Error('Player patch failed: experience panel anchor')

  const panel = `        <TourExperiencePanel
          token={token}
          tourId={String(tour.id || '')}
          language={language}
          currentIndex={selectedIndex}
          totalStops={cleanStops.length}
          completedStops={Math.min(completedKeys.length, cleanStops.length)}
          distanceMeters={selectedDistance}
          arrived={selectedIsArrived}
          selectedCompleted={selectedIsCompleted}
          title={selectedTitle}
          imageUrls={[
            stringValue(selectedStop, ['image_url']),
            stringValue(tour, ['hero_image_url']),
          ].filter(Boolean)}
        />

`

  source = source.replace(sectionAnchor, `${panel}${sectionAnchor}`)
}

fs.writeFileSync(target, source)
console.log('Tour player arrival logic and premium guide layer are ready.')
