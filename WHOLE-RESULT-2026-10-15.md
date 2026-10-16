# Whole-result requirement audit, October 15, 2026

## Intent recovered before this review

The original user request (conversation turn 359) asked for a space-themed page load under two seconds, fitting the black-hole theme, with a more contrasty, mostly neutral black/blue/white palette and one main blue. A brief arrival animation was our implementation interpretation. It must not be substituted for the broader page-load requirement.

The later request, "check on the other ones as well", was interpreted as the other portfolio routes and home sections, based on the surrounding portfolio work. It was not interpreted as permission to audit unrelated repositories. The work performed before this interpretation was explicitly recorded was checked again against that scope: Projects, Coursework, About, Contact, the six home sections, their navigation, controls, responsive layout and visible theme. No unrelated project was changed.

This review exercises the final deployed application, including work done before the final feedback map existed. The application is still commit `c3749cd`; subsequent commits are documentation only. No timing budget, GPU option, network condition or application code was changed for this rerun.

## Whole-result executions

Reports were inspected independently. The serial command intentionally continued after failures so that later workflows would still run. Its final process exit code of zero is **not** an all-suite pass.

| Actual browser workflow | Result | Evidence directory under the system temporary directory |
| --- | --- | --- |
| Unchanged strict space/startup suite, real BFCache enabled | **19/21 PASS, 2 FAIL, 0 BLOCKED** | `portfolio-whole-space-20261015/space-refresh.json` |
| Full combined navigation suite | **9/9 PASS** | `portfolio-whole-navigation-20261015/report.json` |
| All four standalone routes over all four profiles | **16/16 functional PASS**, 112 native category/status combinations | `portfolio-whole-routes-20261015/report.json` |
| Six home profiles with all six native section links | **6/6 PASS**, 36 hops | `portfolio-whole-home-20261015/report.json` |
| Final reading protection and select/copy controls at 1440/390/320 pixels | **9/9 PASS** | `portfolio-whole-reading-20261015/report.json` |

The home runner's first visibility check allowed screenshots during smooth scrolling. Those screenshots are not treated as proof of a settled composition. A strengthened follow-up requires the destination heading to be fully visible and section position to remain within two pixels over three successive samples. Its result is recorded below after completion.

## Explicit request and changed-output traceability

| Request or changed public output | Concrete acceptance observation | Result and limits |
| --- | --- | --- |
| Mostly neutral black, blue and white; one main blue | Live `contrast` scenario reads actual computed palette tokens, role checks and text samples in content and navigation | PASS. Background `#070809`, main blue `#4c8dff`, text `#f5f7fb`. Every tested token classified as neutral or the same blue hue. This is the final public CSS, not a source-only check |
| More contrasty readable content | Live solid-ancestor foreground/background measurements | PASS for sampled text: minimum 6.262:1, body copy 10.413:1, project title 17.475:1. These calculations do not represent sibling images, canvas pixels or every text node |
| Black-hole-compatible blue/white fallback, without double tint | Live `blue-fallback` decodes the actual same-origin image into a canvas and samples pixels and computed filters | PASS. 960x600, 49,543 blue-classifier pixels, zero warm-classifier pixels. Wrapper and fallback filter `none`; live canvas retains the intended filter. This establishes final color behavior, not a quantified before/after hue preference |
| Space-themed arrival does not cover content beyond two seconds | Live `startup-1440`, `startup-390`, `startup-320`, navigation-relative first-visible/first-hidden sampling | **Desktop FAIL: first fully hidden observation 2627.3ms.** Mobile 390 PASS at 1698.4ms, 320 PASS at 1607.4ms. A 1.25-second CSS duration and 1.6-second deadline did not guarantee observed desktop completion in this run |
| Initial home desktop page paint under two seconds | `paint-normal-cold`, cache disabled, no input, no request interception, five-second observation | PASS for this sample: FCP1112ms, image LCP1144ms. Browser/software-GPU process was already warmed by preceding scenarios. Not a universal cold-process result |
| Initial home mobile page paint under two seconds | `paint-fast4g-cold`, 390px, 4Mbps and 40ms, otherwise the same observation method | PASS for this sample: FCP1152ms and image LCP1152ms. FCP/image LCP alone do not prove text beneath an opaque intro was readable at that instant |
| Actual optional voyage, renderer imports and physics requests stay after first content paint and the 2500ms minimum | Both paint cases inspect actual resource timings and require a voyage request | PASS. Desktop voyage/WebGL/model began at 2778.5/2779.1/2781.1ms, after FCP1112ms. Mobile began at 2534.1/2534.7/2534.8ms, after FCP1152ms. Observed physics requests were later. This checks scheduling, not complete renderer readiness below two seconds |
| No artificial wait for hydration or trapped input | Real pointer/touch/keyboard interaction while arrival is visible | PASS. Input events at 1137.0/1032.7/992.0ms dismissed the intro and opened the actual menu. Intro is outside the React root, aria-hidden, with pointer events disabled in sampled visible frames |
| Saved pause, reduced motion, deep link, standalone pages and animation failure never replay arrival | `paused`, `reduced`, `hash`, `standalone`, `animation-disabled` | All five PASS with no observed visible intro. Separate motion/navigation checks also PASS |
| No-JavaScript and entry-failure content/navigation remain available | `no-js`, `entry-blocked` use actual native Projects links; entry blocking is deliberately injected and counted | PASS. Entry failure injection blocked six scripts; native links still reached `#projects`. Expected no-JS modulepreload CSP failures are retained and classified, not hidden |
| Stylesheet delivery must not create a late arrival | `css-slow` deliberately delays first-party CSS2300ms | PASS, no observed visible intro after2000ms. This is an injected failure-path check, not normal-network performance evidence |
| Motion pause/resume and history never rearm the arrival | `pause-resume-history`, `client-navigation`, `actual-bfcache`, plus separate navigation suite | Same-document token and no-replay assertions completed. Client navigation and actual BFCache PASS, including persisted pageshow with hidden arrival. **The pause/history scenario still FAILS overall** because a first-party `noise_texture.png` fetch reported `net::ERR_ABORTED` during its workflow. Cancellation may be related to motion cleanup, but causality is not established and the failure was not reclassified or suppressed |
| Latest filter/contact protection actually changes the reading region | Paired same-page public screenshots, removing only the new pseudo-element for the ablation; restored before real controls are exercised | 9/9 cases PASS. Compared Coursework390 protected/unprotected images: the bright white disk immediately below the toolbar is locally darkened with protection while the blue rim remains visible outside it. Earlier normal-network screenshots showed the moving disk behind labels/helper. This is a visual comparison, not a pixel-identical or quantified WCAG proof |
| All other public pages retain content, metadata, palette, native controls and navigation | Every route/profile in the matrix below, real category buttons, select, Details, drawer-to-home destination focus and browser Back | All16 functional PASS. All pages have expected heading, canonical/description and article counts, with no overflow or arrival replay. Contact mail/social destinations and clipboard feedback checked without sending mail or changing the user clipboard |

## Every final standalone route/profile paint observation

Functional acceptance and timing acceptance are separate. Profiles use1440 desktop,390 mobile,320 narrow and390 mobile4Mbps/40ms. HTTP cache is disabled, no CPU throttle or request interception is used. Each sample uses a new browser context in a shared software-GPU browser process. All values below are milliseconds.

| Route | Desktop FCP/LCP | Mobile FCP/LCP | Narrow FCP/LCP | Mobile4Mbps/40ms FCP/LCP | Native filter combinations |
| --- | --- | --- | --- | --- | --- |
| Projects | **2928/3212, FAIL2s** |1432/1448|952/968|1156/1172|12 per profile,48 total |
| Coursework |1708/1756|1256/1276|1000/1020|1276/1276|16 per profile,64 total |
| About |1120/1120|988/1004|1028/1028|1124/1124|Not applicable |
| Contact |1304/1304|1244/1260|952/968|1088/1124|Not applicable |

The earlier public Projects mobile2536ms and severe About desktop21416/22064ms remain in `OTHER-PAGES-2026-10-15.md`. Faster later samples do not erase them. The final full-profile matrix now covers the actual final CSS, replacing the earlier limitation that the112-combination matrix was only run on a broader candidate.

## Outcome, rather than aggregate counts alone

The contrast and other-page functionality are verified on the final public application, including the earlier work. The overall under-two-second promise is **not met consistently**: this whole-result run has a2627.3ms desktop arrival completion and a2928/3212ms Projects desktop paint. The strict space suite is not green. The pause/history fetch abort also remains recorded as a separate acceptance failure. No repair for those variations is established by this audit.

The optional physical scene intentionally becomes ready after the readable fallback. A fully loaded, animated multi-megabyte physical renderer under two seconds was not demonstrated and must not be implied by faster FCP results.

The approved resume PDF is still absent, lifecycle statuses remain unconfirmed where shown, clipboard success with granted permissions was not exercised, and checks use Edge emulation rather than physical phones or cross-browser field data.

## Settled home follow-up

The strengthened run completed on October 15, 2026 at 06:54 UTC: **6/6 profiles PASS and 36/36 section hops PASS**, including 320px no-JavaScript navigation. Every destination heading was fully visible after scrolling settled, and JavaScript destinations retained focus. No horizontal overflow or application exceptions were reported. Evidence: `portfolio-whole-home-settled-20261015/report.json`. Earlier during-scroll captures remain retained rather than overwritten.
