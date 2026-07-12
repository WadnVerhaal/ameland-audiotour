import fs from 'node:fs'
import path from 'node:path'

const playerEntry = path.join(process.cwd(), 'components', 'player', 'tour-player.tsx')
const experience = path.join(process.cwd(), 'components', 'player', 'tour-player-experience.tsx')
const mapTarget = path.join(process.cwd(), 'components', 'player', 'player-map-v4.tsx')

if (!fs.existsSync(playerEntry) || !fs.existsSync(experience)) {
  throw new Error('Player validation failed: the start-first player files are missing.')
}

const playerSource = fs.readFileSync(playerEntry, 'utf8')
if (!playerSource.includes("./tour-player-experience")) {
  throw new Error('Player validation failed: tour-player.tsx is not connected to the new experience.')
}

let mapSource = fs.readFileSync(mapTarget, 'utf8')
const repeatedTitle = `        <p className="mt-1 truncate text-sm font-black">{selectedIndex + 1}. {selectedTitle}</p>\n`
if (mapSource.includes(repeatedTitle)) {
  mapSource = mapSource.replace(repeatedTitle, '')
  fs.writeFileSync(mapTarget, mapSource)
}

console.log('Start-first tour player and focused navigation are ready.')
