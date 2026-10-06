import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { ResumeButton } from '@/components/ui/ResumeButton'
import { TopicTitle } from '@/components/ui/TopicTitle'

export function Hero() {
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
          <div className="hero-copy">
            <p className="eyebrow section-index">01 / INTRODUCTION</p>
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
                href="/#projects"
              >
                Projects <Icon name="arrow" width="17" height="17" />
              </a>
              <ResumeButton id="hero-resume" />
            </div>
          </div>
          <div className="hero-aside">
            <p className="eyebrow">COLOMBO, SRI LANKA</p>
            <p>Curiosity.<br />Investigation.<br /><span>Building.</span></p>
            <a className="text-link scroll-cue" href="/#interests">
              Scroll to explore <Icon name="down" width="18" height="18" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
