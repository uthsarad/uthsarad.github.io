import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '@/data/profile'
import { Reveal } from '@/components/ui/Reveal'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { TextGenerateEffect } from '@/components/ui/TextGenerateEffect'

// Signature interaction: scroll-scrubbed hero with parallax + scale.
export function Hero() {
  const { scrollYProgress } = useScroll()

  // Parallax layers for the aurora background.
  const auroraY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const auroraScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.8])

  // Gradient text scale + parallax for name.
  const nameY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%'])
  const nameScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      <motion.div className="absolute inset-0" style={{ y: auroraY, scale: auroraScale }}>
        <AuroraBackground className="absolute inset-0" />
      </motion.div>

      <motion.div
        style={{ y: nameY, scale: nameScale }}
        className="relative z-10 w-full max-w-4xl mx-auto text-center"
      >
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-300">{profile.badge}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 leading-tight">
            Hi, I'm{' '}
            <span className="text-gradient">
              <TextGenerateEffect text={profile.name} speed={28} />
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {profile.hero}
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.linkedin.com/in/uthsara-dahanaike"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl font-semibold text-white shadow-lg hover:shadow-brand-violet/30 transition-all hover:-translate-y-1"
            >
              <span className="relative z-10">View My LinkedIn</span>
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="group relative px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/10 transition-all hover:-translate-y-1"
            >
              <span className="relative z-10">Send an email</span>
            </a>
          </div>
        </Reveal>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
