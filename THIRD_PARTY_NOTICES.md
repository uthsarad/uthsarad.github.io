# Third-party notices

## React Bits

Copyright (c) 2026 David Haz.

The following files are adapted from [React Bits](https://github.com/DavidHDev/react-bits):

| Local component     | Upstream source                                                                                                               | Adaptation                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GhostFibers.tsx`   | [Ghost Fibers](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/GhostFibers/GhostFibers.tsx)      | Fiber shader adapted with fixed blue settings; renderer replaced with raw WebGL2, visibility/motion controls, cleanup, resolution/frame-rate caps, static fallback.   |
| `ShinyText.tsx`     | [Shiny Text](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/TextAnimations/ShinyText/ShinyText.tsx)         | Moving gradient implemented with CSS animation and an offscreen pause.                                                                                                |
| `SpotlightCard.tsx` | [Spotlight Card](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx) | Pointer glow with motion preference and keyboard-focus treatment.                                                                                                     |
| `Aurora.tsx` | [Aurora](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/Aurora/Aurora.tsx) | Noise shader adapted to native WebGL2; fixed blue palette, resolution/frame-rate limits, pause and context recovery, gradient fallback. |
| `Antigravity.tsx` | [Antigravity](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/Antigravity/Antigravity.tsx) | Magnetic ring, waves, interpolation, and depth projection adapted to Canvas2D capsules; deterministic points, bounded rendering, pointer/touch/button input, pause and SVG fallback. |

These adaptations and their corresponding CSS are used as part of this portfolio website. The upstream **MIT + Commons Clause License Condition v1.0** is included in [public/licenses/react-bits.txt](public/licenses/react-bits.txt), which is also distributed in the production site.

The SecurityLock SVG illustration and project artwork are authored for this site. Particle positions and globe connections are illustrative; they do not depict real measurements or product screenshots. Other npm dependencies retain their respective package licenses.

## COBE

[COBE](https://github.com/shuding/cobe), copyright (c) 2021 Shu Ding, is used under its [MIT license](https://github.com/shuding/cobe/blob/main/LICENSE). `NeonGlobe.tsx` imports version **2.0.1** from jsDelivr. The package is not vendored. Topic/scroll transitions, blue styling, the local SVG fallback, and the illustrative connection layout are local additions. The connection endpoints do not assert clients, employment, or measured network activity.
