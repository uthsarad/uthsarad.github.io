import { Hero } from './Hero'
import { Showcase } from './Showcase'
import { About } from './About'
import { Contact } from './Contact'
import { InterestLab } from '@/components/ui/InterestLab'
import { useContentEntrance } from '@/lib/scene'

export function Home({ motionEnabled }: { motionEnabled: boolean }) {
  useContentEntrance(motionEnabled)
  return (
    <>
      <Hero />
      <section id="interests" className="section section-anchor interests-section" tabIndex={-1}
        aria-labelledby="interests-title" data-scene-section data-topic="Interests" data-scene="security">
        <div className="container interests-layout">
          <div className="section-introduction" data-reveal>
            <p className="eyebrow section-index">02 / INTERESTS</p>
            <h2 id="interests-title">The questions<br />that keep me building.</h2>
            <p className="body-copy">How systems work, where they break, and what data can tell us. Explore the two areas I keep coming back to.</p>
          </div>
          <InterestLab motionEnabled={motionEnabled} />
        </div>
      </section>
      <Showcase collection="projects" motionEnabled={motionEnabled} embedded />
      <Showcase collection="coursework" motionEnabled={motionEnabled} embedded />
      <About motionEnabled={motionEnabled} embedded />
      <Contact embedded />
    </>
  )
}
