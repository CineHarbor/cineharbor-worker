# cineharbor-worker Current State

Target: 1.0.0. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.**

This repository now owns an optional fixed-upstream addon gateway, not an arbitrary-target proxy or duplicate download worker. It accepts only read-only addon/media routes, explicit origins and allowlisted noncredential headers; rejects redirects and unsafe document responses; preserves byte ranges, auth failures and media payloads; and disables shared caching. Missing trusted configuration fails closed.

The former unused browser Service Worker prototype is retired. The tracked seven-repository inventory found no production registration/import/build consumer; actual Web PWA and download/cache implementations remain in cineharbor-web and are unchanged. This is not a claim that unknown external deployments have been inspected.

Local validation: syntax check, 13 dependency-free security/contract tests and source packaging passed. These use injected upstream responses and are not production or workerd evidence. The exact Wrangler 4.135.0 dependency graph is being materialized; lock publication, clean npm ci, Wrangler dry-run, two current-main CI passes and production smoke remain required.

No deployment credentials or actual production route have been verified. Record availability only as booleans in CI; never export secret values. No deployment or public release has been performed by this checkpoint.

Project identity urn:cineharbor:project:cineharbor-worker and lineage urn:cineharbor:lineage:cineharbor-worker remain unchanged. Agnir Core/Profile 1.0 / repository-filesystem/1.0, operations 1.0.2 at b5626394ec40a5cb7a28c01892acde07cc0adc8e. Initialization is committed, not pending. License CC-BY-NC-SA-4.0.

## Locked runtime checkpoint

The exact verified Wrangler/Miniflare dependency lock is now committed. Clean npm ci, security tests, actual workerd runtime and Wrangler dry-run passed before this checkpoint. Prior dependency materialization is complete. Two current-main quality runs and retirement of the temporary publisher remain pending. Production prerequisites were absent, so deployment is EXTERNAL_BLOCKER, not a pass.
