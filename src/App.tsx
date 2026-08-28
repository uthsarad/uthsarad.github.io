import { ScrollProgress } from './components/ui/ScrollProgress'
import { SidebarNav } from './components/ui/SidebarNav'
import { Footer } from './components/ui/Footer'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Showcase } from './sections/Showcase'
import { Featured } from './sections/Featured'
import { Contact } from './sections/Contact'

export default function App() {
  return (
    <main className="relative min-h-screen bg-brand-bg text-slate-100 overflow-x-hidden">
      <ScrollProgress />
      <SidebarNav />

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
