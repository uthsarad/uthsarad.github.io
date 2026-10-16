# Startup and cancellation follow-up: 2026-10-16

## Scope and outcome

The request is to continue the portfolio work, including the other pages, while retaining the black/blue/white space treatment and the original under-two-second page-load target. The arrival animation is our interpretation of the space-themed load, not a replacement for total loading performance.

This follow-up changes tests and documentation only. No application source, timing, CSS, content, visual assets, dependencies or renderer behavior changed. The final published browser suite reports **21 passed, 1 failed, 0 blocked**. The remaining failure is desktop arrival completion at **2215.8ms**, above the unchanged **2000ms** limit. This is not an overall performance pass.

The settled whole-result audit is recorded in `WHOLE-RESULT-2026-10-15.md`, committed as `fd662ca`. The published application still uses the reading-protection CSS from `c3749cd`. The final other-page checks exercised 16 route/profile cases, 112 filter combinations, nine navigation cases, nine paired reading checks, and 36 settled home-section hops across six profiles. These functional/reading outcomes do not certify an under-two-second load on every route.

## Why no runtime styling experiment was shipped

Three local diagnostic series used fresh Edge processes, cold cache, the same stylesheet interception in both arms, untouched fonts, no CPU throttling and the same software GPU. Each series alternated order across three paired rounds for home and Projects. Times below are navigation-relative milliseconds, in round order. These are diagnostic interventions, not public normal-network acceptance or field p75 evidence.

| Intervention | Home baseline FCP | Home intervention FCP | Home baseline first hidden | Home intervention first hidden | Projects baseline FCP | Projects intervention FCP |
|---|---|---|---|---|---|---|
| Remove nav blur | 1480, 1896, 1364 | 1480, 1320, 1364 | 2096.9, 1907, 1809.9 | 1957, 1888.3, 2036.5 | 2224, 2160, 2412 | 2060, 2052, 2064 |
| Pause shiny text | 2104, 1352, 1320 | 1228, 1348, 1392 | 2162, 2195.7, 1660.5 | 1714.5, 2022.8, 2130.5 | 2056, 2372, 2572 | 2008, 2088, 2040 |
| Combine both | 1440, 1804, 1320 | 1604, 1556, 1320 | 1937.9, 1931.1, 1664 | 2214.1, 2239.4, 1849 | 3836, 2856, 2840 | 2464, 2272, 2088 |

Projects sometimes improved, but none of these arms established the required bound. Home completion was mixed or worse. These observations do not justify permanent style removal, claiming a root cause, or increasing an absolute startup timeout.

Raw reports under `%TEMP%`:
- `portfolio-blur-isolation-20261016/report.json`
- `portfolio-paused-shine-isolation-20261016/report.json`
- `portfolio-deferred-effects-isolation-20261016/report.json`

## Exact cancellation proof, not a broad abort exemption

Source review shows that `BlackHole.tsx` owns the candidate renderer before awaiting `loadAll`, and motion-effect cleanup disposes it. `webgl.ts` owns an AbortController shared by its resource fetches, including the noise texture, and disposal aborts that controller. Generation guards prevent stale readiness from replacing the current state. This supports an intentional cleanup mechanism but does not retrospectively prove the cause of the older untimestamped production abort.

The new `pause-during-noise-load` case uses the actual published page and actual Visual animations switch. It deliberately holds only the initial noise request. A transparent fetch wrapper keeps original arguments, signals and rejection behavior. Before pause it requires exactly one matching fetch, a live original signal, the exact held Playwright request object and not-ready state. It then observes the original signal abort after the pause begins and that exact browser request fail. While paused, fallback opacity remains one and readiness remains false across a rendering opportunity. Resume must create exactly one new fetch with a distinct positive signal identity, start after resume, fulfill, and reach actual `data-ready=true`. The document token remains unchanged and the arrival stays hidden.

Only this injected case may exempt one individually correlated initial-generation cleanup abort. Every raw failure remains in the report. Same-URL failures without proof, wrong IDs or generations, unrelated aborts, resumed-generation aborts and all first-party HTTP errors remain fatal. Both motion cases must finish with an empty request ledger and an observed 500ms quiet interval, bounded by 15 seconds. This is bounded settlement, not proof against arbitrarily later requests.

The independent pause/resume/history case now waits for renderer readiness before pause and after resume. It is not substituted for the pending-fetch race case. The classifier has 62 passing built-in Node tests, including negative and non-mutation checks. These are unit evidence, not a browser/GPU substitute.

### Final public race observation

Report: `%TEMP%/portfolio-cancellation-final-public-20261016/space-refresh.json`.

- Initial fetch ID 1, signal ID 1 started at 4815.6ms. Pause began at 5189.8ms. The original signal aborted at 5648.6ms and the original fetch rejected with `AbortError`.
- The exact held browser request ID **21** failed with `net::ERR_ABORTED`. Exactly this one failure was retained and classified as expected.
- Resume began at 6360.6ms. New fetch ID 2, signal ID 2 started at 7732.5ms, fulfilled, and renderer readiness was asserted.
- Both motion cases recorded pending count zero, 500ms quiet, no pending requests at close, no page errors and no first-party HTTP errors. The independent history case had no failed requests.
- The earlier local two-case experiment also passed, but the hardened final public run is the acceptance evidence. Holding a request makes this failure-path evidence, never loading-performance evidence.

## Requirement-to-observation map on final output

| Requirement / changed output | Concrete final check and observed result |
|---|---|
| Desktop arrival finishes before 2000ms | **FAIL**: first visible 1092.1ms, still visible at 1926.9ms, first fully hidden sample 2215.8ms. Desktop FCP/LCP in this same navigation were 1856/1856ms. Frame sampling is not every compositor frame, so exact physical disappearance between samples is unknown. The conservative bound remains failed. |
| Mobile and narrow arrival bound | **PASS**: first hidden 1795.4ms at 390px and 1626.3ms at 320px, remaining hidden at the later check. |
| Cold-cache content paint without interaction/interception | **PASS for these samples**: unthrottled desktop FCP/LCP 680/680ms, 4 Mbps with 40ms latency mobile 768/784ms. Latest LCP candidate observed through five seconds was the retained blue fallback image. These are single navigations, not universal guarantees. |
| Optional decorative work stays after paint and startup floor | **PASS**: normal voyage/WebGL/model imports began at 2699.2/2699.6/2699.8ms, after 680ms FCP. Throttled imports began at 2556.9/2557.4/2557.5ms, after 768ms FCP. Observed physics requests followed. |
| Motion cleanup does not produce stale readiness or poison resume | **PASS**: exact original-signal abort and distinct successful resumed generation described above, with empty settled ledgers. |
| Pause/history do not replay arrival | **PASS**: ready-renderer pause/resume, same-document token, hidden arrival and history controls exercised. |
| Motion preference, deep link, disabled animation and missing assets do not trap content | **PASS**: reduced, paused, hash, standalone, animation-disabled, no-JS, entry-blocked and delayed-CSS cases. |
| Real input and navigation remain available | **PASS**: pointer, touch, keyboard and client navigation cases. Actual BFCache case also passed, not a synthetic event. |
| Black/blue fallback and contrast remain intact | **PASS**: existing blue-fallback and computed contrast cases. Moving-image/pseudo-element reading review remains the separate paired screenshot evidence in the whole-result audit. |
| Build/prerender/content/scheduler/classifier outputs | **PASS**: production TypeScript/Vite/SSR/prerender build, 5 page checks, 14 content/settlement checks, 23 startup scheduler checks, 62 cancellation classifier checks, syntax check and `git diff --check`. Graphify AST update completed. |

The browser command correctly exited **1** because the aggregate suite failed one timing assertion. This was not a production build failure. No thresholds were relaxed and no reruns were used to erase that failure.

## Historical limitations retained

The Oct15 strict run remains 19/21 with its original desktop and request failures. Its 2627.3ms first-hidden frame sample was conservative: a `pageshow` observation at 1622.2ms already reported the arrival hidden. Therefore that report cannot prove the overlay stayed physically visible until 2627.3ms. Its FCP of 2460ms still exceeded two seconds independently. The older noise abort lacks controller/request timing correlation and remains historically unproven, even though the new injected case proves a real intentional cancellation path.

Other retained counterexamples include Oct15 Projects desktop FCP/LCP 2928/3212ms, an earlier Projects mobile 2536/2536ms and About 21416/22064ms. Later faster runs do not erase them. The broader under-two-second requirement is unresolved, and no runtime performance improvement is claimed from this test-only follow-up.

An approved resume PDF is still absent. Unconfirmed project statuses remain explicit. Contact checks cover links and permission-denied clipboard feedback, not permission-granted copying or sending an email.

## Publication

Pending publication of this test/documentation follow-up. Runtime bytes should remain identical to the verified application build. Deployment and byte checks will be recorded after publication.
