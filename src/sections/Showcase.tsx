import { useState } from 'react'
import { projects, coursework, type Project } from '@/data/projects'
import { Reveal } from '@/components/ui/Reveal'
import { Card3D } from '@/components/ui/Card3D'
import { Spotlight } from '@/components/ui/Spotlight'
import { motion, AnimatePresence } from 'framer-motion'

type FilterKey = 'all' | 'projects' | 'systems' | 'tools' | 'coursework'

type ProjectListProps = {
  items: Project[]
}

function ProjectList({ items }: ProjectListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No projects match this filter.
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {items.map((project) => (
        <Spotlight
          key={project.id}
          className="block group"
          intensity={0.35}
          radius={360}
        >
          <Card3D max={6} className="block">
            <div className="glass rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-700/40 transition-all duration-500">
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-950/70 to-blue-900/50 border border-blue-800/30 flex items-center justify-center text-4xl shadow-lg shadow-blue-950/40">
                    {project.emoji}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        {project.title}
                      </a>
                    ) : (
                      project.title
                    )}
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {project.desc}
                  </p>

                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                      {project.kind}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                      {project.stack}
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                      {project.status}
                    </span>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/40 border border-blue-900/40 text-xs font-medium text-blue-400 hover:bg-blue-900/40 hover:border-blue-700/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span>View repository</span>
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card3D>
        </Spotlight>
      ))}
    </div>
  )
}

export function Showcase() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const allItems = [...projects, ...coursework]

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: allItems.length },
    { key: 'projects', label: 'Projects', count: projects.length },
    {
      key: 'systems',
      label: 'Systems & OS',
      count: allItems.filter((p) => p.tags?.includes('systems')).length,
    },
    {
      key: 'tools',
      label: 'Tools & Python',
      count: allItems.filter(
        (p) => p.tags?.includes('tools') || p.tags?.includes('python')
      ).length,
    },
    { key: 'coursework', label: 'Coursework', count: coursework.length },
  ]

  const filteredItems = (() => {
    switch (filter) {
      case 'projects':
        return projects
      case 'coursework':
        return coursework
      case 'systems':
        return allItems.filter((p) => p.tags?.includes('systems'))
      case 'tools':
        return allItems.filter(
          (p) => p.tags?.includes('tools') || p.tags?.includes('python')
        )
      case 'all':
      default:
        return null // render separate sections for 'all'
    }
  })()

  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="section-title mb-3">Showcase</h2>
              <p className="text-slate-400 max-w-xl">
                Open-source systems, engineering tools, and academic security investigations.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filters.map(({ key, label, count }) => {
                const isActive = filter === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`relative px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-950/60'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          {filter === 'all' ? (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectList items={projects} />

              <Reveal>
                <h3 className="section-title mt-24 mb-12 text-2xl md:text-3xl">
                  Coursework
                </h3>
              </Reveal>
              <ProjectList items={coursework} />
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectList items={filteredItems || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
