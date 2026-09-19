# cineharbor-worker Current State

Target: 1.0.0. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.**

This repository owns an optional fixed-upstream addon gateway, not an arbitrary-target proxy or duplicate download worker. It accepts only read-only addon/media routes, explicit origins and allowlisted noncredential headers; rejects redirects and unsafe document responses; preserves byte ranges, auth failures and media payloads; and disables shared caching. Missing trusted configuration fails closed.

The unused browser Service Worker prototype is retired. The tracked seven-repository inventory found no production registration/import/build consumer; actual Web PWA and download/cache implementations remain in cineharbor-web. Unknown external deployments have not been certified.

## Observed verification and cleanup — 2026-09-19

The exact Wrangler/Miniflare lock is committed. At main `0d2a383673e3b53f44f8f2626671e7a733fd4b05`, two distinct Actions runs `35426573655` and `35426574616` passed. Their actual job steps were inspected: locked install, syntax, security tests, real workerd, build, Wrangler dry-run, dependency audit and clean-tree check all succeeded. Only the dispatch-only repeat helper was intentionally skipped; no required quality step was skipped.

The completed one-time `toolchain-lock.yml` publisher is now removed. It previously held contents/actions write permission and would fail after the initial lock existed. Routine CI remains read-only except for its narrowly scoped repeat-dispatch job. The cleanup revision must obtain its own CI results; predecessor passes are not final-revision acceptance.

Local revalidation of the unchanged gateway: Node v22.16.0 syntax, 13/13 contract tests with zero skips and source build passed. These local fixture tests are not production deployment evidence.

Production prerequisites were recorded absent in the prior check: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, UPSTREAM_BASE_URL, ALLOWED_ORIGINS and WORKER_ROUTE. No subsequent production deployment has been observed. Production deployment and smoke remain EXTERNAL_BLOCKER, not a pass.

Project identity `urn:cineharbor:project:cineharbor-worker`, lineage `urn:cineharbor:lineage:cineharbor-worker`, Agnir Core/Profile 1.0 / repository-filesystem/1.0 and operations 1.0.2 at `b5626394ec40a5cb7a28c01892acde07cc0adc8e` are unchanged. License: CC-BY-NC-SA-4.0.
