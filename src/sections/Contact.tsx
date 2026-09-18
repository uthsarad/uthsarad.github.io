import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { CopyEmailButton } from '@/components/ui/CopyButton'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { TopicTitle } from '@/components/ui/TopicTitle'

export function Contact() {
  return (
    <section
      id="contact"
      className="section section-anchor contact-section"
      tabIndex={-1}
      aria-labelledby="contact-title"
      data-scene-section
      data-topic="Contact"
      data-scene="contact"
    >
      <div className="container">
        <h1 id="contact-title">
          <TopicTitle label="Contact" scene="contact">
            Get in <ShinyText text="touch." />
          </TopicTitle>
        </h1>
        <p className="contact-description">
          Open to internships and collaborations.
        </p>
        <a className="email-link" href={'mailto:' + profile.email}>
          {profile.email}
          <Icon name="arrow" />
        </a>
        <div className="button-row">
          <a className="button button-primary" href={'mailto:' + profile.email}>
            Email me <Icon name="mail" width="18" height="18" />
          </a>
          <CopyEmailButton email={profile.email} />
        </div>
        <div className="social-links">
          <a href={profile.links.github} target="_blank" rel="noreferrer">
            GitHub <Icon name="arrow" width="17" height="17" />
          </a>
          <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn <Icon name="arrow" width="17" height="17" />
          </a>
        </div>
      </div>
    </section>
  )
}
