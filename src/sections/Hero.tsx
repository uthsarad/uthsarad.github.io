import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '@/data/profile'
import { Reveal } from '@/components/ui/Reveal'
import { AuroraBackground } from '@/components/ui/AuroraBackground'
import { TextGenerateEffect } from '@/components/ui/TextGenerateEffect'
import { CopyEmailButton } from '@/components/ui/CopyButton'
import { GlitchText } from '@/components/ui/reactbits'
import { BlobCursor } from '@/components/ui/reactbits'

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
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-6 py-3.5 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl font-semibold text-white shadow-lg hover:shadow-brand-violet/30 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>View My LinkedIn</span>
            </a>

            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-6 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/10 hover:border-brand-violet/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-brand-violet group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>View Resume</span>
            </a>

            <CopyEmailButton
              email={profile.email}
              className="group relative px-6 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-semibold text-slate-200 hover:bg-white/10 hover:border-brand-violet/40 transition-all hover:-translate-y-1 inline-flex items-center gap-2 cursor-pointer"
            />
          </div>
        </Reveal>
      </motion.div>

      {/* Interactive Blob Cursor effect */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <BlobCursor
          blobType="circle"
          fillColor="#8b5cf6"
          trailCount={3}
          sizes={[60, 125, 75]}
          innerSizes={[20, 35, 25]}
          innerColor="rgba(255,255,255,0.8)"
          opacities={[0.3, 0.2, 0.15]}
          shadowColor="rgba(139,92,246,0.5)"
          shadowBlur={20}
          shadowOffsetX={5}
          shadowOffsetY={5}
          useFilter={true}
          fastDuration={0.1}
          slowDuration={0.6}
          zIndex={100}
        />
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
