import { profile } from '@/data/profile'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/5 bg-slate-950/80 backdrop-blur supports-backdrop-blur:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-violet transition-colors"
            >
              GitHub
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-violet transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-violet transition-colors"
            >
              View Resume
            </a>
            <a
              href={`mailto:${profile.email}`}
              className="hover:text-brand-violet transition-colors"
            >
              Email
            </a>
          </div>
          <p className="text-sm text-slate-500 text-center">
            Built with curiosity and coffee. © {currentYear} Uthsara Dahanaike.
          </p>
        </div>
      </div>
    </footer>
  )
}
