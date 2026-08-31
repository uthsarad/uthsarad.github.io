import { projects } from '@/data/projects'
import { Reveal } from '@/components/ui/Reveal'
import { Card3D } from '@/components/ui/Card3D'
import { Spotlight } from '@/components/ui/Spotlight'

export function Showcase() {
  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="section-title mb-16">Showcase</h2>
        </Reveal>

        <div className="space-y-12">
          {projects.map((project) => (
            <Spotlight
              key={project.id}
              className="block group"
              intensity={0.35}
              radius={360}
            >
              <Card3D max={6} className="block">
                <div className="glass rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-violet/10 transition-all duration-500">
                  <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-violet/20 flex items-center justify-center text-4xl shadow-lg">
                        {project.emoji}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-violet transition-colors">
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet rounded"
                        >
                          {project.title}
                        </a>
                      </h3>
                      <p className="text-slate-400 leading-relaxed mb-6">
                        {project.desc}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <polygon points="10,2 15,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 5,8" />
                          </svg>
                          {project.kind}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {project.stack}
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {project.status}
                        </span>
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-xs font-medium text-brand-violet hover:bg-brand-violet/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
                        >
                          View repository
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Card3D>
            </Spotlight>
          ))}
        </div>
      </div>
    </section>
  )
}
