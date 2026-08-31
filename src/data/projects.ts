export type Project = {
  id: string
  emoji: string
  title: string
  desc: string
  kind: string
  stack: string
  status: string
  url?: string
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
    id: 'museek',
    emoji: '🎵',
    title: 'Museek',
    desc: 'A private, lightweight music player built around mpv for local music playback.',
    kind: 'Private Project',
    stack: 'mpv · Music playback',
    status: 'Private',
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

export const coursework: Project[] = [
  {
    id: 'forensics',
    emoji: '🔍',
    title: 'Digital Forensics Investigation',
    desc: 'A ransomware investigation project covering evidence collection, artifact analysis, and incident reconstruction.',
    kind: 'Coursework',
    stack: 'Digital forensics',
    status: 'CSG2305',
  },
  {
    id: 'osteoporosis',
    emoji: '🧠',
    title: 'AI Model Evaluation — Osteoporosis Detection',
    desc: 'A group notebook project evaluating MLP and CNN models for osteoporosis detection, including data preprocessing, model comparison, and performance evaluation.',
    kind: 'Coursework',
    stack: 'MLP · CNN',
    status: 'CSG2341',
  },
  {
    id: 'dsrpc',
    emoji: '🏦',
    title: 'Banking RPC System',
    desc: 'A three-tier banking transfer system with separate client, application-server, and database-server layers, including validation, fee calculation, SQLite transactions, and end-to-end tests.',
    kind: 'Coursework',
    stack: 'Python · Pyro5 · SQLite',
    status: 'Distributed systems',
    url: 'https://github.com/uthsarad/dsrpc',
  },
]
