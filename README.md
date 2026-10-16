# Uthsara Dahanaike | portfolio

Personal portfolio for cybersecurity and data science + AI, built with React 18, TypeScript, Vite, and CSS. Published at [uthsarad.github.io](https://uthsarad.github.io).

The landing page is a continuous, numbered story: Introduction, Interests, Projects, Coursework, About, and Contact. One combined monogram/menu control opens a native modal drawer with section links at every screen size, replacing the top navigation bar. Desktop mouse hover opens it after a short pause and moving away closes it. Click, keyboard, and touch open a persistent drawer, and keyboard or pointer interaction inside a hover-opened drawer keeps it open. Desktop readers get a section indicator and vertical reading-progress line. Phones get a floating side menu. A native disclosure keeps navigation usable without JavaScript.

The Interests subsection retains Cybersecurity's Ghost Fibers and assembling padlock, and Data Science + AI's interactive Antigravity field. The profile identifies the current role as Data Science Intern. Both full collections now appear on the landing page, with illustrations, category filters, optional details, and an independent lifecycle filter. NeOS and mEgis are Ongoing, and FerrumCalc is Completed, based on existing content. Private/usable labels and course codes do not prove completion, so those entries say Status not confirmed. Update `lifecycle` in `src/data/projects.ts` when their status is confirmed.

A physically based Schwarzschild black hole sits behind the content, rendered by a local WebGL2 beam tracer with gravitational lensing, Doppler-shifted accretion disc, and black-body temperature. The same canvas drifts gently between subsections, while secondary blocks rise into view. Browser-tab titles and favicons still follow reading context and topic interactions. A new chapter clears stale selections. Clickable headings remain keyboard-accessible buttons, and critical content is visible before JavaScript.

## Space arrival and palette

The interface uses neutral near-black surfaces, white headings, and one main blue (`#4c8dff`), with lighter blue reserved for supporting accents. Feathered dark scrims keep text readable when the moving disc passes behind it. The static fallback is a clean blue-white frame captured from the local physical renderer, without the upstream demo's golden tint or interface labels. Only the live canvas receives the blue color filter, so the fallback is not tinted twice.

An inline, decorative orbital arrival lasts 1.25 seconds and cannot capture pointer input or delay React hydration. It has a navigation-relative 1.6-second disarm deadline and is hidden by default if animations or JavaScript fail. Reduced motion, saved pause, deep links, standalone routes, Back/Forward restores, and input skip or dismiss it. Leaving the document disarms it to prevent replay after a restored visit. It does not wait for fonts, images, or physics tables and never reports invented loading progress. Network delivery, GPU first paint and WebGL readiness are separate from this bounded intro, so total cold-network page loading is not universally guaranteed under two seconds. Concrete checks and retained timing failures are recorded in `SPACE-REFRESH-2026-10-13.md`.

## Pages

The drawer uses native dialog focus containment and background inertness. Escape, the close button, a backdrop click, and selecting a section close it. Real `/#section` links focus their destination, respect motion preferences, and preserve Back/Forward reading positions. Section navigation scrolls through the story rather than playing a page-replacement transition. Favicons use a globe for the portfolio, a shield for cybersecurity, and connected nodes for data science + AI. Browser titles use `Topic | Uthsara Dahanaike`, and the prerendered metadata stays page-specific.

| URL            | Content                                                           |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Six landing subsections, including both full project collections   |
| `/projects/`   | Five independent projects; systems and tools/data filters         |
| `/coursework/` | Three academic studies; security, data + AI, and systems filters  |
| `/about/`      | Biography, background, and skills                                 |
| `/contact/`    | Email, copy-email control, and social links                       |

The four standalone content pages remain available for existing links. Their side menu returns to the matching landing subsection. Ordinary local page clicks retain the React shell, physical canvas, and runtime, with space-trip choreography only for cross-page routes. Same-document section jumps never start a trip. Back/Forward restores reading positions and destination focus. Modifier clicks, downloads, external links, and failed module loads retain native navigation. `scripts/build-pages.mjs` prerenders complete React pages into HTML, with page-specific metadata and reachable static module preloads. Text, section links, and project disclosures work before JavaScript. GitHub Pages serves only static files.

Individual requirement checks, before/after observations, guessed design choices, and remaining owner-data constraints are recorded in `ACCEPTANCE.md`, historical `ACCEPTANCE.json`, and dated `ACCEPTANCE-2026-10-08.json`. Resume mechanics are implemented, but the actual owner's download remains blocked until an approved PDF is added and rebuilt.

## Development

Use Node.js 22 and npm. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
npm run build
npm run check:pages
npm run check:content
npm run check:startup
npm run check:cancellation
npm run preview
```

Development uses port **5173**; production preview uses **4173**. Dev renders source pages into HTML to exercise hydration. The build runs strict TypeScript checks, bundles the client into `dist/` and a build-only React renderer into `dist-ssr/`, then generates page documents and the sitemap. Only `dist/` is published. `check:pages` runs five checks for content, section anchors, lifecycle badges, optional resume integrity, metadata, canonicals, assets, sitemap, 404, preloads, and gzip budgets: 12 kB per HTML document, 56 kB shared runtime, 70 kB runtime plus initial modules for the full landing page, and 62 kB for standalone routes. The initial full landing build measured 66,619 bytes JavaScript gzip, so only its budget was adjusted. Decorative renderers, the scroll-linked voyage controller, and physics tables remain deferred. The voyage module is requested only when motion is enabled, with guarded startup and cleanup if the preference changes while it loads. `check:content` runs fourteen harness regressions: nine for literal source parsing, changed lifecycle values, stale badges, native download attribute serialization and exact source-to-built PDF bytes, plus five for bounded request-ledger settlement. Its in-memory examples are not owner facts, a genuine resume or browser acceptance. GitHub Actions requires both checks after the build and before artifact upload. Local changes do not change the published site.

After starting preview, `node scripts/check-navigation.mjs --url http://127.0.0.1:4173` checks the combined logo/menu, hover delay and dismissal, click persistence, keyboard adoption/focus, 390px and 320px touch navigation, native no-JavaScript links, and deferred voyage pause/reload/resume. It uses existing Playwright/browser installations only, with the same environment overrides described below, and writes screenshots plus a report under the system temporary directory.

`node scripts/check-space-refresh.mjs --url http://127.0.0.1:4173` observes arrival frames from before navigation, verifies visible-to-hidden completion before two seconds, and checks mobile, input, motion, history, disabled animation, missing entry-module, delayed-CSS, blue-fallback pixels, and solid-color contrast paths. Separate cold-cache runs record FCP, LCP candidates and long tasks without clicking or scrolling, including a 4 Mbps / 40 ms network profile. Local paint assertions default to two seconds. Use `--max-paint-ms 0` only to record external-network timings without asserting that guarantee. `--bfcache` attempts a real full-document restore and requires `pageshow.persisted` and the same document identity. It reports blocked if a genuine restore is unavailable, not a synthetic-event pass. Moving-image contrast still requires rendered-frame review beyond the computed solid-background checks.

The `pause-during-noise-load` startup case deliberately holds only the initial renderer noise fetch, observes its original AbortSignal during an actual pause click, and requires a distinct signal and successful renderer readiness after resume. Only that exact correlated request may be classified as an expected cleanup abort. All raw failures remain in the report, and every other first-party failure or HTTP error is still fatal. Both motion cases require an empty tracked request ledger and a 500ms quiet interval before classification. The independent history case waits for renderer readiness before pausing. These are lifecycle/failure-path checks, not page-load timing evidence. `npm run check:cancellation` exercises the strict proof classifier with built-in Node tests, not a browser or GPU substitute.

`node scripts/check-sections.mjs` checks desktop, mobile, 320px, reduced motion, no JavaScript, deep links/history, drawer dismissal/focus, filters, and hydration. For each of the four JavaScript-enabled landing scenarios it exercises all 28 category/lifecycle combinations against literal source data, checking visible card titles/badges, result counts, empty states, and unchanged opposite collection controls. It verifies current resume markup and served-byte integrity, but does not claim a native file download transfer. This local suite deliberately blocks remote fonts and logs native scrolling calls. Use the separate network runner for normal-network evidence. `node scripts/check-space-trip.mjs` retains the heavy renderer and legacy-route regression checks. Legacy-route stress tests use temporary anchors, while the section runner exercises the actual navigation UI. If Chromium is not cached, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed Chrome or Edge executable. The runners never install packages.

`node scripts/check-public-network.mjs --url http://127.0.0.1:4173` records normal requests with context, request-start, failure and teardown phases. It first matches browser document bytes to this repository's `dist/`, exercises actual desktop/mobile/reduced-motion/no-JS controls, and distinguishes settled workflows from an early-close boundary observation. Only the exact no-JS document module preloads and correlated early-close aborts are classified separately, with all raw failures retained. For settled cases it additionally requires the tracked request ledger to be empty and quiet for an observed 500ms, with a 15-second deadline. New starts/completions/failures reset the quiet interval, and no pending request is removed by this wait. This is bounded observation, not proof that no future request can arrive. The early-close case deliberately skips settlement. Its earlier observed results and hashes are in `ACCEPTANCE.json` under `networkPhaseFollowthrough`; current whole-result reruns are recorded separately. Earlier untimed failures are not retrospectively attributed by a newer run.

The runner also clicks the actual footer pause switch and performs three Home plus three About reloads, requiring motion off, renderer readiness false, switch unchecked, and zero renderer payload starts through settlement/context closure. Saved pause is restored synchronously in the existing post-hydration effect instead of a deferred transition, retaining prerender/hydration parity. The 8 October complete final-source rerun passed six settled network workflows plus the separate unfinished early-close boundary, six section workflows, and the full actual public path with **38 PASS / 3 owner-content blocked observations**. Native motion resume still works. See the dated acceptance record for concrete before/after evidence and preserved failures. No owner PDF/status was invented and no publication was performed.

## Resume download

The introduction, contact subsection, and drawer contain download controls. They are disabled with an explanation until an approved PDF is added at `public/resume.pdf`. Vite checks its PDF signature and then enables a native download link in prerendered HTML and React. Rebuild, or restart dev, after adding/removing the file. It is copied into `dist/resume.pdf`. Review personal information and accuracy before publishing it. No PDF was copied from Downloads for this change.

## Content and structure

| File                                   | Purpose                                                     |
| -------------------------------------- | ----------------------------------------------------------- |
| `src/App.tsx`                          | Page selection and persistent global motion preference      |
| `src/lib/navigation.ts`                | Enhanced local navigation, history, scroll, and focus       |
| `src/lib/space-trip.ts`                | Ingest/emerge page transition choreography                  |
| `src/lib/page-content.tsx`             | Isolated, lazy page content                                 |
| `src/data/sections.ts`                 | Landing chapter order, anchor targets, and drawer labels     |
| `src/components/ui/Navigation.tsx`     | Side rail, modal drawer, and no-JavaScript disclosure        |
| `src/components/ui/ResumeButton.tsx`   | Native PDF download or an explained unavailable state       |
| `src/styles/sections.css`             | Section-first layout and responsive drawer                  |
| `scripts/check-sections.mjs`          | Landing-page browser acceptance checks                      |
| `scripts/content-contract.mjs`        | Independent literal lifecycle and resume integrity oracle    |
| `scripts/content-contract.test.mjs`   | In-memory contract-guard regressions, not owner acceptance    |
| `scripts/request-settlement.mjs`      | Bounded, non-mutating tracked-request settlement wait         |
| `scripts/request-settlement.test.mjs` | Five synthetic request-ledger guard regressions               |
| `src/data/pages.json`                  | Standalone URLs and SEO metadata                            |
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

`BlackHole.tsx` mounts one fixed Schwarzschild scene behind every page. It renders Eric Bruneton's physically based black hole shader (arXiv:2010.08735), vendored from kam-ui, as a local WebGL2 beam tracer: light rays are traced through curved spacetime using the precomputed deflection and inverse-radius lookup tables, then shaded with Doppler shift and black-body temperature, keeping the original disc density, opacity, and temperature defaults. The observer follows an artistic scroll-linked voyage, starting at camera distance index 850 with time scale 1.2, so the disc visibly spins and the view turns without falling into the hole. The scene pass targets a float or half-float HDR framebuffer when the browser allows it and otherwise falls back to RGBA8 with the tone map baked into the scene shader; a second pass applies a Reinhard-style tone map and gamma. The upstream bloom pipeline is not used.

The renderer, its GLSL and the scroll voyage are dynamically imported. Optional work waits for both first contentful paint and at least 2.5 seconds since navigation, then yields two animation frames in a visible, motion-enabled document before starting. Late hydration cannot turn the absolute timer into pre-paint GPU or scroll work. Browsers without paint timing use a double-frame rendering opportunity instead, not a claimed FCP observation. Resuming later adds no further fixed delay. The four `.dat` tables plus a noise texture total about **3.6 MB** of self-hosted binary, fetched only after those modules load, never from a CDN, and excluded from the JavaScript bundle totals. The canvas is capped at **960px desktop / 560px mobile**, DPR 1, drawing at **30 fps desktop / 20 fps mobile**. It draws one frame as soon as the tables arrive, then continues only while the tab is visible and motion is on. A hidden document, the motion-off switch, reduced motion, a lost WebGL context, or unmount suspends or releases the renderer, and it re-initializes on context restore or return to the foreground. The approximately 20 kB blue-white `preview-blue.jpg` covers the canvas until that first frame and stays as the fallback when WebGL2, shader compilation, or a table fetch fails.

The black hole is decorative. Its lensing, disc, and Doppler rendering is physical, but the page-transition suck-in and spit-out described below is artistic choreography on DOM elements; a real black hole does not eject what falls in, and the site does not simulate an actual trajectory.

`Aurora.tsx` adapts the React Bits noise shader to local WebGL2, with a blue palette and a six-second CSS opacity pulse. The canvas draws at up to 20 fps and caps its width at 720px desktop / 480px mobile and its height at 480px. A gradient fallback is present before JavaScript or when WebGL is unavailable. Aurora loads in a separate chunk and pauses when the document is hidden or motion is off.

`Antigravity.tsx` loads when the data tab opens. It adapts React Bits' magnetic ring, depth projection, waves, and easing to 224 projected capsule particles using Canvas2D. The canvas is capped at 640px wide and 30 fps. Mouse movement and taps steer the field; the Shift field button also works by keyboard. Slow automatic movement resumes after 2.5 seconds without input. It pauses offscreen, when the document is hidden, and with motion off. A static SVG covers unavailable Canvas2D.

The previous Particles/Anime.js scene and unused Depth Text component were removed. These new adaptations require no extra npm packages or animation CDN requests. `SecurityLock.tsx` assembles SVG fragments and traces the shackle once per panel mount, pausing offscreen. Motion-off and reduced-motion show the completed lock immediately.

## Motion and accessibility

- Persistent side navigation, skip link, visible focus states, native disclosure controls, and a modal drawer with Escape and focus-return handling.
- Interest tabs support arrow keys, Home, and End. Project filters announce the updated result count.
- A small switch in the footer controls motion and remembers its setting between pages. System reduced-motion preference takes priority.
- An early preference script suppresses CSS motion before hydration; browser preferences restore after React attaches to the prerendered markup. Content entrance observers attach inside hydrated page components.
- Aurora pulses gently every six seconds; the aura uses slow CSS opacity/scale. Both stop with the footer switch or reduced-motion preference.
- Canvas renderers bound their resolution and frame rate, suspend when inactive, and release resources/listeners on unmount. Local SVG, JPEG, or gradient fallbacks keep the scenes visible without their renderer.
- Cross-page legacy links retain a space-trip transition. The footer and content blocks follow their own curved paths toward the black hole with a tangential detour and an anisotropic stretch suggesting tidal forces, shrinking and blurring into the horizon (**ingesting**, about 600 ms plus up to 120 ms of stagger). The route swaps while everything is hidden, then the destination blocks play the same animation in reverse, settling back into place (**emerging**, about 650 ms). The real DOM is animated, not clones or rasterized text, and `main` is marked inert during the trip. Escape skips it immediately, and it is skipped entirely when motion is off, when reduced motion is preferred, when the tab is hidden, or when the Web Animations API is unavailable. A 900 ms safety timeout per phase clears stale animations even under background throttling, so animation can never trap navigation. The address bar updates as soon as a link is clicked, so pressing Back mid-trip or clicking again always lands on the page the URL shows.
- Shiny text pauses offscreen. Data/AI controls still communicate their state when animation is disabled.
- Reading progress updates a single element without React state per pixel. Section geometry is cached until content/layout changes, and topic interactions do not rerender the page content.
- Ghost Fibers retains shader resources when paused or moved offscreen, with a 640px maximum width. Critical headings stay readable; secondary blocks rise gently into the reading flow.
- Google Fonts loads without blocking first paint; system fonts remain available during loading or failure.
- Copy-email reports success or failure and leaves the visible email link available.

## Component sources

React Bits supplies the basis for Aurora, Antigravity, Ghost Fibers, Shiny Text, and Spotlight Card; local adaptations keep the dependency footprint small and add motion controls. The black hole scene is vendored from kam-ui, which ports Eric Bruneton's black hole shader. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source links and the included upstream licenses.

The shadcn registry MCP was used to discover React Bits components. HeroUI and Lightswind MCP documentation informed navigation/disclosure patterns. Their component packages are not bundled; Reshaped documentation was consulted without a connected Reshaped MCP server.

See [REVIEW.md](REVIEW.md) for the original findings, fixes, validation, and remaining content suggestions.
