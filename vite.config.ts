import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { readFile } from 'node:fs/promises'
import pages from './src/data/pages.json'
import { renderPage } from './scripts/render-page.mjs'

// https://vite.dev/config/
export default defineConfig({
  // Root GitHub Pages repo (uthsarad.github.io) is served from '/', so keep base '/'.
  base: '/',
  plugins: [
    react(),
    {
      name: 'portfolio-static-html-preview',
      apply: 'serve',
      configureServer(server) {
        return () => {
          server.middlewares.use(async (request, response, next) => {
            // Vite's HTML fallback rewrites request.url to /index.html first.
            // Preserve the visitor's route when rendering the source page.
            const url = request.originalUrl ?? request.url ?? '/'
            const pathname = new URL(url, 'http://localhost').pathname
            const normalized =
              pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/'
            if (
              request.method !== 'GET' ||
              !request.headers.accept?.includes('text/html') ||
              !Object.values(pages).some(
                (page) => (page.href.replace(/\/$/, '') || '/') === normalized,
              )
            )
              return next()
            try {
              const template = await server.transformIndexHtml(
                url,
                await readFile(
                  new URL('./index.html', import.meta.url),
                  'utf8',
                ),
              )
              const { pageTree } = await server.ssrLoadModule(
                '/src/entry-server.tsx',
              )
              const content = await renderPage(pageTree(pathname))
              response.setHeader('Content-Type', 'text/html; charset=utf-8')
              response.setHeader('Cache-Control', 'no-cache')
              response.end(
                template.replace(
                  '<div id="root"></div>',
                  () => `<div id="root">${content}</div>`,
                ),
              )
            } catch (error) {
              next(error)
            }
          })
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    manifest: true,
  },
})
