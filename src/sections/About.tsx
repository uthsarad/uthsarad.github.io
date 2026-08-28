import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { profile } from '@/data/profile'
import { Reveal } from '@/components/ui/Reveal'
import { Sparkles } from '@/components/ui/Sparkles'
import { stagger } from '@/lib/motion'

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
                    <div className="w-10 h-10 rounded-lg bg-brand-violet/20 flex items-center justify-center text-brand-violet">
                      {/* Icon placeholder */}
                      <span className="text-lg">📍</span>
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
