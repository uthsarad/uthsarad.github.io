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

The final startup report contained 22 scenarios, 20 passing and two failing:

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
