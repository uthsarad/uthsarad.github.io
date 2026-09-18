# Portfolio review and redesign

Reviewed on 18 September 2026. The live portfolio and existing implementation were reviewed before changes were made. This report describes the local redesign; publishing it is a separate step.

## Current version: contextual titles and neon globe

The green hero dot is removed. The contextual header and browser-tab title preview topics on hover/keyboard focus and keep a clicked title selected; without a selection they follow the reading position. The tab title includes the owner's name. The header remains visible on mobile. Topic titles use native buttons. A COBE 2.0.1 globe provides blue neon connections from Colombo, smooth topic orientations, and scroll movement. The connections are illustrative, not client/work-history claims. A short downward entrance staggers the content, and supported browsers transition the globe between static documents. The footer switch and reduced-motion preference apply to these additions.

COBE loaded and rendered successfully in the browser. Hover rollback, click persistence, keyboard tab selection, scroll-driven labels, and motion pause were checked. CDN/WebGL failure and context restoration were reviewed in code; those failure states were not forced in the browser.

The portfolio has **Home, Projects, Coursework, About, and Contact** pages. Projects contains five independent builds; Coursework contains three academic studies with security, data + AI, and systems filters. Navigation follows the page URL. The homepage now has two interest tabs: **Cybersecurity** and **Data Science + AI**.

The latest pass removes repeated introductions, decorative microcopy, the separate featured section, end-of-page prompts, FAQs, and duplicated project explanations. Main mobile body text is 16–17px; tabs and primary controls have larger type and touch targets. Extra project context stays inside native Details disclosures. All phone project layouts use one column.

Cybersecurity retains Ghost Fibers and dimensional text. The combined data/AI scene adapts React Bits Particles into a synthetic point cloud with three predefined clusters. Anime.js 4.1.3 animates the transition, loading from a pinned CDN module only when that tab opens. The browser successfully loaded the module. This stays a static site; a local tween handles CDN failure and SVG handles unavailable WebGL. Those failure paths were reviewed in code, not forced in the browser.

A small motion switch lives only in the footer and persists across pages; system reduced-motion settings take priority. Three slow blue glow layers animate behind every page. Browser APIs replace Framer Motion. Button backgrounds are explicitly reset, and screen-reader-only labels have a local CSS rule instead of relying on absent utility output.

Current verification:

- Production build and both generated-page checks pass. All five documents have unique titles/canonical URLs, page-specific descriptions/social URLs, valid bundled assets, and sitemap entries. CI runs these checks before deployment.
- All five pages remeasured at 320, 390, 768, and 1440px after the copy/type changes. No horizontal page overflow or overflow in the checked headings, cards, tags, tabs, filters, email, background/skills panels, or footer controls. Main paragraphs measured at 16–18px.
- Data scene checked at 320px and desktop. Its cluster/scatter control and Home/End tab navigation work; Anime.js loaded successfully. Project systems and coursework data + AI filtering were checked.
- Footer switch works by pointer and keyboard, pauses the blue glow, and retains its setting across full-page navigation. Header has no motion control.
- Mobile navigation verified for Escape focus restoration and navigation to another page.
- Initial JavaScript is approximately **184 kB / 59 kB gzip**, plus **4.2 kB / 1.9 kB gzip** for the globe wrapper and **5.4 kB / 2.6 kB gzip** for the lazy data scene. CSS is approximately **34 kB / 9 kB gzip**. External COBE and Anime.js downloads are additional and excluded from Vite's sizes. These are artifact sizes, not runtime speed measurements.
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
