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

The SecurityLock SVG illustration and project artwork are authored for this site. Particle positions are illustrative; they do not depict real measurements or product screenshots. Other npm dependencies retain their respective package licenses.

## Black hole shader (Eric Bruneton, BSD-3-Clause)

The persistent black hole scene renders [Eric Bruneton's physically based black hole shader](https://github.com/ebruneton/black_hole_shader), described in [arXiv:2010.08735](https://arxiv.org/abs/2010.08735), used under its [BSD 3-Clause license](https://github.com/ebruneton/black_hole_shader/blob/master/LICENSE):

| Local file                                             | Upstream role                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `src/lib/blackHolePhysical/model.ts`                   | Schwarzschild camera/orbit model and physical constants                                               |
| `src/lib/blackHolePhysical/discParticleGlsl.ts`        | Deterministic accretion disc particle generator                                                       |
| `src/shaders/blackHolePhysicalCore.glsl`               | Core lensing, disc, Doppler, and black-body lighting equations                                        |
| `src/shaders/blackHolePhysicalFragment.glsl`           | Fragment shader entry point and output shading                                                        |
| `src/lib/blackHolePhysical/webgl.ts`                   | Renderer host with local lifecycle, frame-rate, and resolution safeguards                              |
| `public/black-hole/*.dat`, `public/black-hole/noise_texture.png` | Precomputed deflection, inverse-radius, Doppler, and black-body tables plus disc noise      |

The original physical equations are unchanged. Local additions are the React component and its lifecycle (`BlackHole.tsx`), the WebGL host safeguards, one-frame presentation, tone mapping without the upstream bloom pipeline, and the stationary observer used for a website. The scene is decorative: the lensing, disc, and Doppler rendering is physical, while the page-transition suck-in and spit-out is artistic choreography, not a simulated trajectory. The full license text is included in [public/licenses/black-hole-BSD-3-Clause.txt](public/licenses/black-hole-BSD-3-Clause.txt), which is also distributed in the production site.

## kam-ui (MIT)

The black hole scene is vendored from [kam-ui](https://github.com/Ouranos27/kam-ui), used under its MIT license. The pinned upstream commit and the full provenance record, including which files are modified or unmodified, are kept in [public/licenses/black-hole-SOURCES.txt](public/licenses/black-hole-SOURCES.txt). The MIT text is included in [public/licenses/kam-ui-MIT.txt](public/licenses/kam-ui-MIT.txt), which is also distributed in the production site.
