import { Icon } from '@/components/ui/Icon'
import { ProjectArtwork } from '@/components/ui/ProjectArtwork'
import { TopicTitle } from '@/components/ui/TopicTitle'

export function WorkGateway() {
  return (
    <section
      className="section"
      id="explore"
      aria-labelledby="explore-title"
      data-scene-section
      data-topic="My work"
      data-scene="projects"
    >
      <div className="container">
        <h2 id="explore-title" className="gateway-heading">
          <TopicTitle label="My work" scene="projects" />
        </h2>
        <div className="work-gateways">
          <a
            className="gateway-card"
            href="/projects/"
            data-topic="Projects"
            data-scene="projects"
            data-reveal
          >
            <ProjectArtwork id="neos" />
            <div className="gateway-copy">
              <h3>
                Projects <Icon name="arrow" />
              </h3>
              <p>Linux, desktop apps, and geospatial tools.</p>
            </div>
          </a>
          <a
            className="gateway-card"
            href="/coursework/"
            data-topic="Coursework"
            data-scene="coursework"
            data-reveal
          >
            <ProjectArtwork id="osteoporosis" />
            <div className="gateway-copy">
              <h3>
                Coursework <Icon name="arrow" />
              </h3>
              <p>Security, data science + AI, and systems.</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
