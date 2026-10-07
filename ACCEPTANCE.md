# Portfolio acceptance record

Observed on **7 October 2026**. This records local implementation acceptance, not owner design sign-off or live GitHub Pages publication.

## Request and interpretation audit

The 6 October request was for ongoing/completed project status, a resume download button, a subsection-first landing page instead of a top bar, a side hamburger opening section links, and animations following that flow.

The initial folder inspection was read-only. Re-reading the conversation shows the single-page/side-menu interpretation and the decision not to publish an unapproved Downloads PDF were stated before implementation. The first feature commit, `389dec8`, was rechecked against the request. Its section layout, lifecycle model and conditional resume controls remain consistent with that interpretation. Its subsequently discovered deep-link/focus defects were repaired in `405d57e`, not dismissed as test failures.

Choices that were inferred rather than specified by the owner:

- Work in the local `uthsarad.github.io` repository. Do not assume permission to publish this branch.
- Put the desktop rail on the left and use a floating top-left hamburger on mobile.
- Order the chapters as Introduction, Interests, Projects, Coursework, About and Contact. Retain standalone routes for old links.
- Interpret animation flow as normal scrolling, gentle reveals, reading progress and section-driven scene movement, not scroll-jacking or a full black-hole trip for every chapter.
- Add a lifecycle filter as a useful extension to badges and apply the same model to coursework.
- Keep unknown lifecycle data explicit. `Private`, `Usable` and course identifiers do not establish completion.
- Require an owner-approved PDF rather than silently publishing a discovered private document.

No career facts, project descriptions or repository availability were invented to resolve those choices.

## Actual acceptance path and evidence

The current application was exercised at `http://127.0.0.1:4173`, served from this repository's real production build. Application source `405d57e` is identical to the application in observed HEAD `054b303`; the later commit changes a test and review documentation only. No application source was changed during this acceptance follow-through.

System Chrome **154.0.8037.95**, using the installed Playwright cache and real SwiftShader WebGL2, drove the actual controls. The fresh runs did not copy the current app, supply synthetic content, intercept network requests, replace scrolling/animation APIs or force application state. Actions included native menu clicks, status selects, category buttons, wheel input, keyboard input, history, reload, footer links and a JavaScript-disabled browser context.

`ACCEPTANCE.json` preserves named observations, native animation samples, targeted probes, integration failures, historical comparison and prior edge checks. Raw reports, drivers and inspected screenshots are in `%TEMP%/portfolio-public-acceptance/fresh-20261007-0410/`; their report/driver hashes are recorded in the JSON. Earlier final-source reports remain in `portfolio-sections-committed` and `portfolio-renderer-followthrough` under `%TEMP%`.

## Each explicit requirement

| ID | Request | Concrete check and observed result | Outcome |
|---|---|---|---|
| R1 | Ongoing/completed project status | Actual card badges read NeOS **Ongoing**, mEgis **Ongoing**, FerrumCalc **Completed**. Native Ongoing selects exactly NeOS/mEgis; Completed selects exactly FerrumCalc. Unknown selects Museek/hsfix. All restores five. Coursework's three unknown badges were also read. See JSON observations `all project names and literal badges`, `native project status ongoing/completed/unknown/all`, and `coursework literal badges`. | Mechanism accepted locally. Binary classification of every entry is **not complete**: two personal projects and three coursework entries lack confirmed owner data. |
| R2 | Resume download button | Actual introduction, drawer and contact buttons were reached through the real UI. All are disabled and each unique `aria-describedby` resolves to `Resume PDF is not available yet.` There are zero download anchors. Actual `/resume.pdf` returns **200 text/html**, 50,884 bytes, not `%PDF-`; `public/resume.pdf` is absent. See the three `disabled resume` observations and `actual GET /resume.pdf`. | Missing-file behavior accepted. A genuine owner-resume download is **blocked**, not passed. |
| R3 | Subsection-first landing page | Actual root has six ordered direct sections, one H1, five section H2s and eight articles. The same content is present with JavaScript disabled. Actual About/Contact content and project Details expansion were observed. See `initial desktop structure`, `native no-JS content`, `actual project Details`, and profile/contact observations. | Accepted locally under the documented chapter-order interpretation. |
| R4 | Side hamburger instead of top bar, opening specific sections | Old `.site-header` is absent. The real desktop rail measures x0/y0/88px wide/1000px tall. Hamburger is visible at desktop and at 390px/320px widths, where it measures 48x48px at x16/y16. All six real drawer links keep pathname `/`, set the expected hash, focus a visible destination and retain the canvas. See `native drawer <id>`, `supplement.railCandidates`, layouts and targeted observations. | Accepted locally. |
| R5 | Animations follow the section flow | Real wheel input traversed all six chapter labels/numbers with advancing inline progress and changing scene matrices. Native reveal keyframes show opacity 0 to 1 and translateY(24px) to 0. Motion-on anchor samples include intermediate scrolling. A targeted MutationObserver recorded **no transit mutations** for all six actual menu links, with the same canvas throughout. Paused and reduced-motion probes explicitly start at Y0, target a section 1526px away and reach Y1502 immediately with no reveal animations. | Accepted locally under the documented non-scroll-jacking interpretation. |

R2's earlier synthetic PDF test verifies only mechanics: a non-PDF header was rejected and five native fixture downloads retained the configured filename and bytes. That isolated copied snapshot **does not replace** the actual blocked R2 acceptance path above.

## Concrete before/after improvement

A historical `09e9086` archive was built separately with the existing dependencies and observed in Chrome. It is a **comparison baseline only**, not the current acceptance target. The after observations use the actual repository preview on port 4173. Both comparison sessions had no uncaught page errors or failed requests; their own browser and baseline server were closed afterward.

| Public behavior | Before, historical UI | After, actual repository UI |
|---|---|---|
| Landing structure | Two direct chapters, `hero` and `explore`, with zero project/coursework articles on home | Six direct chapters and eight readable articles on home |
| Primary navigation | Full-width 1440x79px top header with five page links | No top header, left 88px rail and a section drawer |
| Projects action | Real menu link moved to `/projects/` and produced `ingesting`, `swapping`, `emerging` | Actual drawer link stays on `/#projects`, focuses the section and produces no transit mutations |
| Status presentation | Existing `In progress`/`Complete` badges mixed with `Private`/`Usable`; no status select | Requested Ongoing/Completed wording, lifecycle separated from context, exact status filtering |
| Finding a lifecycle subset | No native lifecycle selector on the old Projects page | Ongoing yields two specific projects, Completed yields one, category intersections work independently |
| Resume availability | No download control | Three clearly explained disabled controls and an approved-PDF activation path. **Still no genuine downloadable resume.** |

The improvement is the requested reading/navigation and filtering behavior, not a claim of faster loading or completed resume delivery. Current initial home JavaScript is 66,742 bytes gzip. The 70k home budget accommodates embedded sections; artifact-size checks are not Core Web Vitals.

Comparison data and inspected before/after desktop screenshots are under `%TEMP%/portfolio-before-09e9086-20261007-0420/`. The comparison is also preserved in `ACCEPTANCE.json`.

## Trace for every changed public output

| Changed output / integration | Check | Observed result and evidence |
|---|---|---|
| Six-chapter home, heading hierarchy and local targets | Actual root DOM, disabled-JS root and static generated HTML | Exact six IDs, one H1, five H2s, eight articles, no broken same-document targets. JSON structure/layout and no-JS observations; generated-page readable-HTML and home-section tests passed. |
| Desktop rail, mobile opener and native drawer | Real click, modal keyboard/inertness checks, screenshots and bounds | Left rail replaces top bar. Initial focus inside, Tab never reaches a background control, background focus rejected, Escape restores opener focus, backdrop/close/rapid reopen work. JSON prior section `checks.drawer` and fresh screenshots/bounds. |
| Lifecycle labels, repository/course context and result counts | Read literal badges, select each lifecycle, use both category groups | Exact 2 ongoing/1 completed/2 unknown personal-project results. Private/Usable/course context not converted into lifecycle facts. Named lifecycle observations and source-backed static badge test. |
| Composed filters and independent collections | Systems+Ongoing, academic Data+AI+Unknown, academic Completed and reset | Only NeOS in the first intersection while three studies remain. Only osteoporosis study in the academic intersection while NeOS stays selected. Completed academic combination gives `0 studies` plus an explanatory empty message. Prior checks also exercise Systems+Unknown empty project announcement and restore 5/3. |
| Introduction/drawer/contact resume controls and notes | Actual native controls, described-by targets, public asset request | All three disabled, distinct note IDs, zero download anchors; real response HTML/non-PDF. Genuine download blocked on the missing approved file. |
| Scene drift, chapter label/number and reading progress | Seventeen real wheel samples and canvas identity | Hero through Contact observed with matching chapter names/numbers, changing scaleY progress, unchanged canvas. Projects matrix includes scale .87/translation -127.2,66.25; Coursework scale .96/translation 63.6,-66.25. JSON `real wheel reading flow`. |
| Entrances, smooth anchors, pause and system reduced motion | Native keyframes and scroll positions, real footer toggle/reload, targeted nonzero-distance probes | Opacity/vertical entrance observed, motion-on intermediate positions, pause survives reload, paused/reduced start Y0 and reach Y1502 immediately with zero reveal animations. JSON motion observations and `targeted`. |
| Embedded Interests controls | Click both actual tabs and press ArrowRight | Selection/panel reverse correctly: cybersecurity caption then data-field caption and Shift field control. ArrowRight selects/focuses the second tab. Root/hash/canonical remain appropriate. JSON `additional`. |
| Reading-topic tab title and canonical | Neutral pointer, actual Projects heading hover, pointer leave | Resting `FerrumCalc` title previews `Projects` on hover and restores FerrumCalc on leave. Home canonical stays the root URL. Standalone renderer observation separately preserves exact Projects canonical. No forced title state. |
| Deep links, retained standalone routes, focus/history | Real `/projects/` drawer About, reload, Back, Forward; prior direct `/#projects` and each retained route | Root `/#about` is visible/focused at Y5245 after reload; Back returns standalone main at Y0; Forward returns focused About at Y5245. Prior route checks cover Projects/Coursework/About/Contact and exact root section alignment. |
| Secondary footer section links and Back to top | Click all five changed native footer links and the real `#top` link | Correct hashes, focused visible sections, same canvas. Back to top reaches Y0. JSON `footer`. Initial probe invented a nonexistent `/#hero` footer link; that test-only assumption was corrected to the real unchanged `#top` target, with no app change. |
| No-JS navigation, content and disclosures | Real browser with JavaScript disabled, native fallback summary/Contact link, all eight native Details summaries | Eight prerendered articles and all six section links remain. Contact native hash is reached and focused. Every personal-project and coursework Details disclosure opens with readable text while page JavaScript is disabled. JSON `noJsDetails`; prior no-JS case exercises all six anchors. Dynamic scene/progress and JS filters are not claimed without JavaScript. |
| Hero/mobile copy spacing and localized visual protection | Canvas-ready screenshots at 1440/390/320 and actual rendered text | Word spacing and natural narrow-screen wrapping are visible, text/controls are not horizontally clipped, scrim has no hard rectangular edge. Inspected screenshots. This is a visual observation, **not measured contrast conformance**. |
| About/Contact profile, repository and protocol links | Rendered href/text inspection without OS side effects | Correct existing LinkedIn/GitHub/mailto links and profile content are present in their new home sections. No email sent or system clipboard overwritten. Actual email-client/clipboard workflows were not exercised or claimed. |
| Static documents, canonical metadata, sitemap, preload reachability and bytes | Re-run actual `npm run check:pages` against repository dist | Deployable five-page documents, unique metadata, valid assets, static404/sitemap, readable HTML and bounded reachable dependencies all pass. Shared/standalone/HTML budgets unchanged. No dependency added. |
| Retained trip engine and renderer recovery | Existing complete final-source renderer run | Each named navigation/Escape/history/Back-mid-trip/rapid/motion-switch/reduced-motion/mobile/context-loss/missing-assets scenario passed. Temporary legacy anchors in that stress driver exercise the engine, not replace the new actual-menu acceptance. JSON `rendererChecks`; raw report retains recovery diagnostics. |

## Integration boundaries, constraints and stopping point

Fresh normal-network Chrome observations loaded the used Inter and JetBrains Mono faces with no remote-font failures. A stable fresh JS/canvas-ready supplement and the before/after comparison recorded no failed requests. The broader multi-context observation also retains four local `.dat` aborts and five module requests marked `csp`. Navigation/teardown and disabled JavaScript are plausible explanations, but their phase attribution was not logged, so those causes are not asserted as proven. There were no uncaught page errors or HTTP >=400 responses in that fresh run. Earlier section tests deliberately blocked remote fonts; they are not presented as external-font integration evidence.

A follow-through using tracked `scripts/check-public-network.mjs` recorded the missing phase boundaries against the actual production preview. Each initial browser document matched the corresponding repository `dist/` bytes exactly. The final run, **04:52:46 to 04:53:33 UTC on 7 October 2026**, passed five settled workflows: desktop, 390px, 320px, system reduced motion and disabled JavaScript. Every settled context had zero pending requests at closure. All six desktop drawer links, standalone-to-home navigation and all eight no-JS disclosures were exercised. Used desktop Inter and JetBrains Mono loaded. Five exact modulepreload requests marked `csp` started and failed only in `no-js.load`. The settled JavaScript-enabled workflows had no failed requests, and the complete run had no HTTP >=400 or uncaught page errors. The separate early-close reduced-motion case is **BOUNDARY_OBSERVED**, not a completed-network pass: two font requests remained unfinished at closure. No `.dat` abort was reproduced. These fresh observations do not prove the unrecorded phase of the older four `.dat` aborts, which remain preserved above and in the JSON.

The first source-bound follow-through runner incorrectly waited for a ready canvas under system reduced motion and timed out. Independent review identified the existing renderer's deliberate reduced-motion early return. Only that new test expectation was fixed: under system reduced motion, the application's motion state must be off with renderer readiness false and usable native UI/network. No application state was forced and no app defect or app repair is inferred from that failed test. Driver/report hashes, source document hashes, exact scenario outcomes and failed-run chronology are recorded in JSON `networkPhaseFollowthrough`. Raw final evidence is `%TEMP%/portfolio-network-phases-20261007-0452/network-phases.json`. Invalid URL setup was separately checked to retain a fresh finished FAIL without browser/network actions.

The native browser bridge was unavailable. Verification used actual installed Chrome headless instead, not a mocked browser or copied current application. Viewport/touch emulation and software WebGL are not physical-device or hardware-GPU performance tests.

Authorized local code and UI validation are complete. The overall owner outcome is **not fully delivered**:

1. An approved resume PDF is still needed for a genuine public download. Do not replace that requirement with the synthetic fixture or publish a private document without approval.
2. Museek and hsfix still need owner lifecycle confirmation if all personal projects must be strictly ongoing/completed. The three coursework lifecycle values are also unconfirmed if that optional extension is to be populated.
3. No push or deployment was performed by this workflow. The currently live GitHub Pages version was not verified in this acceptance pass.
4. Owner aesthetic approval, physical-device performance, Core Web Vitals and measured contrast conformance remain unverified.

These are recorded constraints, not implicit test passes. No additional source repair was indicated by the observed public acceptance paths, and no owner-input request or publication action was taken during this follow-through.

## Content approval-readiness continuation, 7 October 2026

The later continuation at local HEAD `64a072c` did not change application source or supplied owner facts. It repaired test assumptions that would reject legitimate future lifecycle approvals or fail to notice stale resume bytes. An independent literal TypeScript AST oracle reads declarations without executing code. Static checks validate all resume controls on each generated route, matching configured native download filenames with proper HTML escaping and exact public-to-built PDF bytes. The PDF check verifies signature and byte identity only, not full semantic validity or approval. Nine in-memory contract regressions are explicitly harness evidence, not replacement lifecycle facts or a personal resume.

A fresh production build and **5/5 generated-page checks** passed, along with **9/9 contract regressions**. A read-only reviewer exposed escaped filename, hidden result and `data-download` false-pass issues in the initial test edits. Those were repaired and negative checks retained. The local GitHub Actions workflow now runs `check:content` before artifact upload. No remote pipeline or deployment was run.

The actual production preview passed **6/6** native Chrome section workflows from **10:05:32.562 to 10:08:50.984 UTC**: desktop, 390px, 320px, reduced motion, JavaScript disabled and retained routes. Each of four JavaScript-enabled landing scenarios checked all **28** category/lifecycle combinations against declared IDs, visible titles/badges and exact result counts, including **nine** empty combinations and independent opposite controls. All restored five personal projects and three studies. The raw report preserves **112** native filter selections, empty uncaught-page-error arrays, and retained resource console messages. This runner deliberately blocks remote fonts and logs native scrolling calls, so it does not replace the earlier normal-network evidence or establish physical-device performance.

All four resume observations still report zero download links, three explained disabled controls and **200 text/html without a PDF signature**. `nativeDownloadTransferExercised` remains false. The real approved-PDF branch was not exercised in this continuation, and the earlier synthetic download mechanics do not unblock the owner requirement. A separate **10:09:39 UTC** HTTP probe matched all five served documents exactly to current `dist/` bytes. That probe is post-run identity evidence, not retrospective browser-request instrumentation.

The report is `%TEMP%/portfolio-content-readiness-20261007-1005/report.json`, SHA256 `d38078989368692f1a5cd0f79596e7712c36059f806f1f1c498373e7823e297c`. `ACCEPTANCE.json.contentReadinessFollowthrough` records the bounded summary, browser-driver hash, final static-guard hashes and document identities. An approval form was offered earlier in this continuation but has supplied no approved PDF or lifecycle choices. No private PDF was copied, no lifecycle fact was invented, and no publication was performed. The overall owner outcome remains **not fully delivered** for the same two content blockers.
