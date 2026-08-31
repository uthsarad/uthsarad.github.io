import { projects, coursework, type Project } from '@/data/projects'
import { Reveal } from '@/components/ui/Reveal'
import { Card3D } from '@/components/ui/Card3D'
import { Spotlight } from '@/components/ui/Spotlight'

type ProjectListProps = {
  items: Project[]
}

function ProjectList({ items }: ProjectListProps) {
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
            <div className="glass rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-brand-violet/10 transition-all duration-500">
              <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue/20 to-brand-violet/20 flex items-center justify-center text-4xl shadow-lg">
                    {project.emoji}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-violet transition-colors">
                    {project.url ? (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet rounded"
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

                  <div className="flex flex-wrap gap-3">
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-xs font-medium text-brand-violet hover:bg-brand-violet/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet"
                      >
                        View repository
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
  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="section-title mb-16">Showcase</h2>
        </Reveal>

        <ProjectList items={projects} />

        <Reveal>
          <h2 className="section-title mt-24 mb-16">Coursework</h2>
        </Reveal>
        <ProjectList items={coursework} />
      </div>
    </section>
  )
}
