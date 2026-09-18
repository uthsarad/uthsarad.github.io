import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'

// Build-time rendering only; GitHub Pages still serves ordinary static files.
// Resolve every lazy boundary before writing HTML, including its React markers.
export function renderPage(tree) {
  return new Promise((resolve, reject) => {
    const output = new PassThrough()
    const chunks = []
    let failure
    output.setEncoding('utf8')
    output.on('data', (chunk) => chunks.push(chunk))
    output.on('end', () => resolve(chunks.join('')))
    output.on('error', reject)
    const { pipe, abort } = renderToPipeableStream(tree, {
      onAllReady() {
        clearTimeout(timeout)
        if (failure) reject(failure)
        else pipe(output)
      },
      onShellError(error) {
        clearTimeout(timeout)
        reject(error)
      },
      onError(error) {
        failure = error
      },
    })
    const timeout = setTimeout(() => {
      abort()
      reject(new Error('Static page rendering timed out'))
    }, 15000)
    timeout.unref()
  })
}
