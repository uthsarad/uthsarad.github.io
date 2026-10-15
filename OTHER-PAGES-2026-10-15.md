# Other portfolio pages verification, October 15, 2026

## Request and change

Checked Projects, Coursework, About, Contact, and all six home sections. On the public site, the bright decorative disk washed out mobile collection filter labels and the contact resume explanation. Extended the existing local feathered reading scrims to `.work-toolbar` and `.contact-section .button-row`. The contact scrim follows its content width rather than the whole container. The scene remains visible between blocks. No content, animation timing, renderer, fonts, dependencies, or resume availability changed.

## Requirement-to-observation map

| Requirement | Actual end-user check | Observed result |
| --- | --- | --- |
| Other standalone pages render correctly | Browser visits to all four routes at 1440, 390, 320 pixels and mobile 4 Mbps/40 ms, normal requests | HTTP 200, one main heading, expected metadata and article counts, correct palette, no horizontal overflow or arrival replay |
| Collection filters and details work | Native category buttons and status select, compared with source content; native Details | 112 combinations passed across four profiles, including empty states, plus Details. This complete matrix used the first, broader CSS candidate. Final CSS only narrowed the protection selectors |
| Navigation and contact behavior work | Actual drawer links to matching home sections, destination focus and browser Back; mail/social destinations, clipboard feedback and disabled resume | All 16 route cases passed in the broader candidate run. Clipboard feedback was exercised without sending email or changing the user's clipboard |
| Final localized protection improves readability | Final production build at 1440, 390 and 320 pixels on Projects, Coursework and Contact, paired screenshots with only the new pseudo-element removed | 9/9 passed. Reviewed final mobile screenshots: filter labels and resume explanation have dark reading protection; scene remains visible outside it. Select and copy controls remain usable. This is visual evidence, not a quantified WCAG contrast audit |
| Whole home workflow remains usable | Final build, six section links per profile: desktop, mobile, narrow, reduced motion, JavaScript disabled at 390 and 320 | 6/6 profiles, 36/36 actual section navigation hops passed, including destination focus where JavaScript is enabled and correct section visibility without JavaScript |
| Generated application remains valid | Real production build and existing repository checks | Build passed, page checks 5/5, content checks 14/14, scheduler tests 23/23, graph update and diff check passed |

## Loading evidence and retained failures

Browser runs use Edge with a software GPU, cache disabled for timed route checks, no CPU throttle, a shared browser process, and no request interception in normal-network audits. These are not field p75 or universal cold-device guarantees. Functional PASS is recorded separately from whether paint is below two seconds.

Initial public normal-network run, FCP / LCP in milliseconds:

| Route | Desktop 1440 | Mobile 390, 4 Mbps and 40 ms |
| --- | --- | --- |
| Projects | 4192 / 4192 | 1212 / 1212 |
| Coursework | 2448 / 2516 | 1092 / 1092 |
| About | 1272 / 1388 | 836 / 1020 |
| Contact | 1344 / 1476 | 1052 / 1088 |

A second public run included a severe About desktop outlier of 21416 / 22064 ms and Projects narrow of 3832 / 3832 ms. The first local full route run painted Projects desktop at 2700 / 2700 ms. These observations are retained, not discarded because later samples were faster. The contrast patch is not claimed to fix loading performance.

The original repository section runner timed out on six public scenarios. Later normal and request-routed diagnostic navigations succeeded, so the initial timeout cause is not established. Early scratch audits also failed on exact accessible-label selection, an incorrect all-category oracle sentinel, and a hidden duplicate resume note. Those harness errors were corrected before the complete passing runs. Initial no-JavaScript home checks used an in-page wait that did not settle after native scrolling; screenshots showed the destination, and the corrected driver-side geometry polling passed both no-JavaScript profiles.

## Evidence locations

Reports and screenshots retained under the machine's temporary directory:

- `portfolio-other-routes-normal-network-20261015/report.json`: public measurements and initial selector failures.
- `portfolio-other-routes-normal-network-corrected-20261015/report.json`: retained public outliers and oracle failures.
- `portfolio-other-routes-patched-final-20261015/report.json`: 16/16 complete functional cases, broader candidate.
- `portfolio-home-sections-patched-final-20261015/report.json`: final CSS, 6/6 profiles and 36 hops.
- `portfolio-local-reading-scrim-verified-20261015/report.json`: final CSS, 9/9 reading protection cases and paired screenshots.

## Remaining limitations

- Resume download remains disabled because the approved PDF is absent.
- Unconfirmed project and academic lifecycle statuses remain explicitly unconfirmed.
- No email was sent. External social destinations were inspected, not exhaustively audited.
- Clipboard failure feedback was checked in isolated browser contexts, not permission-granted clipboard success.
- Automated checks plus screenshots do not constitute a comprehensive accessibility certification or real-device performance guarantee.

## Publication

Pending verification of the exact published commit and final public workflows. Do not treat local acceptance as deployment evidence.
