# uthsarad.github.io

## Modernized Portfolio Website

A stunning, scroll-driven portfolio site built with Vite + React + TypeScript + Tailwind CSS, featuring premium animations from Motion (motion.dev) and Aceternity UI components. The site implements ScrollCraft principles with one signature interaction and one visual peak for a memorable user experience.

### ✨ Key Features

- **Modern Tech Stack**: Vite, React 18, TypeScript, Tailwind CSS
- **Premium Animations**: Motion (motion.dev) scroll-linked effects, native ScrollTimeline where possible
- **Aceternity UI**: 200+ copy-paste animated components with glassmorphism design
- **ScrollCraft Quality Bar**: Signature scroll interaction, one visual peak, no "AI slop" aesthetics
- **Dark Glassmorphism Theme**: Indigo/violet palette with animated backgrounds and orbs
- **Responsive Design**: Left sidebar navigation on desktop, mobile-optimized
- **Performance Optimized**: Hardware-accelerated animations, reduced motion support

### 🏗️ Architecture

```
src/
├── App.tsx                    // Main layout with sections
├── components/ui/             // Aceternity UI copies
├── sections/                  // Hero, About, Showcase, Featured, Contact
├── lib/                       // Shared utils, motion variants
├── data/                      // Profile & projects JSON
├── styles/                    // Global CSS + Tailwind
```

### 📋 Sections

1. **Hero** – Scroll-scrubbed aurora background with gradient name and typewriter effect
2. **About** – Bento grid bio card with info rows and tech stack badges
3. **Showcase** – 3D-project cards with spotlight hover and masonry layout
4. **Featured** – "Currently Focused On" panel with animated CTA
5. **Contact** – Social links and email with magnetic interactions

### 🛠️ Tech Details

- **Build Tool**: Vite (zero-config, fast HMR)
- **Animations**: Framer Motion (useScroll, useTransform, layout/gesture/exit)
- **Styling**: Tailwind CSS with custom design tokens
- **Components**: Aceternity UI (aurora, spotlight, sparkles, 3D card, bento grid)
- **Deployment**: GitHub Actions → GitHub Pages (static site)

### 🚀 Quick Start

```bash
# Clone the repo
cd uthsarad.github.io

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The site is automatically deployed to GitHub Pages via Actions on every push to `main`.

### 🎨 Design Philosophy

- Keep the original dark indigo/violet glass theme
- Add depth with layered glass effects and soft glows
- One memorable visual peak (Showcase 3D cards)
- Respect `prefers-reduced-motion`
- Mobile-first responsive navigation

### 📝 Notes

- The old `index.html` has been preserved as `legacy-index.html` for fallback
- Content (profile, projects) lives in `src/data/` for easy updates
- All Aceternity UI components are copied locally for control
- ScrollCraft ensures the site stands out from typical AI-generated templates

### 🔗 Links

- **Live Site**: *[Coming soon after deployment]*
- **GitHub Repo**: https://github.com/uthsarad/uthsarad.github.io
- **GitHub Actions**: *[Workflow in .github/workflows/deploy.yml]*