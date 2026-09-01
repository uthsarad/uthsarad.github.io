import { motion } from 'framer-motion'
import { profile } from '@/data/profile'
import { Reveal } from '@/components/ui/Reveal'
import { Sparkles } from '@/components/ui/Sparkles'
import { stagger } from '@/lib/motion'

function renderInfoIcon(type?: string) {
  switch (type) {
    case 'user':
      return (
        <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'location':
      return (
        <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'education':
      return (
        <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    case 'work':
    default:
      return (
        <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
  }
}

export function About() {
  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <h2 className="section-title mb-16">About Me</h2>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bio Card */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-2"
          >
            <div className="glass rounded-3xl p-8 md:p-10">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  UD
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">{profile.name}</h3>
                  <span className="text-sm text-slate-400">{profile.role}</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-8 text-lg">
                {profile.bio}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {profile.info.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-brand-violet/20 flex items-center justify-center text-brand-violet flex-shrink-0">
                      {renderInfoIcon(item.type)}
                    </div>
                    <div>
                      <div className="text-xs uppercase text-slate-500 mb-1">{item.label}</div>
                      <div className="text-sm font-medium text-slate-200">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tech Stack Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass rounded-3xl p-8 h-full relative overflow-hidden group">
              <Sparkles className="absolute -inset-4" density={24} color="rgba(168,85,247,0.4)" />

              <h4 className="text-xl font-bold mb-6 relative z-10">Tech Stack</h4>
              <div className="flex flex-wrap gap-3 relative z-10">
                {profile.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-sm font-medium text-slate-300 hover:bg-brand-violet/20 hover:border-brand-violet/40 transition-all cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
