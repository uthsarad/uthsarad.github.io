# Uthsara Dahanaike — portfolio

Personal portfolio for cybersecurity and data science + AI, built with React 18, TypeScript, Vite, and CSS. Published at [uthsarad.github.io](https://uthsarad.github.io).

The homepage has two interest tabs: Cybersecurity uses Ghost Fibers with dimensional type; Data Science + AI uses React Bits–derived particles that gather into three illustrative clusters. Shiny lettering and a slowly pulsing blue background connect the pages. Copy is kept short, with 16px or larger main body text and one-column project cards on phones. Independent projects and coursework have separate collections with illustrations, filters, and optional details.

A blue neon COBE globe sits behind the content, with illustrative connections from Colombo. Its orientation, tilt, zoom, and arcs respond to topics; scrolling adds a smooth turn. The header label and browser-tab title preview hovered/focused titles, hold clicked selections until another selection or navigation, and otherwise follow the section in view. Browser-tab titles include Uthsara's name; generated HTML retains each page's descriptive metadata. Clickable headings are real keyboard-accessible buttons. Blocks enter with a short, staggered downward movement. The green hero status dot has been removed.

## Pages

| URL            | Content                                                           |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Introduction, interactive interests, and links into the portfolio |
| `/projects/`   | Five independent projects; systems and tools/data filters         |
| `/coursework/` | Three academic studies; security, data + AI, and systems filters  |
| `/about/`      | Biography, background, and skills                                 |
| `/contact/`    | Email, copy-email control, and social links                       |

Navigation uses ordinary links. `scripts/build-pages.mjs` generates an HTML document for each URL with its own metadata and a shared fingerprinted JavaScript/CSS bundle. Direct visits and refreshes therefore have actual files on GitHub Pages. Page definitions live in `src/data/pages.json`; no server routing or redirect-based 404 workaround is required.

## Development

Use Node.js 22 and npm. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run build
npm run check:pages
npm run preview
```

Development uses port **5173**; production preview uses **4173**. The build runs strict TypeScript checks, bundles into `dist/`, and generates the page documents and sitemap. `check:pages` verifies page metadata, canonical URLs, referenced assets, sitemap coverage, and the 404 file. GitHub Actions runs these checks before deployment on relevant changes pushed to `main`, or through its manual workflow. Local edits do not change the published site.

## Content and structure

| File                                   | Purpose                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `src/App.tsx`                          | Page selection and persistent global motion preference      |
| `src/data/pages.json`                  | Page URLs, navigation labels, and SEO metadata              |
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

`NeonGlobe.tsx` lazily imports **COBE 2.0.1** from `https://cdn.jsdelivr.net/npm/cobe@2.0.1/dist/index.esm.js`. Rendering is capped at 30 fps with a maximum 760px canvas and device pixel ratio 1. It stops when the document is hidden or motion is off, cleans up its context, and provides a local SVG sphere if loading/WebGL fails. The arcs express global reach, not client locations or employment history. COBE's canvas/wrapper is isolated from React's managed DOM. Supported browsers also crossfade the globe between the real page documents using CSS view transitions.

The globe and Anime.js are external runtime downloads, not part of Vite's bundle-size totals. The site still deploys as static files, with no server or API requirement.

`DataParticles.tsx` is loaded only when the data tab is first opened. Its WebGL2 renderer adapts React Bits Particles. Anime.js **4.1.3** is imported on demand from `https://cdn.jsdelivr.net/npm/animejs@4.1.3/lib/anime.esm.js` to tween the clustering transition; it runs entirely in the browser, without a backend. The version is pinned. A local tween handles the transition if the CDN is unavailable, and an SVG illustration remains usable without WebGL2.

Package downloads were unavailable during this change, so Anime.js uses that explicit CDN import rather than an npm dependency. It is not included in Vite's reported bundle sizes. Self-hosting the pinned module is an option if removing this external request becomes a requirement. Framer Motion was removed; visibility and reduced-motion hooks use browser APIs.

## Motion and accessibility

- Persistent navigation, skip link, visible focus states, native disclosure controls, and a mobile menu with Escape handling.
- Interest tabs support arrow keys, Home, and End. Project filters announce the updated result count.
- A small switch in the footer controls motion and remembers its setting between pages. System reduced-motion preference takes priority.
- Background glow uses slow CSS opacity/transform animations and stops with the footer switch or reduced-motion preference.
- Both WebGL2 scenes cap rendering at 30 fps and bound canvas resolution. They pause offscreen or when the document is hidden, dispose resources on unmount, and have SVG fallbacks.
- Shiny text pauses offscreen. Data/AI controls still communicate their state when animation is disabled.
- Copy-email reports success or failure and leaves the visible email link available.

## Component sources

React Bits supplies the basis for Ghost Fibers, Particles, Depth Text, Shiny Text, and Spotlight Card; local adaptations keep the dependency footprint small and add motion controls. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source links and the included upstream license.

The shadcn registry MCP was used to discover React Bits components. HeroUI and Lightswind MCP documentation informed navigation/disclosure patterns. Their component packages are not bundled; Reshaped documentation was consulted without a connected Reshaped MCP server.

See [REVIEW.md](REVIEW.md) for the original findings, fixes, validation, and remaining content suggestions.
