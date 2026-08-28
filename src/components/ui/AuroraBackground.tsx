import { cn } from '@/lib/utils'

// Soft animated aurora glow blobs. Purely decorative.
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
      aria-hidden
    >
      <div className="absolute -top-40 -left-[10%] h-[520px] w-[520px] animate-aurora rounded-full bg-brand-blue/25 blur-[120px]" />
      <div className="absolute top-1/3 -right-[10%] h-[460px] w-[460px] animate-aurora rounded-full bg-brand-purple/20 blur-[120px] [animation-delay:-4s]" />
      <div className="absolute bottom-[-20%] left-1/3 h-[520px] w-[520px] animate-aurora rounded-full bg-brand-violet/20 blur-[130px] [animation-delay:-8s]" />
    </div>
  )
}
