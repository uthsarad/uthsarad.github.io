# Uthsara Dahanaike | portfolio

Personal portfolio for cybersecurity and data science + AI, built with React 18, TypeScript, Vite, and CSS. Published at [uthsarad.github.io](https://uthsarad.github.io).

The homepage has two interest tabs: Cybersecurity uses Ghost Fibers with dimensional type; Data Science + AI uses React Bits–derived particles that gather into three illustrative clusters. Shiny lettering and a slowly pulsing blue background connect the pages. Copy is kept short, with 16px or larger main body text and one-column project cards on phones. Independent projects and coursework have separate collections with illustrations, filters, and optional details.

A blue neon COBE globe sits behind the content, with illustrative connections from Colombo. Its orientation, tilt, zoom, and arcs respond to topics; scrolling adds a smooth turn. The header label and browser-tab title preview hovered/focused titles, hold clicked selections until another selection or navigation, and otherwise follow the section in view. Browser-tab titles include Uthsara's name; generated HTML retains each page's descriptive metadata. Clickable headings are real keyboard-accessible buttons. Blocks enter with a short, staggered downward movement. The green hero status dot has been removed.

## Pages

The header title is a pin/unpin button, with a blue reading-progress line below the header. Hover/focus previews, clicks, and scroll position keep the header, browser title, and scene favicon in sync. Favicons use a globe for the portfolio, a shield for cybersecurity, and connected nodes for data science + AI. Clicking a pinned header title resumes following the page. Browser titles use `Topic | Uthsara Dahanaike`; site copy and metadata contain no em dashes.

| URL            | Content                                                           |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Introduction, interactive interests, and links into the portfolio |
| `/projects/`   | Five independent projects; systems and tools/data filters         |
| `/coursework/` | Three academic studies; security, data + AI, and systems filters  |
| `/about/`      | Biography, background, and skills                                 |
| `/contact/`    | Email, copy-email control, and social links                       |

Navigation uses ordinary links, enhanced for local page clicks to retain the React shell and globe. Each page loads its own content module; the shell and previously visited modules are reused. Browser Back/Forward restores reading positions, page changes focus the main content, and modifier clicks, downloads, external links, and failed module loads retain native navigation. `scripts/build-pages.mjs` prerenders the complete React page into HTML, with page-specific metadata and module preloads. Text, ordinary links, and project disclosures are available before JavaScript; React hydrates them to enable filters and visual controls. GitHub Pages serves only static files.

## Development

Use Node.js 22 and npm. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run build
npm run check:pages
npm run preview
```

Development uses port **5173**; production preview uses **4173**. The development server renders source pages into HTML to exercise the same hydration path. The build runs strict TypeScript checks, bundles the client into `dist/` and a build-only React renderer into `dist-ssr/`, then generates complete page documents and the sitemap. Only `dist/` is published; no server runs in production. `check:pages` runs four checks covering rendered content, metadata, canonical URLs, assets, sitemap, the 404 file, route-specific preloads, and gzip budgets (12 kB per HTML document; 56 kB shared runtime; 62 kB runtime plus initial page modules). GitHub Actions runs these checks before deployment. Local edits do not change the published site.

## Content and structure

| File                                   | Purpose                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `src/App.tsx`                          | Page selection and persistent global motion preference      |
| `src/lib/navigation.ts`                | Enhanced local navigation, history, scroll, and focus       |
| `src/lib/page-content.tsx`             | Isolated, lazy page content                                 |
| `src/data/pages.json`                  | Page URLs, navigation labels, and SEO metadata              |
| `src/entry-server.tsx`                 | Build-time page tree used for prerendering                  |
| `scripts/render-page.mjs`             | Waits for lazy React content before serializing HTML        |
| `scripts/build-pages.mjs`              | Static HTML documents and sitemap for GitHub Pages          |
| `src/data/profile.ts`                  | Biography, contact information, links                       |
| `src/data/projects.ts`                 | Existing project facts, technologies, repository links      |
| `src/data/project-details.ts`          | Short, typed project summaries                              |
| `src/components/ui/InterestLab.tsx`    | Two keyboard-accessible interest tabs                       |
| `src/components/ui/reactbits/`         | Locally adapted React Bits effects                          |
| `src/components/ui/ProjectArtwork.tsx` | Decorative project illustrations; these are not screenshots |
| `src/sections/`                        | Hero, work, background, interests, contact                  |
| `src/styles/`                          | Layout, responsive rules, theme, visual effects             |
| `public/`                              | Favicon, robots file, licenses, standalone 404 page         |

The particle scene uses deterministic synthetic points and predefined clusters. It illustrates grouping; it does not run a trained model or report real measurements. Academic/private projects are labelled explicitly. There is no résumé download until a real file is supplied.

## Static animation

`NeonGlobe.tsx` lazily imports **COBE 2.0.1** from `https://cdn.jsdelivr.net/npm/cobe@2.0.1/dist/index.esm.js`, with initialization deferred until browser idle time (bounded to 1.2 seconds). The same canvas travels left/right and zooms over a 1.5-second CSS transform: Home to Projects pulls out toward the left, Coursework moves right into a close view, and About/Contact continue the alternating composition. Mobile positions and scales are tuned separately. The radial blue aura moves with the globe and breathes using opacity and scale, without a large blur filter. Topic selection and scrolling still change its orientation and connections.

WebGL draws at up to 30 fps during transitions, then stops its animation frame loop once settled. Hidden documents and motion-off also suspend it. The canvas is capped at **640px desktop / 440px mobile**, DPR 1, with **12,000 / 8,000 map samples**. Resize work skips unchanged canvas dimensions. A local SVG sphere and aura cover loading or unavailable WebGL/CDN. The arcs express global reach, not client locations or employment history. COBE's canvas/wrapper is isolated from React's managed DOM and its resources are released on unmount.

The globe and Anime.js are external runtime downloads, not part of Vite's bundle-size totals. The site still deploys as static files, with no server or API requirement.

`DataParticles.tsx` is loaded only when the data tab is first opened. Its WebGL2 renderer adapts React Bits Particles, capped at 640px width. Anime.js **4.1.3** is imported from `https://cdn.jsdelivr.net/npm/animejs@4.1.3/lib/anime.esm.js` only after an animated clustering interaction. The first transition responds immediately with a local tween while the engine loads; subsequent transitions use Anime.js when available. Once grouped, the plot stops its animation frame loop entirely until another interaction. The version is pinned, the local tween also covers CDN failure, and an SVG illustration remains usable without WebGL2.

Package downloads were unavailable during this change, so Anime.js uses that explicit CDN import rather than an npm dependency. It is not included in Vite's reported bundle sizes. Self-hosting the pinned module is an option if removing this external request becomes a requirement. Framer Motion was removed; visibility and reduced-motion hooks use browser APIs.

## Motion and accessibility

- Persistent navigation, skip link, visible focus states, native disclosure controls, and a mobile menu with Escape handling.
- Interest tabs support arrow keys, Home, and End. Project filters announce the updated result count.
- A small switch in the footer controls motion and remembers its setting between pages. System reduced-motion preference takes priority.
- An early preference script suppresses CSS motion before hydration; browser preferences restore after React attaches to the prerendered markup. Content entrance observers attach inside hydrated page components.
- Background glow uses slow CSS opacity/transform animations and stops with the footer switch or reduced-motion preference.
- Both WebGL2 scenes cap rendering at 30 fps and bound canvas resolution. They pause offscreen or when the document is hidden, dispose resources on unmount, and have SVG fallbacks.
- Shiny text pauses offscreen. Data/AI controls still communicate their state when animation is disabled.
- Scroll progress updates a single element without React state. Section geometry is cached until content/layout changes, and topic previews do not rerender the page content.
- Ghost Fibers retains its shader resources when paused or moved offscreen, with a 640px maximum width. Critical page headings appear immediately; the falling entrances remain on secondary content.
- Google Fonts loads without blocking first paint; system fonts remain available during loading or failure.
- Copy-email reports success or failure and leaves the visible email link available.

## Component sources

React Bits supplies the basis for Ghost Fibers, Particles, Depth Text, Shiny Text, and Spotlight Card; local adaptations keep the dependency footprint small and add motion controls. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source links and the included upstream license.

The shadcn registry MCP was used to discover React Bits components. HeroUI and Lightswind MCP documentation informed navigation/disclosure patterns. Their component packages are not bundled; Reshaped documentation was consulted without a connected Reshaped MCP server.

See [REVIEW.md](REVIEW.md) for the original findings, fixes, validation, and remaining content suggestions.
