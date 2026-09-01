import { ScrollProgress } from './components/ui/ScrollProgress'
import { SidebarNav } from './components/ui/SidebarNav'
import { MobileNav } from './components/ui/MobileNav'
import { BackToTop } from './components/ui/BackToTop'
import { Footer } from './components/ui/Footer'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Showcase } from './sections/Showcase'
import { Featured } from './sections/Featured'
import { Contact } from './sections/Contact'

export default function App() {
  return (
    <main className="relative min-h-screen bg-brand-bg text-slate-100 overflow-x-hidden pb-16 lg:pb-0">
      <ScrollProgress />
      <SidebarNav />
      <MobileNav />
      <BackToTop />

      <section id="hero">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="showcase">
        <Showcase />
      </section>
      <section id="featured">
        <Featured />
      </section>
      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </main>
  )
}
