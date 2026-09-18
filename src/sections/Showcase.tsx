import { useState } from 'react'
import { projects, coursework, type Project } from '@/data/projects'
import { projectDetails } from '@/data/project-details'
import { Icon } from '@/components/ui/Icon'
import { ProjectArtwork } from '@/components/ui/ProjectArtwork'
import { SpotlightCard } from '@/components/ui/reactbits/SpotlightCard'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { TopicTitle } from '@/components/ui/TopicTitle'

const projectFilters = [
  { id: 'all', label: 'All projects', matches: (_project: Project) => true },
  {
    id: 'systems',
    label: 'Systems',
    matches: (p: Project) => p.tags?.includes('systems'),
  },
  {
    id: 'tools',
    label: 'Tools & data',
    matches: (p: Project) => p.tags?.includes('tools'),
  },
]
const courseworkFilters = [
  { id: 'all', label: 'All coursework', matches: (_project: Project) => true },
  {
    id: 'security',
    label: 'Security',
    matches: (p: Project) => p.tags?.includes('security'),
  },
  {
    id: 'ai',
    label: 'Data + AI',
    matches: (p: Project) => p.tags?.includes('ai'),
  },
  {
    id: 'systems',
    label: 'Systems',
    matches: (p: Project) => p.tags?.includes('systems'),
  },
]

export function Showcase({
  collection,
  motionEnabled,
}: {
  collection: 'projects' | 'coursework'
  motionEnabled: boolean
}) {
  const academic = collection === 'coursework'
  const allProjects = academic ? coursework : projects
  const filters = academic ? courseworkFilters : projectFilters
  const [selected, setSelected] = useState('all')
  const filter = filters.find((item) => item.id === selected) ?? filters[0]
  const visible = allProjects.filter(filter.matches)

  return (
    <section
      id={collection}
      className="section section-anchor collection-section"
      tabIndex={-1}
      aria-labelledby="work-title"
      data-scene-section
      data-topic={academic ? 'Coursework' : 'Projects'}
      data-scene={collection}
    >
      <div className="container">
        <div className="collection-heading" data-reveal>
          <div>
            <h1 id="work-title">
              <TopicTitle
                label={academic ? 'Coursework' : 'Projects'}
                scene={collection}
              >
                <ShinyText text={academic ? 'Coursework.' : 'Projects.'} />
              </TopicTitle>
            </h1>
          </div>
          <p className="page-description">
            {academic
              ? 'Security, data science + AI, and distributed systems.'
              : 'Linux, desktop apps, and geospatial tools.'}
          </p>
        </div>
        <div className="work-toolbar">
          <div
            className="filters"
            role="group"
            aria-label={academic ? 'Filter coursework' : 'Filter projects'}
          >
            {filters.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={selected === item.id}
                aria-controls="project-grid"
                data-topic={
                  item.id === 'all'
                    ? academic
                      ? 'Coursework'
                      : 'Projects'
                    : item.label
                }
                data-scene={
                  item.id === 'ai' || item.id === 'tools'
                    ? 'data'
                    : item.id === 'security'
                      ? 'security'
                      : collection
                }
                onClick={() => setSelected(item.id)}
              >
                {item.label}
                <span>{allProjects.filter(item.matches).length}</span>
              </button>
            ))}
          </div>
          <p className="result-count" role="status" aria-live="polite">
            {visible.length}{' '}
            {academic
              ? visible.length === 1
                ? 'study'
                : 'studies'
              : visible.length === 1
                ? 'project'
                : 'projects'}
            <span className="sr-only"> shown, {filter.label}</span>
          </p>
        </div>
        <div className="project-grid" id="project-grid">
          {visible.map((project) => {
            const detail = projectDetails[project.id]
            return (
              <SpotlightCard
                key={project.id}
                enabled={motionEnabled}
                className="project-card"
              >
                <article
                  aria-labelledby={'title-' + project.id}
                  data-reveal
                  data-scene-section
                  data-topic={project.title}
                  data-scene={
                    project.tags?.includes('ai') ||
                    project.tags?.includes('tools')
                      ? 'data'
                      : project.tags?.includes('security')
                        ? 'security'
                        : collection
                  }
                >
                  <ProjectArtwork id={project.id} />
                  <div className="project-body">
                    <div className="project-meta">
                      <span
                        className={
                          'project-status ' +
                          (project.status === 'Active development'
                            ? 'is-active'
                            : '')
                        }
                      >
                        {project.status === 'Active development'
                          ? 'In progress'
                          : project.status}
                      </span>
                    </div>
                    <h3 id={'title-' + project.id}>
                      <TopicTitle
                        label={project.title}
                        scene={
                          project.tags?.includes('ai') ||
                          project.tags?.includes('tools')
                            ? 'data'
                            : project.tags?.includes('security')
                              ? 'security'
                              : collection
                        }
                      />
                    </h3>
                    <p className="project-summary">{detail}</p>
                    <ul className="tech-tags" aria-label="Technologies">
                      {project.stack.split(' · ').map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                    <div className="project-links">
                      {project.url ? (
                        <a
                          className="text-link"
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={'View ' + project.title + ' repository'}
                        >
                          View repository{' '}
                          <Icon name="arrow" width="16" height="16" />
                        </a>
                      ) : (
                        <span className="private-note">
                          {project.kind === 'Coursework'
                            ? 'Academic project'
                            : 'Private repository'}
                        </span>
                      )}
                    </div>
                    <details className="project-details">
                      <summary>
                        Details <Icon name="plus" width="16" height="16" />
                        <span className="sr-only">: {project.title}</span>
                      </summary>
                      <div>
                        <p>{project.desc}</p>
                      </div>
                    </details>
                  </div>
                </article>
              </SpotlightCard>
            )
          })}
        </div>
        {!academic && (
          <a
            className="all-work-link text-link"
            href="https://github.com/uthsarad?tab=repositories"
            target="_blank"
            rel="noreferrer"
          >
            More on GitHub <Icon name="arrow" width="16" height="16" />
          </a>
        )}
      </div>
    </section>
  )
}
