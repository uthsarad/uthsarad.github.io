# Space refresh verification, 13 October 2026

## Delivered appearance and interaction

- Neutral near-black surfaces, white headings and primary blue `#4c8dff`. Computed text samples measured at least 6.26:1, including the primary CTA. Moving-image backgrounds were reviewed separately, not counted as solid-color contrast proofs.
- The active static fallback is `public/black-hole/preview-blue.jpg`, a clean local physical-renderer frame. Decoded 960x600 pixels contained 49,543 bright blue pixels and zero warm/golden pixels under the documented classifier. The visual/fallback have no color filter. Only the live physical canvas is hue-filtered, avoiding double tinting.
- Actual WebGL screenshots at 1440px and 390px cover Introduction, Interests, Projects and About. All eight had no horizontal overflow. Feathered scrims now protect the previously washed-out Interests and About copy. Their horizontal padding was reduced from 24px to 16px after the 320px no-JavaScript checks exposed four pixels of overflow.
- All nine strengthened navigation scenarios passed: desktop hover, click, keyboard, 390/320 touch, 844/320-height native no-JavaScript navigation, voyage/pause/resume and reduced motion. Escape now prevents immediate hover reopening underneath a stationary pointer, while leaving and re-entering still opens normally.
- Production build, all five generated-page checks and all fourteen content/settlement tests passed. Existing HTML and JavaScript budgets were not raised.

## Short arrival and startup measurements

The decorative arrival has a 1.25-second finite CSS animation and a navigation-relative 1.6-second JavaScript disarm deadline. It never captures pointer input or gates React hydration. It is hidden by default when scripts/animations fail, skips saved pause, reduced motion, deep links, standalone routes and restored visits, and dismisses on real pointer, touch, keyboard or wheel input.

The measured final startup cases observed actual visible frames followed by fully hidden frames at:

| Width | First visible | First fully hidden | Hidden at 3 seconds |
|---|---:|---:|---|
| 1440 | 201 ms | 1627 ms | Yes |
| 390 | 171 ms | 1577 ms | Yes |
| 320 | 225 ms | 1500 ms | Yes |

These frame observations begin before navigation. Timing cases do not take screenshots before the deadline. Appearance capture is separate because screenshot preparation can wait for fonts and perturb rendering. Computed visibility is not a proof of every compositor frame.

The first published revision's startup report contained 22 scenarios, 20 passing and two failing:

1. The cold-cache, software-GPU 4 Mbps / 40 ms case reported FCP 4016 ms and an LCP candidate at 4032 ms, above the unchanged 2000 ms assertion. The unthrottled cache-cold case reported FCP 292 ms and LCP 1860 ms. Both were no-input observations through five seconds, not field p75 data. They share a browser process warmed by earlier suite cases, so cold HTTP cache must not be mislabeled cold GPU.
2. The optional untimed arrival screenshot case could not observe a visible frame before its timeout. That visual capture was not a timing measurement and is not claimed as passing.

All preference, input, failure, history, actual blue-fallback and computed contrast cases passed. A real early-leave BFCache restore also passed with `pageshow.persisted === true` and the original document token. Other attempts were blocked or timing-variable and remain in their original reports, not retrospectively converted to passes.

Earlier cold-process startup probes still exceeded two seconds, including 3061 ms before the eager offscreen shader fix and later 2171 ms. An independent no-screenshot probe also exceeded the target, disproving screenshots as the sole cause. After simplifying decorative compositing, a fresh-process no-screenshot probe observed FCP 1604 ms and fully hidden arrival at 1772 ms. These are lab observations with variation, not a universal latency guarantee.

Offscreen Ghost Fibers no longer compiles while disabled. Physical shader compilation and physics-table fetching begin no earlier than 2.5 seconds after navigation, leaving the initial two-second paint window free of that work. The already-blue fallback remains available while the approximately 3.6 MB physics payload loads. Resume later in the document adds no further artificial delay.

**Remaining limitation:** the full page is not proven to load under two seconds on every cold network/GPU combination. The bounded decorative intro and the overall page-load requirement are separate. No timing assertion, renderer budget, network profile or GPU setting was relaxed to conceal a failure.

## Reproduction and retained evidence

Start an existing production preview, then run:

```text
npm run build
npm run check:pages
npm run check:content
node scripts/check-navigation.mjs --url http://127.0.0.1:4173
node scripts/check-space-refresh.mjs --url http://127.0.0.1:4173 --bfcache
```

The runners use existing Playwright and browser installations, never install packages, and write raw reports/screenshots under the system temporary directory. Use `--arrival-visual` for a separate untimed appearance case. Use `--max-paint-ms 0` only to record external network measurements without claiming the two-second guarantee.

Final local evidence directories under `%TEMP%`:

- `portfolio-space-navigation-escape-fixed-20261013/report.json`
- `portfolio-space-visual-20261013/report.json` and chapter PNGs
- `portfolio-space-acceptance-final-20261013/space-refresh.json`

Preserved earlier failed reports:

- `portfolio-space-final-20261013/space-refresh.json`
- `portfolio-space-final-fixed-20261013/space-refresh.json`
- `portfolio-space-light-20261013/space-refresh.json`

Live publication and checks are recorded separately after the deployment completes. This record does not assert publication merely because a local build passed.

## Paint-aware follow-through

The initial refresh was published as `985e250`. The later scheduling repair is committed as `1361aca`. This follow-through keeps the original 1.25-second animation and 1.6-second navigation-relative disarm. A shorter timing experiment was discarded after it failed cold-process checks, not retrospectively counted as a success.

### Targeted changes

- Both voyage imports and physical renderer initialization now require first contentful paint, the existing 2.5-second minimum, a visible document and two rendering frames. Late hydration and visibility/context-restoration handlers cannot bypass that boundary. Unsupported paint timing uses a double-frame opportunity and is not claimed as FCP evidence.
- The already-blue static image remains paintable during the intro instead of being explicitly hidden and revealed late. Its soft edge is painted over the solid ambient backdrop before readiness, avoiding the initial permanent transform promotion and mask. The original mask and live motion promotion return when the renderer becomes ready.
- The unready canvas has no display box. Once ready, the fallback fades out over the actual canvas. Physics, shader palette, renderer dimensions, frame caps and image pixels remain unchanged.
- The acceptance runner preserves results before teardown, supports explicit `--only name,name` selection and bounds hung workflows/diagnostic teardown. A missing scenario or incomplete run cannot report PASS. The navigation-relative completion and FCP/LCP assertions remain strictly below 2000 ms.

### Latest complete local workflow

`portfolio-space-restored-final-20261013/space-refresh.json` reports **21/21 PASS**, including real BFCache restoration. No scenario was blocked or skipped in that full run.

| Width | First visible frame observation | First fully hidden frame observation |
|---|---:|---:|
| 1440 | 194 ms | 1732 ms |
| 390 | 256 ms | 1529 ms |
| 320 | 213 ms | 1488 ms |

The separate cache-cold, no-input desktop case observed FCP/LCP at 332/332 ms. The 390px, 4 Mbps / 40 ms case observed 552/568 ms. These two cases share a browser process already warmed by earlier scenarios, so they are not cold-GPU evidence. An image LCP candidate is also not proof that content underneath an opaque intro was readable at that instant.

Real resource timings show the voyage, WebGL/model imports and physics requests starting after FCP and the unchanged 2.5-second floor. The runner requires an actual voyage request, preventing an empty request list from satisfying this check.

All nine navigation scenarios passed again in `portfolio-navigation-paint-gated-final-20261013/report.json`, including voyage motion controls and native no-JavaScript navigation. Production build and five generated-page tests passed. The fourteen content/settlement tests and twenty-three real-source scheduler tests passed. The scheduler harness is deterministic browser-API simulation, not a substitute for the real browser checks. Shared runtime is 55,602 bytes gzip and home HTML is 11,090 bytes gzip, below the unchanged 56,000/12,000-byte budgets.

Actual physical-canvas handoff, fallback fade, pause and rebuild/resume also passed at 1440px and 390px with no application errors in `portfolio-fallback-handoff-20261013/handoff.json`. An additional font-isolated visual-ablation comparison measured mean absolute channel differences of 0.067/0.089 on a 0-255 scale between the old static mask and new paint feather. It is not a pixel-identical or production font-timing claim. The first comparison was confounded by a font swap, and waiting for the external font stylesheet later timed out. Those captures remain retained separately. No production font settings or performance test network conditions were changed to obtain the isolated visual result.

### Retained counter-evidence and limits

The earlier nine fresh-process static-paint probes recorded FCP between 1244 and 1792 ms and latest LCP between 1244 and 1792 ms. Two unthrottled mobile intro-completion observations still exceeded two seconds, at 2031 and 2089 ms. They are retained in `portfolio-startup-static-paint-20261013/timings.json` and are not converted into passes.

The discarded shortened-intro series recorded FCP at 3128 to 4044 ms and LCP at 3128 to 4212 ms. Its combined runner later timed out after fourteen reported passing functional cases and did not finish acceptance. The causal explanation for that variation is not established. The raw timings and failed task output remain retained in `portfolio-startup-final-short-20261013/timings.json` and background task `8207441j3m`. Restoring the original timing, bounding diagnostic operations and rerunning the complete workflow produced the 21-case passing report above. The isolated history case also passed in `portfolio-history-paint-gated-20261013/space-refresh.json`.

**Conclusion:** the latest complete lab workflow meets the unchanged two-second intro/paint checks and preserves the requested appearance and interactions. This is not a universal cold-device, cold-GPU, real-network or field-p75 page-load guarantee. The optional multi-megabyte physical scene intentionally starts later than the readable page.

### Verified publication

The tested application changes were published as `4509337999075f77cad0064109bc0b8021a1f4a1`. GitHub Pages workflow run `38379462047` completed successfully on 13 October 2026. The first live verifier encountered an HTTP 503 for an initial asset and failed before browser checks. That output remains retained as background task `221002wjkg`. An independent rerun, task `2577493pr3`, completed successfully at 09:55 UTC.

The rerun byte-matched the live home HTML, all seven initial JavaScript/CSS/modulepreload assets and the blue fallback against the tested production build. Live 1440px/390px screenshots and computed checks confirmed the neutral black/blue/white palette, unfiltered blue fallback with zero warm-classifier pixels, reduced-motion intro suppression and no horizontal overflow. All nine navigation scenarios also passed against the deployed site, including keyboard, touch, native no-JavaScript links and voyage pause/resume.

Publication evidence is retained under `%TEMP%/portfolio-space-paint-aware-live-20261013/verification.json` and `%TEMP%/portfolio-navigation-paint-aware-live-20261013/report.json`. These live appearance and interaction checks do not claim a live-network two-second latency guarantee.
