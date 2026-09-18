import pages from '@/data/pages.json'

export { pages }
export type PageId = keyof typeof pages
export const pageEntries = Object.entries(pages) as [
  PageId,
  (typeof pages)[PageId],
][]

export function getPage(pathname: string): PageId | undefined {
  const path = pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/'
  return pageEntries.find(
    ([, page]) => (page.href.replace(/\/$/, '') || '/') === path,
  )?.[0]
}
