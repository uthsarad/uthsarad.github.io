import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { TopicTitle } from '@/components/ui/TopicTitle'

const skills = [
  {
    name: 'Security & investigation',
    scene: 'security',
    icon: 'shield',
    tools: ['Ghidra', 'Digital forensics', 'Binary analysis'],
  },
  {
    name: 'Systems & tooling',
    scene: 'projects',
    icon: 'code',
    tools: ['Linux / Arch', 'Python', 'Rust', 'Git'],
  },
  {
    name: 'Data Science + AI',
    scene: 'data',
    icon: 'globe',
    tools: ['Python', 'GeoPandas', 'MLP / CNN', 'OpenCV'],
  },
] as const

export function About() {
  return (
    <section
      id="about"
      className="section section-anchor about-section"
      tabIndex={-1}
      aria-labelledby="about-title"
      data-scene-section
      data-topic="About"
      data-scene="about"
    >
      <div className="container">
        <div className="about-layout">
          <div>
            <h1 id="about-title">
              <TopicTitle label="About" scene="about">
                About <ShinyText text="me." />
              </TopicTitle>
            </h1>
            <p className="body-copy">{profile.bio}</p>
            <a
              className="text-link"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn <Icon name="arrow" width="16" height="16" />
            </a>
          </div>
          <div className="background-panel" data-reveal>
            <div className="panel-label">
              <span>BACKGROUND</span>
              <Icon name="code" />
            </div>
            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot" />
                <p className="eyebrow">MAY 2026 TO PRESENT</p>
                <h3>IT Intern</h3>
                <p>Sala Enterprises</p>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot" />
                <p className="eyebrow">EDUCATION</p>
                <h3>Computer Science</h3>
                <p>Edith Cowan University</p>
                <span className="muted">BSc · Cybersecurity major</span>
              </div>
            </div>
            <div className="background-location">
              <Icon name="pin" width="17" height="17" />
              Based in Colombo, Sri Lanka
            </div>
          </div>
        </div>
        <div className="skill-grid">
          {skills.map((skill) => (
            <div
              className="skill-card"
              key={skill.name}
              data-reveal
              data-scene-section
              data-topic={skill.name}
              data-scene={skill.scene}
            >
              <div className="skill-icon">
                <Icon name={skill.icon} />
              </div>
              <h3>
                <TopicTitle label={skill.name} scene={skill.scene} />
              </h3>
              <ul className="tech-tags">
                {skill.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
