export type Project = {
  id: string
  emoji: string
  title: string
  desc: string
  kind: string
  stack: string
  status: string
  url: string
}

// Keep this list limited to original public repositories on github.com/uthsarad.
export const projects: Project[] = [
  {
    id: 'neos',
    emoji: '🐧',
    title: 'NeOS',
    desc: 'A curated, snapshot-based Arch Linux desktop distribution focused on predictable behavior, a polished KDE Plasma 6 experience, hardware support, and secure-by-default system configuration.',
    kind: 'Personal Project',
    stack: 'Arch Linux · Shell · CI',
    status: 'Active development',
    url: 'https://github.com/uthsarad/NeOS',
  },
  {
    id: 'ferrumcalc',
    emoji: '🧮',
    title: 'FerrumCalc',
    desc: 'A native desktop calculator with standard, scientific, programmer, and graph modes, full expression parsing, base-prefixed literals, keyboard support, history, and persistent preferences.',
    kind: 'Personal Project',
    stack: 'Rust · egui',
    status: 'Complete',
    url: 'https://github.com/uthsarad/FerrumCalc',
  },
  {
    id: 'megis',
    emoji: '📍',
    title: 'mEgis',
    desc: 'A Python toolkit for vehicle tracking and geofence analysis. It ingests GPS logs, detects enter and exit events, computes speed and trip segments, persists data in SQLite, and renders interactive Folium maps with playback.',
    kind: 'Personal Project',
    stack: 'Python · GeoPandas · Shapely',
    status: 'Active development',
    url: 'https://github.com/uthsarad/mEgis',
  },
  {
    id: 'hsfix',
    emoji: '🩹',
    title: 'hsfix',
    desc: 'A small CLI that turns working-tree changes into named, reviewable Git patches, tracks whether each patch is applied, and supports applying, reverting, listing, and drift-checking patches.',
    kind: 'Developer Tool',
    stack: 'Python · Git',
    status: 'Usable',
    url: 'https://github.com/uthsarad/hsfix',
  },
]
