import { Component, lazy, memo, Suspense, type ReactNode } from 'react'
import { pages, type PageId } from './pages'

const loadHome = () => import('../sections/Home')
const loadShowcase = () => import('../sections/Showcase')
const loadAbout = () => import('../sections/About')
const loadContact = () => import('../sections/Contact')
const loaders = {
  home: loadHome,
  projects: loadShowcase,
  coursework: loadShowcase,
  about: loadAbout,
  contact: loadContact,
}
export const loadPage = (page: PageId) => loaders[page]()
const Home = lazy(() => loadHome().then((m) => ({ default: m.Home })))
const Showcase = lazy(() =>
  loadShowcase().then((m) => ({ default: m.Showcase })),
)
const About = lazy(() => loadAbout().then((m) => ({ default: m.About })))
const Contact = lazy(() => loadContact().then((m) => ({ default: m.Contact })))

class PageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <section className="section container" role="alert">
        <h1>This page needs a refresh.</h1>
        <p>The page could not load. Please try again.</p>
        <button
          className="button button-primary"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </section>
    ) : (
      this.props.children
    )
  }
}

// Topic previews and pinning must not rerender the page's cards and graphics.
export const PageContent = memo(function PageContent({
  page,
  motionEnabled,
}: {
  page: PageId | undefined
  motionEnabled: boolean
}) {
  return (
    <PageBoundary key={page}>
      <Suspense
        fallback={
          <section className="section container page-loading" role="status">
            Loading {page ? pages[page].label.toLowerCase() : 'page'}…
          </section>
        }
      >
        {page === 'home' && <Home motionEnabled={motionEnabled} />}
        {(page === 'projects' || page === 'coursework') && (
          <Showcase
            key={page}
            collection={page}
            motionEnabled={motionEnabled}
          />
        )}
        {page === 'about' && <About />}
        {page === 'contact' && <Contact />}
        {!page && (
          <section className="section container not-found">
            <p className="eyebrow section-index">404 / OFF THE MAP</p>
            <h1>This page wandered off.</h1>
            <p>
              My projects, coursework, and contact details are a click away.
            </p>
            <a className="button button-primary" href="/">
              Back to the portfolio
            </a>
          </section>
        )}
      </Suspense>
    </PageBoundary>
  )
})
