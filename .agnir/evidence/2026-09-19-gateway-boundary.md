# Worker release boundary and security checkpoint — 2026-09-19

Baseline main: 88a510e78880455b01bec0683f0b39948d50219f. Source inventory: CineHarbor/cineharbor Actions 35424839669, artifact 10578988188. Repository instructions and the selected identity/lineage were loaded before changes.

Tracked-source searches across seven repositories found no registration/import/build consumer for this repository's service-worker.ts or generic edge proxy. The active Web worker/index.js handles PWA cache migration; src/lib/download owns actual download/cache behavior. No actual Web implementation or stored user data was deleted.

The old proxy selected an arbitrary host from the URL path and forwarded sensitive caller headers. The replacement fixes the upstream to administrator configuration, allowlists routes/methods/headers/origins, rejects redirects, streams bytes without a second parser, and sets private no-store cache behavior. Media query tokens remain upstream-owned; arbitrary-target SSRF protection inside the Rust addon still requires separate review.

Local checks: node --check proxy.worker.js; node --test tests/*.test.mjs (13 passed, zero failed/skipped); node scripts/build.mjs. Tests cover fail-closed configuration, bad origins, preflight, read-only routes, credential/cookie isolation, HLS transparency, Range/HEAD, redirects, auth failures and timeout/error sanitization. These are deterministic contract tests, not production verification.

Wrangler exact stable release 4.135.0 was verified against cloudflare/workers-sdk release wrangler@4.135.0, published 2026-09-18. Initial toolchain materialization is separate from final lock-based CI. Cloudflare plugin discovery returned no available plugin; no assertion about existing CI secret values is made before the prerequisite check. Only availability booleans may enter artifacts.

Checkpoint candidate includes implementation, tests, docs, state/next-actions/decision and this evidence. Core/Profile and Agnir operational provenance unchanged. No deployment/public release or readiness promotion. Verify destination ref and fresh-resolve after publication.
