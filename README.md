# Uthsara Dahanaike | portfolio

Personal portfolio for cybersecurity and data science + AI, built with React 18, TypeScript, Vite, and CSS. Published at [uthsarad.github.io](https://uthsarad.github.io).

The homepage has two interest tabs: Cybersecurity uses Ghost Fibers behind a blue padlock that assembles from fragments on entry; Data Science + AI uses an interactive Antigravity particle field. A blue React Bits Aurora background pulses every six seconds. The profile identifies the current role as Data Science Intern. Copy is kept short, with 16px or larger main body text and one-column project cards on phones. Independent projects and coursework have separate collections with illustrations, filters, and optional details.

A physically based Schwarzschild black hole sits behind the content, rendered by a local WebGL2 beam tracer with gravitational lensing, Doppler-shifted accretion disc, and black-body temperature. The header label and browser-tab title preview hovered/focused titles, hold clicked selections until another selection or navigation, and otherwise follow the section in view. Browser-tab titles include Uthsara's name; generated HTML retains each page's descriptive metadata. Clickable headings are real keyboard-accessible buttons. Blocks enter with a short, staggered downward movement. The green hero status dot has been removed.

## Pages

The header title is a pin/unpin button, with a blue reading-progress line below the header. Hover/focus previews, clicks, and scroll position keep the header, browser title, and scene favicon in sync. Favicons use a globe for the portfolio, a shield for cybersecurity, and connected nodes for data science + AI. Clicking a pinned header title resumes following the page. Browser titles use `Topic | Uthsara Dahanaike`; site copy and metadata contain no em dashes.

| URL            | Content                                                           |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Introduction, interactive interests, and links into the portfolio |
| `/projects/`   | Five independent projects; systems and tools/data filters         |
| `/coursework/` | Three academic studies; security, data + AI, and systems filters  |
| `/about/`      | Biography, background, and skills                                 |
| `/contact/`    | Email, copy-email control, and social links                       |

Navigation uses ordinary links, enhanced for local page clicks to retain the React shell, the physical black hole canvas, and the React runtime. Each page loads its own content module; the shell and previously visited modules are reused. Local clicks play a short space-trip transition, described under Motion and accessibility. Browser Back/Forward restores reading positions, page changes focus the main content, and modifier clicks, downloads, external links, and failed module loads retain native navigation. `scripts/build-pages.mjs` prerenders the complete React page into HTML, with page-specific metadata and module preloads. Text, ordinary links, and project disclosures are available before JavaScript; React hydrates them to enable filters and visual controls. GitHub Pages serves only static files.

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
| `src/lib/space-trip.ts`                | Ingest/emerge page transition choreography                  |
| `src/lib/page-content.tsx`             | Isolated, lazy page content                                 |
| `src/data/pages.json`                  | Page URLs, navigation labels, and SEO metadata              |
| `src/entry-server.tsx`                 | Build-time page tree used for prerendering                  |
| `scripts/render-page.mjs`             | Waits for lazy React content before serializing HTML        |
| `scripts/build-pages.mjs`              | Static HTML documents and sitemap for GitHub Pages          |
| `scripts/check-space-trip.mjs`         | Local Playwright acceptance checks for the persistent scene  |
| `src/data/profile.ts`                  | Biography, contact information, links                       |
| `src/data/projects.ts`                 | Existing project facts, technologies, repository links      |
| `src/data/project-details.ts`          | Short, typed project summaries                              |
| `src/components/ui/BlackHole.tsx`      | Persistent Schwarzschild scene and its lifecycle            |
| `src/lib/blackHolePhysical/`           | Vendored physics model and WebGL2 beam tracer               |
| `src/shaders/`                         | Physical lensing and accretion disc GLSL                    |
| `src/components/ui/InterestLab.tsx`    | Two keyboard-accessible interest tabs                       |
| `src/components/ui/reactbits/`         | Locally adapted React Bits effects                          |
| `src/components/ui/ProjectArtwork.tsx` | Decorative project illustrations; these are not screenshots |
| `src/sections/`                        | Hero, work, background, interests, contact                  |
| `src/styles/`                          | Layout, responsive rules, theme, visual effects             |
| `public/black-hole/`                   | Precomputed physics tables, noise, static preview           |
| `public/`                              | Favicon, robots file, licenses, standalone 404 page         |

The particle field uses deterministic synthetic points. It illustrates a changing field; it does not run a trained model or report real measurements. The padlock is a local SVG illustration, not a security-status indicator. Academic/private projects are labelled explicitly. There is no résumé download until a real file is supplied.

## Static animation

`BlackHole.tsx` mounts one fixed Schwarzschild scene behind every page. It renders Eric Bruneton's physically based black hole shader (arXiv:2010.08735), vendored from kam-ui, as a local WebGL2 beam tracer: light rays are traced through curved spacetime using the precomputed deflection and inverse-radius lookup tables, then shaded with Doppler shift and black-body temperature, keeping the original disc density, opacity, and temperature defaults. The observer is stationary, held at camera distance index 850 with time scale 0.35, so the disc and lensed light drift slowly instead of the camera falling in. The scene pass targets a float or half-float HDR framebuffer when the browser allows it and otherwise falls back to RGBA8 with the tone map baked into the scene shader; a second pass applies a Reinhard-style tone map and gamma. The upstream bloom pipeline is not used.

The renderer and its GLSL are dynamically imported, and initialization waits for a visible, motion-enabled document before compiling anything, so a first paint never blocks on physics tables. The four `.dat` tables plus a noise texture total about **3.6 MB** of self-hosted binary, fetched only after those modules load, never from a CDN, and excluded from the JavaScript bundle totals. The canvas is capped at **960px desktop / 560px mobile**, DPR 1, drawing at **24 fps desktop / 18 fps mobile**. It draws one frame as soon as the tables arrive, then continues only while the tab is visible and motion is on. A hidden document, the motion-off switch, reduced motion, a lost WebGL context, or unmount suspends or releases the renderer, and it re-initializes on context restore or return to the foreground. A static `preview.jpg` covers the canvas until that first frame and stays as the fallback when WebGL2, shader compilation, or a table fetch fails.

The black hole is decorative. Its lensing, disc, and Doppler rendering is physical, but the page-transition suck-in and spit-out described below is artistic choreography on DOM elements; a real black hole does not eject what falls in, and the site does not simulate an actual trajectory.

`Aurora.tsx` adapts the React Bits noise shader to local WebGL2, with a blue palette and a six-second CSS opacity pulse. The canvas draws at up to 20 fps and caps its width at 720px desktop / 480px mobile and its height at 480px. A gradient fallback is present before JavaScript or when WebGL is unavailable. Aurora loads in a separate chunk and pauses when the document is hidden or motion is off.

`Antigravity.tsx` loads when the data tab opens. It adapts React Bits' magnetic ring, depth projection, waves, and easing to 224 projected capsule particles using Canvas2D. The canvas is capped at 640px wide and 30 fps. Mouse movement and taps steer the field; the Shift field button also works by keyboard. Slow automatic movement resumes after 2.5 seconds without input. It pauses offscreen, when the document is hidden, and with motion off. A static SVG covers unavailable Canvas2D.

The previous Particles/Anime.js scene and unused Depth Text component were removed. These new adaptations require no extra npm packages or animation CDN requests. `SecurityLock.tsx` assembles SVG fragments and traces the shackle once per panel mount, pausing offscreen. Motion-off and reduced-motion show the completed lock immediately.

## Motion and accessibility

- Persistent navigation, skip link, visible focus states, native disclosure controls, and a mobile menu with Escape handling.
- Interest tabs support arrow keys, Home, and End. Project filters announce the updated result count.
- A small switch in the footer controls motion and remembers its setting between pages. System reduced-motion preference takes priority.
- An early preference script suppresses CSS motion before hydration; browser preferences restore after React attaches to the prerendered markup. Content entrance observers attach inside hydrated page components.
- Aurora pulses gently every six seconds; the aura uses slow CSS opacity/scale. Both stop with the footer switch or reduced-motion preference.
- Canvas renderers bound their resolution and frame rate, suspend when inactive, and release resources/listeners on unmount. Local SVG, JPEG, or gradient fallbacks keep the scenes visible without their renderer.
- Local page clicks play a space-trip transition. The visible header, footer, and content blocks follow their own curved paths toward the black hole with a tangential detour and an anisotropic stretch suggesting tidal forces, shrinking and blurring into the horizon (**ingesting**, about 600 ms plus up to 120 ms of stagger). The route swaps while everything is hidden, then the destination blocks play the same animation in reverse, settling back into place (**emerging**, about 650 ms). The real DOM is animated, not clones or rasterized text, and `main` is marked inert during the trip. Escape skips it immediately, and it is skipped entirely when motion is off, when reduced motion is preferred, when the tab is hidden, or when the Web Animations API is unavailable. A 1-second safety timeout clears stale animations even under background throttling, so animation can never trap navigation.
- Shiny text pauses offscreen. Data/AI controls still communicate their state when animation is disabled.
- Scroll progress updates a single element without React state. Section geometry is cached until content/layout changes, and topic previews do not rerender the page content.
- Ghost Fibers retains its shader resources when paused or moved offscreen, with a 640px maximum width. Critical page headings appear immediately; the falling entrances remain on secondary content.
- Google Fonts loads without blocking first paint; system fonts remain available during loading or failure.
- Copy-email reports success or failure and leaves the visible email link available.

## Component sources

React Bits supplies the basis for Aurora, Antigravity, Ghost Fibers, Shiny Text, and Spotlight Card; local adaptations keep the dependency footprint small and add motion controls. The black hole scene is vendored from kam-ui, which ports Eric Bruneton's black hole shader. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source links and the included upstream licenses.

The shadcn registry MCP was used to discover React Bits components. HeroUI and Lightswind MCP documentation informed navigation/disclosure patterns. Their component packages are not bundled; Reshaped documentation was consulted without a connected Reshaped MCP server.

See [REVIEW.md](REVIEW.md) for the original findings, fixes, validation, and remaining content suggestions.
