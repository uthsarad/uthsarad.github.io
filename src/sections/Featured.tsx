import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { profile } from '@/data/profile'
import { Reveal } from '@/components/ui/Reveal'
import { Sparkles } from '@/components/ui/Sparkles'
import { Magnetic } from '@/components/ui/Magnetic'

export function Featured() {
  return (
    <section className="relative py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <h2 className="section-title mb-8">Featured</h2>
        </Reveal>

        <div className="relative group">
          <Sparkles className="absolute -inset-8" density={32} color="rgba(139,92,246,0.45)" />

          <div className="glass rounded-4xl p-10 md:p-14 relative overflow-hidden">
            {/* subtle animated background beams */}
            <div className="absolute inset-0 rounded-4xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-violet/20 animate-pulse" />
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />
                </svg>
                {profile.featured.label}
              </div>

              <h3 className="text-3xl md:text-4xl font-bold mb-6">{profile.featured.title}</h3>

              <p className="text-slate-300 leading-relaxed mb-10 text-lg">
                {profile.featured.desc}
              </p>

              <div className="flex flex-wrap gap-5">
                <Magnetic>
                  <a
                    href="https://github.com/uthsarad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl font-semibold text-white shadow-lg hover:shadow-brand-violet/30 transition-all hover:-translate-y-1 inline-block"
                  >
                    View GitHub
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href={`mailto:${profile.email}`}
                    className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/10 transition-all hover:-translate-y-1 inline-block"
                  >
                    Get In Touch
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
