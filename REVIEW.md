# Portfolio review and redesign

Reviewed on 18 September 2026. The live portfolio and existing implementation were reviewed before changes were made. This report describes the local redesign; publishing it is a separate step.

## Aurora, Antigravity, and lock scene, 19 September 2026

The owner corrected the current position to **Data Science Intern**. The hero badge, biography, About timeline, page metadata, and structured data now use that role. Coursework moves the globe into the lower-left corner on desktop and mobile, retaining its travel/zoom transition and aura.

React Bits Aurora now provides a blue noise curtain with a six-second opacity pulse. Its local WebGL2 adaptation is capped at 20 fps, 720px desktop / 480px mobile width, and 480px height. Antigravity replaces the previous clustering scene: 224 capsule particles bend around a moving focus using React Bits' magnetic-ring and projection calculations, adapted to Canvas2D at up to 30 fps and 640px width. Pointer movement, taps, and a keyboard-accessible Shift field button control it. Both components pause with motion-off and document visibility; the interest scene also pauses offscreen. Aurora is an additional continuous background effect while motion is on, rather than an idle-only renderer.

The cybersecurity panel retains Ghost Fibers but replaces the word UNSEEN with a local SVG lock. Twelve glass fragments assemble, its shackle traces closed, and circuit lines appear. This is a one-time entrance per panel mount. A paused or reduced-motion visit shows the completed illustration immediately. The unused Depth Text and DataParticles files were removed; Anime.js is no longer downloaded. No package dependencies were added. Source attribution is recorded in THIRD_PARTY_NOTICES.md.

Production build and all four generated-page checks pass. The shared runtime is **162.73 kB / 53.14 kB gzip**; the new Aurora and Antigravity chunks are **4.10 / 2.02 kB** and **4.01 / 2.05 kB** respectively. CSS is **37.23 kB / 9.09 kB gzip**. These are artifact sizes, not device performance measurements. Browser checks cover the desktop visuals, Antigravity pointer/button interaction, keyboard tab selection, 320px interest-panel layout, offscreen pause, and the footer switch stopping both renderers and the Aurora pulse. A paused reload keeps the completed lock visible with clean hydration logs. Coursework's lower-left globe and the corrected About role/metadata were also checked on mobile. Production artifacts are checked on disk; the browser uses the source development server on port 5173.

## Prerendering and camera transitions, 19 September 2026

The globe now travels visibly between the left and right sides and changes size over a 1.5-second transition. Home to Projects zooms out to 64% of its base wrapper size on the left; Coursework brings it right and closer at 118%. About and Contact continue the alternating composition. Mobile uses separate positions/scales. One CSS transform moves both the globe and its aura, while the existing WebGL renderer still stops when settled.

The build now writes the actual React content into all five HTML documents, resolving lazy components before serialization. Headings, page links, and native project disclosures no longer depend on JavaScript to appear. React hydrates that markup; CSS loads directly from the document. The renderer runs only during the build, and GitHub Pages still serves static files. The development server renders source pages for hydration checks and preserves the original URL before Vite's HTML fallback rewrites it.

The initial review of this change caught an entrance observer mutating unhydrated markup and the development server rendering Home for nested URLs. Both were fixed. Saved motion preferences are applied before CSS starts animating and restored in React after hydration. The optional Anime.js download now waits for a clustering interaction. Local interpolation responds immediately, and a completed cluster plot stops its animation frame loop. Its canvas width is capped at 640px.

Final generated HTML is **2.8–4.8 kB gzip per page**, containing the full page content. The shared client runtime is **162.61 kB / 53.11 kB gzip**, CSS **37.09 kB / 9.19 kB**, and the optional data scene **5.77 kB / 2.76 kB**. This pass improves the content-loading path and idle rendering work; it does not materially shrink the shared JavaScript runtime. External libraries/fonts remain additional. No new dependencies were added, and these figures are artifact sizes, not Core Web Vitals measurements.

Validation: production build and all four generated-page checks passed. All five routes were checked through navigation and direct reloads with clean hydration logs. Layouts at 320px and 1440px had no horizontal page overflow; checked headings, paragraphs, cards, tabs, and filters also had no clipping at 320px. Desktop navigation retained one globe canvas. Saved motion-off survived a full reload with the globe/aura paused and no hydration warning. The data scene reported its local engine before interaction, loaded Anime.js after clustering, and reached its idle state on both initial and subsequent clustering transitions. Browser interaction checks used source development pages on port 5173; production HTML was validated on disk. Physical-device performance and forced CDN/context-loss tests remain unmeasured.

## Performance pass and moving globe

The globe now persists across enhanced local navigation and glides to a different position on each page. Its subtle blue aura uses CSS opacity/scale, without a full-canvas blur. All five static page documents remain available for direct visits, refreshes, and native navigation.

The code review found scroll progress stored in top-level React state, repeated section layout reads during scrolling, full page rerenders during topic previews, and fiber shader reconstruction whenever visibility changed. Progress now updates one DOM element, section bounds are cached until layout/content changes, page content is memoized, and fiber resources persist through pauses. The globe renders during transitions and stops its requestAnimationFrame loop when settled. Its canvas cap fell from 760px to 640px desktop / 440px mobile; map sampling fell from 14,000 to 12,000 / 8,000. Decorative globe initialization waits for idle time, fonts no longer block rendering, and primary headings no longer wait through an entrance fade.

Page modules are split and preloaded only for the requested route. The build checks enforce gzip budgets and prevent unrelated pages or optional graphics from entering those preloads. The shared runtime is approximately **162 kB / 53 kB gzip**, versus **185 kB / 60 kB gzip** before this pass. Runtime plus initial page modules total **178 kB / 59 kB gzip on Home**, **177 kB / 58 kB on Projects/Coursework**, and **165 kB / 54 kB on About/Contact**. The lazy globe wrapper adds **4.9 kB / 2.1 kB gzip**; the optional data scene adds **5.4 kB / 2.6 kB gzip**. CSS is **37 kB / 9.2 kB gzip**. External COBE, Anime.js, and fonts are additional. These are build artifact sizes, not measured load times or Core Web Vitals.

Validation for this pass: all five pages checked at 320, 390, 768, and 1440px with no horizontal page overflow or clipping in checked headings, card bodies, tabs, filters, biography, and email. Mobile menus close after page changes. The globe stays at one canvas, respects its resolution caps, changes position by page, and reaches its idle `settled` state. The footer switch pauses the aura, transforms, and WebGL across navigation, then resumes them. Browser Back restored a recorded reading position; the top anchor also retained history behavior. The data tab, clustering control, contextual title, and favicon worked on mobile. Browser checks used the development server on 5173; production artifacts were checked on disk. Physical-device/Core Web Vitals measurements and forced network/context-loss scenarios remain unmeasured.

## Current version: contextual titles and neon globe

The green hero dot is removed. The contextual header and browser-tab title preview topics on hover/keyboard focus and keep a clicked title selected; without a selection they follow the reading position. The tab title includes the owner's name. The header remains visible on mobile. Topic titles use native buttons. A COBE 2.0.1 globe provides blue neon connections from Colombo, smooth topic orientations, and scroll movement. The connections are illustrative, not client/work-history claims. A short downward entrance staggers the content, and supported browsers transition the globe between static documents. The footer switch and reduced-motion preference apply to these additions.

The header title itself now toggles between pinning and following the page, with an announced pressed state and a blue reading-progress line. Globe, shield, and connected-node favicons follow the selected topic. All site copy and page metadata use punctuation without em dashes; browser titles follow `Topic | Uthsara Dahanaike`.

COBE loaded and rendered successfully in the browser. Hover rollback, click persistence, keyboard tab selection, scroll-driven labels, and motion pause were checked. CDN/WebGL failure and context restoration were reviewed in code; those failure states were not forced in the browser.

The portfolio has **Home, Projects, Coursework, About, and Contact** pages. Projects contains five independent builds; Coursework contains three academic studies with security, data + AI, and systems filters. Navigation follows the page URL. The homepage now has two interest tabs: **Cybersecurity** and **Data Science + AI**.

The latest pass removes repeated introductions, decorative microcopy, the separate featured section, end-of-page prompts, FAQs, and duplicated project explanations. Main mobile body text is 16–17px; tabs and primary controls have larger type and touch targets. Extra project context stays inside native Details disclosures. All phone project layouts use one column.

Cybersecurity retains Ghost Fibers and dimensional text. The combined data/AI scene adapts React Bits Particles into a synthetic point cloud with three predefined clusters. Anime.js 4.1.3 animates the transition, loading from a pinned CDN module only when that tab opens. The browser successfully loaded the module. This stays a static site; a local tween handles CDN failure and SVG handles unavailable WebGL. Those failure paths were reviewed in code, not forced in the browser.

A small motion switch lives only in the footer and persists across pages; system reduced-motion settings take priority. Three slow blue glow layers animate behind every page. Browser APIs replace Framer Motion. Button backgrounds are explicitly reset, and screen-reader-only labels have a local CSS rule instead of relying on absent utility output.

Verification before the performance pass:

- Production build and both generated-page checks pass. All five documents have unique titles/canonical URLs, page-specific descriptions/social URLs, valid bundled assets, and sitemap entries. CI runs these checks before deployment.
- All five pages remeasured at 320, 390, 768, and 1440px after the copy/type changes. No horizontal page overflow or overflow in the checked headings, cards, tags, tabs, filters, email, background/skills panels, or footer controls. Main paragraphs measured at 16–18px.
- Data scene checked at 320px and desktop. Its cluster/scatter control and Home/End tab navigation work; Anime.js loaded successfully. Project systems and coursework data + AI filtering were checked.
- Footer switch works by pointer and keyboard, pauses the blue glow, and retains its setting across full-page navigation. Header has no motion control.
- Mobile navigation verified for Escape focus restoration and navigation to another page.
- Initial JavaScript is approximately **185 kB / 60 kB gzip**, plus **4.2 kB / 1.9 kB gzip** for the globe wrapper and **5.4 kB / 2.6 kB gzip** for the lazy data scene. CSS is approximately **36 kB / 9 kB gzip**. External COBE and Anime.js downloads are additional and excluded from Vite's sizes. These are artifact sizes, not runtime speed measurements.
- Browser checks used the development server on port 5173. Generated production documents were checked from the filesystem; deployment remains unperformed.

## Original code assessment and first-pass fixes

The original React/TypeScript structure was a reasonable starting point: content was separated from sections, components were reusable, and the production build passed. The main problems were interaction behavior, motion handling, missing content, and unnecessary complexity.

| Priority | Finding                                                                                                                         | Resolution                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Hero/footer links advertised `/resume.pdf`, but that asset did not exist.                                                       | Removed the broken download; contact and project links are the primary actions.                                                        |
| High     | Desktop navigation could disappear on pointer/keyboard activity; some icon-only links lacked accessible names.                  | Replaced it with a persistent labelled header and a mobile disclosure menu.                                                            |
| High     | Section observers required 30–35% visibility, which a very tall mobile project section could never reach.                       | Active navigation uses a reading line and handles the bottom of the page explicitly.                                                   |
| Medium   | Reduced-motion styles did not consistently stop JavaScript animation.                                                           | Added a shared motion preference, a user pause control, and visibility-aware effects. System reduced-motion preference takes priority. |
| Medium   | The decorative cursor depended on pointer events on a noninteractive layer. Several effects added overlapping responsibilities. | Removed that cursor and obsolete animation components; retained focused, locally controlled effects.                                   |
| Medium   | Uniform, text-heavy project cards made the page hard to scan, particularly on phones.                                           | Added individual project illustrations, summaries, filters, and native expandable details.                                             |
| Medium   | Clipboard failures were only logged to the console.                                                                             | Added visible failure guidance and announced success without hiding the email address.                                                 |
| Low      | README feature claims did not match the actual implementation.                                                                  | Rewrote setup, architecture, motion, and source documentation.                                                                         |

## Initial redesign

- Blue/navy visual system and React Bits–derived shiny text, dimensional type, Ghost Fibers, and card spotlights.
- Three keyboard-accessible interest scenes: cybersecurity, synthetic data clustering, and a conceptual neural network with a signal interaction.
- Cybersecurity, data science, and AI represented in the hero, biography, interests, and contact context.
- Eight existing projects retained, with honest academic/private labels and typed summary data. No invented performance metrics, screenshots, or project achievements.
- Responsive layouts, accessible navigation, skip link, focus styles, project filters, native disclosures, and email-copy feedback.
- Removed GSAP and obsolete components/styles. Enabled unused-code TypeScript checks. Updated the CI runtime to Node 22.
- Updated metadata, structured data, favicon, sitemap, robots file, 404 page, and JavaScript-disabled contact fallback.
- Included React Bits attribution and its upstream license in the source tree and production assets.

## Validation before the page split

- Production build passes: TypeScript checks and Vite bundling.
- Layouts inspected/measured at **320, 390, 640, 768, 1024, and 1440 CSS pixels**. No horizontal page overflow or clipping in the checked headings, project bodies, interest tabs, or email link.
- Both data and AI panels also checked at 320px.
- Interest tabs tested by click and keyboard (ArrowRight, Home, End); selected state and focus update correctly.
- Data control switches 54 points into three illustrative clusters. AI signal starts, completes, and updates its live status.
- Animation pause stops the canvas and shiny text; canvas returns to its running state when resumed. System-preference and context-loss fallback paths were reviewed in code, not simulated on physical devices.
- All project filters return their advertised counts: 8 total, 3 systems, 4 tools/data, 3 coursework. Project disclosure opens correctly.
- Mobile menu tested for section navigation, Escape focus restoration, and closure on desktop resize.
- Contact navigation remains active at the page bottom. Copy email displays and announces success.
- No duplicate element IDs or missing internal hash targets were found in the rendered homepage.
- A separate browser smoke test of the production preview on port 4173 was blocked by browser approval (access denied). The interaction checks above ran against the development server on port 5173; production bundling passed, but the standalone 404 page was not browser-verified.
- This is a targeted browser/code review, not a full WCAG certification, fresh dependency vulnerability audit, or physical-device performance test.

The original production JavaScript was **455.30 kB / 154.65 kB gzip**. The first redesign was approximately **185 kB / 60 kB gzip** before later page and content changes. Current artifact sizes are listed above; these are not measured load times or Core Web Vitals.

## Best next content improvements

1. **Turn two or three projects into short case studies.** Include the problem, your contribution, a real screenshot or demo, one technical decision, and a concrete result you can substantiate. Prioritize mEgis, FerrumCalc, and the AI evaluation coursework if sharing is permitted.
2. **Add a current résumé PDF.** Restore a download button only once the actual file is present.
3. **Show your AI/data methodology.** An approved notebook excerpt, real plot, or evaluation discussion would add evidence beyond the illustrative homepage scenes. Explain dataset provenance and evaluation limits; avoid unsupported accuracy claims.
4. **Add a social preview image and optional portrait.** These make shared links and the background section more personal.
5. **Recheck after deployment.** Verify GitHub Pages assets/404 behavior, external links, and mobile performance on a physical phone. Review project statuses and internship details periodically.
