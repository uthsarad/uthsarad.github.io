// Minimal background beams effect for Featured section.
import { cn } from '@/lib/utils'

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 rounded-4xl', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 via-transparent to-brand-violet/20 animate-pulse" />
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
    </div>
  )
}
