# Workerd and deployment prerequisite evidence — 2026-09-19

Source f533b1799c7d93db3f58cc2ecfe78ad0c8c6123f, toolchain run 35425872368, artifact 10578304757. Remote preparation passed syntax, 13 tests, build and exact Wrangler 4.135.0 dry-run. The lock SHA256 is f0c4f1f6a7bbb22868fc517afcf8e78c1d9f26af0a88e450e39c9d3c7b1fdb53. The preparation artifact is not final release acceptance.

A new local test loads the unchanged production module in real workerd through the exact Wrangler-transitive Miniflare version, now explicitly declared as a test dependency. It exercises configured health, manifest/CORS, denied origins/routes, upstream authorization failure, credential stripping and streamed 206 bytes. It passed locally (one runtime test); the 13 security unit tests and Wrangler deploy --dry-run also passed. Its outbound content service is a fixture, not a production deployment.

The CI prerequisite artifact recorded only availability booleans: CLOUDFLARE_API_TOKEN=false, CLOUDFLARE_ACCOUNT_ID=false, UPSTREAM_BASE_URL=false, ALLOWED_ORIGINS=false, WORKER_ROUTE=false. Cloudflare plugin discovery returned no available integration. Therefore actual production deployment is EXTERNAL_BLOCKER; no secret values have been read into chat or artifacts and no production success is claimed.

The one-time publisher imports only the SHA256-verified lock from the immutable artifact, validates direct versions against its existing graph, runs clean npm ci and all build/runtime checks, performs a coherent Agnir checkpoint, rejects a moved main, non-force pushes, verifies destination and fresh-resolves identity/lineage. It is to be deleted once the initial lock is committed. Normal CI independently requires the checked-in lock; it never substitutes mutable installation or skips missing dependencies.

RELEASE_READY remains false; public release is not executed. Agnir identity, lineage and compatibility/provenance remain unchanged.
