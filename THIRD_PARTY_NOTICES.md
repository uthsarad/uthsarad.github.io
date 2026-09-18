# Third-party notices

## React Bits

Copyright (c) 2026 David Haz.

The following files are adapted from [React Bits](https://github.com/DavidHDev/react-bits):

| Local component     | Upstream source                                                                                                               | Adaptation                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GhostFibers.tsx`   | [Ghost Fibers](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/GhostFibers/GhostFibers.tsx)      | Fiber shader adapted with fixed blue settings; renderer replaced with raw WebGL2, visibility/motion controls, cleanup, resolution/frame-rate caps, static fallback.   |
| `DepthText.tsx`     | [Depth Text](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/TextAnimations/DepthText/DepthText.tsx)         | Simplified layered text and pointer rotation; static state when motion is disabled.                                                                                   |
| `ShinyText.tsx`     | [Shiny Text](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/TextAnimations/ShinyText/ShinyText.tsx)         | Moving gradient implemented with CSS animation and an offscreen pause.                                                                                                |
| `SpotlightCard.tsx` | [Spotlight Card](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx) | Pointer glow with motion preference and keyboard-focus treatment.                                                                                                     |
| `DataParticles.tsx` | [Particles](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/Particles/Particles.tsx)             | Point-sprite rendering and wave motion adapted to WebGL2; deterministic synthetic clusters, Anime.js transitions, motion/visibility controls, and SVG fallback added. |

These adaptations and their corresponding CSS are used as part of this portfolio website. The upstream **MIT + Commons Clause License Condition v1.0** is included in [public/licenses/react-bits.txt](public/licenses/react-bits.txt), which is also distributed in the production site.

The synthetic clustering layout and project artwork are authored for this site and do not depict real measurements or product screenshots. Other npm dependencies retain their respective package licenses.

## Anime.js

[Anime.js](https://github.com/juliangarnier/anime/tree/v4.1.3), by Julian Garnier, is used under its [MIT license](https://github.com/juliangarnier/anime/blob/v4.1.3/LICENSE.md). The data scene imports the pinned version **4.1.3** from jsDelivr at runtime; it is not vendored into the site bundle. A local transition fallback handles CDN failure. See the README for the exact module URL and loading behavior.

## COBE

[COBE](https://github.com/shuding/cobe), copyright (c) 2021 Shu Ding, is used under its [MIT license](https://github.com/shuding/cobe/blob/main/LICENSE). `NeonGlobe.tsx` imports version **2.0.1** from jsDelivr. The package is not vendored. Topic/scroll transitions, blue styling, the local SVG fallback, and the illustrative connection layout are local additions. The connection endpoints do not assert clients, employment, or measured network activity.
