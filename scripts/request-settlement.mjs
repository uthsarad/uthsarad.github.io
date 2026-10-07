import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

// Browser networkidle can exclude browser-initiated requests such as favicons.
// Observe the existing request ledger instead. Never ignore, remove or cancel a
// pending request. A bounded deadline still fails with its exact unresolved URLs.
export async function settleTrackedRequests(pending, lastActivity, {
  quietMs = 500, timeoutMs = 15000, pollMs = 25,
} = {}) {
  for (const [name, value] of Object.entries({ quietMs, timeoutMs, pollMs })) {
    assert.ok(Number.isSafeInteger(value) && value > 0, `${name} must be a positive integer`)
  }
  const started = Date.now()
  while (pending.size || Date.now() - lastActivity() < quietMs) {
    assert.ok(Date.now() - started < timeoutMs,
      `Tracked requests did not settle before deadline: ${JSON.stringify([...pending.values()])}`)
    await delay(pollMs)
  }
  return { pendingCount: pending.size, quietMs, timeoutMs, elapsedMs: Date.now() - started }
}
