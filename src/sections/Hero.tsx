import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { InterestLab } from '@/components/ui/InterestLab'
import { TopicTitle } from '@/components/ui/TopicTitle'

export function Hero({ motionEnabled }: { motionEnabled: boolean }) {
  return (
    <section
      id="hero"
      className="hero section-anchor"
      tabIndex={-1}
      aria-labelledby="hero-title"
      data-scene-section
      data-topic="Portfolio"
      data-scene="home"
    >
      <div className="hero-grid" aria-hidden="true" />
      <div className="container">
        <div className="hero-layout">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">{profile.badge}</p>
            <h1 id="hero-title">
              <TopicTitle label="Portfolio" scene="home">
                <ShinyText text="Uthsara" />
                <br />
                <ShinyText text="Dahanaike." className="shiny-name" />
              </TopicTitle>
            </h1>
            <p className="hero-description">{profile.hero}</p>
            <div className="button-row">
              <a
                className="button button-primary"
                href="/projects/"
                data-topic="Projects"
                data-scene="projects"
              >
                Projects <Icon name="arrow" width="17" height="17" />
              </a>
              <a
                className="button button-secondary"
                href="/about/"
                data-topic="About"
                data-scene="about"
              >
                About me <Icon name="arrow" width="17" height="17" />
              </a>
            </div>
          </div>
          <InterestLab motionEnabled={motionEnabled} />
        </div>
      </div>
    </section>
  )
}
