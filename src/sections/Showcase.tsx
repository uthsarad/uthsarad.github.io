import { useState } from 'react'
import { projects, coursework, type Project, type ProjectLifecycle } from '@/data/projects'
import { projectDetails } from '@/data/project-details'
import { Icon } from '@/components/ui/Icon'
import { ProjectArtwork } from '@/components/ui/ProjectArtwork'
import { SpotlightCard } from '@/components/ui/reactbits/SpotlightCard'
import { ShinyText } from '@/components/ui/reactbits/ShinyText'
import { TopicTitle } from '@/components/ui/TopicTitle'
import { useContentEntrance } from '@/lib/scene'

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

const lifecycleLabels: Record<ProjectLifecycle, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  unknown: 'Status not confirmed',
}
const lifecycleFilters: { id: 'all' | ProjectLifecycle; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'ongoing', label: lifecycleLabels.ongoing },
  { id: 'completed', label: lifecycleLabels.completed },
  { id: 'unknown', label: lifecycleLabels.unknown },
]

export function Showcase({
  collection,
  motionEnabled,
  embedded = false,
}: {
  collection: 'projects' | 'coursework'
  motionEnabled: boolean
  embedded?: boolean
}) {
  useContentEntrance(motionEnabled && !embedded)
  const academic = collection === 'coursework'
  const allProjects = academic ? coursework : projects
  const filters = academic ? courseworkFilters : projectFilters
  const [selected, setSelected] = useState('all')
  const [selectedLifecycle, setSelectedLifecycle] = useState<'all' | ProjectLifecycle>('all')
  const Heading = embedded ? 'h2' : 'h1'
  const titleId = `${collection}-title`
  const gridId = `${collection}-grid`
  const filter = filters.find((item) => item.id === selected) ?? filters[0]
  const lifecycleFilter = lifecycleFilters.find((item) => item.id === selectedLifecycle)!
  const visible = allProjects.filter((project) =>
    filter.matches(project) &&
    (selectedLifecycle === 'all' || project.lifecycle === selectedLifecycle),
  )

  return (
    <section
      id={collection}
      className="section section-anchor collection-section"
      tabIndex={-1}
      aria-labelledby={titleId}
      data-scene-section
      data-topic={academic ? 'Coursework' : 'Projects'}
      data-scene={collection}
    >
      <div className="container">
        <div className="collection-heading">
          <div>
            {embedded && (
              <p className="eyebrow section-index">{academic ? '04 / COURSEWORK' : '03 / PROJECTS'}</p>
            )}
            <Heading id={titleId}>
              <TopicTitle
                label={academic ? 'Coursework' : 'Projects'}
                scene={collection}
              >
                <ShinyText text={academic ? 'Coursework.' : 'Projects.'} />
              </TopicTitle>
            </Heading>
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
            aria-label={academic ? 'Filter coursework by category' : 'Filter projects by category'}
          >
            {filters.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={selected === item.id}
                aria-controls={gridId}
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
          <label className="status-filter">
            <span>{academic ? 'Filter coursework by status' : 'Filter projects by status'}</span>
            <select
              value={selectedLifecycle}
              aria-controls={gridId}
              onChange={(event) => setSelectedLifecycle(event.target.value as 'all' | ProjectLifecycle)}
            >
              {lifecycleFilters.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <p className="result-count" role="status" aria-live="polite">
            {visible.length}{' '}
            {academic
              ? visible.length === 1
                ? 'study'
                : 'studies'
              : visible.length === 1
                ? 'project'
                : 'projects'}
            <span className="sr-only"> shown, {filter.label}, {lifecycleFilter.label}</span>
          </p>
        </div>
        <div className="project-grid" id={gridId}>
          {visible.length === 0 && (
            <p className="collection-empty-state">
              No {academic ? 'coursework' : 'projects'} match {filter.label} and {lifecycleFilter.label}.
              Try another category or lifecycle status.
            </p>
          )}
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
                        className={`project-status project-lifecycle is-${project.lifecycle}${project.lifecycle === 'ongoing' ? ' is-active' : ''}`}
                      >
                        {lifecycleLabels[project.lifecycle]}
                      </span>
                      {project.lifecycle === 'unknown' && (
                        <span className="project-status">{project.status}</span>
                      )}
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
