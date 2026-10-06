export const sectionEntries = [
  { id: 'hero', label: 'Introduction', topic: 'Portfolio', scene: 'home', number: '01' },
  { id: 'interests', label: 'Interests', topic: 'Interests', scene: 'security', number: '02' },
  { id: 'projects', label: 'Projects', topic: 'Projects', scene: 'projects', number: '03' },
  { id: 'coursework', label: 'Coursework', topic: 'Coursework', scene: 'coursework', number: '04' },
  { id: 'about', label: 'About', topic: 'About', scene: 'about', number: '05' },
  { id: 'contact', label: 'Contact', topic: 'Contact', scene: 'contact', number: '06' },
] as const

export type SectionId = (typeof sectionEntries)[number]['id']
