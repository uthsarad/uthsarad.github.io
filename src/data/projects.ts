export type Project = {
  id: string
  emoji: string
  title: string
  desc: string
  kind: string
  stack: string
  status: string
}

// Migrated from the original site. Add new projects here; layout stays unchanged.
export const projects: Project[] = [
  {
    id: 'geospine',
    emoji: '🗺️',
    title: 'GeoSpine',
    desc: 'A geospatial web app with a 7-stage GIS pipeline — Import → Align → Segment → Boundary Trace → Auto-Georeference → Assembly Canvas → Export. Built with React, Flask, OpenCV, Leaflet.js, and GeoPandas, with a homography-based image overlay and a Web Worker flood-fill for segment preview.',
    kind: 'Personal Project',
    stack: 'React · Flask · OpenCV',
    status: 'In progress',
  },
  {
    id: 'neos',
    emoji: '🐧',
    title: 'NeOS',
    desc: 'A custom Arch Linux–based operating system build, exploring low-level system configuration and Linux internals from the ground up.',
    kind: 'Personal Project',
    stack: 'Arch Linux',
    status: 'Ongoing',
  },
  {
    id: 'forensics',
    emoji: '🔍',
    title: 'Digital Forensics Investigation',
    desc: 'A ransomware investigation project for the CSG2305 Digital Forensics module, working through evidence collection, artifact analysis, and incident reconstruction.',
    kind: 'Coursework',
    stack: 'Ransomware Case Study',
    status: 'CSG2305',
  },
  {
    id: 'osteoporosis',
    emoji: '🧠',
    title: 'AI Model Evaluation — Osteoporosis Detection',
    desc: 'A group notebook project for CSG2341 (AI) evaluating MLP and CNN models for osteoporosis detection, covering data preprocessing, model comparison, and performance evaluation.',
    kind: 'Coursework',
    stack: 'MLP · CNN',
    status: 'CSG2341',
  },
]
