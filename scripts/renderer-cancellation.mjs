/** Classify only an individually proven initial-renderer motion-pause abort. */
export function isExpectedRendererAbort(failure, proof) {
  if (!failure || !proof || typeof failure !== 'object' || typeof proof !== 'object') return false
  if (!Number.isSafeInteger(failure.requestId) || failure.requestId <= 0 ||
      failure.requestId !== proof.requestId) return false
  if (typeof failure.url !== 'string' || failure.url !== proof.url) return false
  let url
  try { url = new URL(failure.url) } catch { return false }
  if (!['http:', 'https:'].includes(url.protocol) ||
      url.pathname !== '/black-hole/noise_texture.png') return false
  if (failure.error !== 'net::ERR_ABORTED') return false
  if (failure.status !== undefined &&
      (typeof failure.status !== 'number' || !Number.isFinite(failure.status) || failure.status >= 400)) return false
  return proof.phase === 'motion-pause' && proof.generation === 'initial' &&
    proof.signalAborted === true && proof.fetchOutcome === 'AbortError' &&
    Number.isFinite(proof.pauseStartedAt) && Number.isFinite(proof.abortedAt) &&
    proof.pauseStartedAt >= 0 && proof.abortedAt >= proof.pauseStartedAt
}
