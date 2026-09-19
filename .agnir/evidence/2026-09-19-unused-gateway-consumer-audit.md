# Unused gateway consumer audit — 2026-09-19

## Scope rule

The facade 1.0.0 scope requires "Used Worker capabilities". This repository's service is an optional fixed-upstream addon gateway.

## Audit

Repositories checked:
- CineHarbor/cineharbor
- CineHarbor/cineharbor-core
- CineHarbor/cineharbor-addon-sdk
- CineHarbor/cineharbor-web
- CineHarbor/cineharbor-desktop
- CineHarbor/cineharbor-download-site

Consumer terms checked across those repositories:
- `cineharbor-addon-gateway`
- `WORKER_ROUTE`
- `UPSTREAM_BASE_URL`
- `cineharbor-worker`

No production consumer reference was found. Immutable integration manifests independently show Web depends on Core + Addon SDK and Desktop depends on Core + Addon SDK + Web. The Download Site reads Desktop public releases. The Web PWA Service Worker is a different Web-owned implementation.

## Disposition

The previously observed absence of `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `UPSTREAM_BASE_URL`, `ALLOWED_ORIGINS` and `WORKER_ROUTE` remains factual. Because no 1.0 production path consumes this optional gateway, deployment is **not applicable**, not a pass and not an external release blocker.

If any consumer is added before publication, this evidence expires and production deployment/smoke is required.

Predecessor code SHA `0b544597f87068ba43519e5ab67e58d705208ee0` had two complete successful CI runs (`35436775571`, `35436789834`). The checkpoint revision still requires repeated final-main verification.
