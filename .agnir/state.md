# cineharbor-worker Current State

Target: CineHarbor **1.0.0 public release**. **RELEASE_READY = false; PUBLIC_RELEASE_EXECUTED = false.**

This repository owns an optional fixed-upstream addon gateway, not an arbitrary-target proxy or duplicate download worker. The package is already version `1.0.0`. The gateway accepts only read-only addon/media routes, explicit origins and allowlisted noncredential headers; rejects redirects and unsafe document responses; preserves byte ranges/auth failures/media payloads; and disables shared caching. Missing trusted configuration fails closed.

## Final code verification

Main predecessor `0b544597f87068ba43519e5ab67e58d705208ee0` passed two complete CI runs: push `35436775571` and workflow-dispatch `35436789834`. Locked install, syntax, 13 security contracts, real workerd, build, Wrangler dry-run, dependency audit and clean-tree gates passed.

## 1.0 consumer audit — 2026-09-19

The 1.0 facade scope requires **used** Worker capabilities, not deployment of every optional repository.

A cross-repository consumer audit found no production reference to `cineharbor-addon-gateway`, `WORKER_ROUTE`, Worker `UPSTREAM_BASE_URL`, or the `cineharbor-worker` repository from the facade, Web, Desktop, Core, Addon SDK or Download Site. Their immutable integration graphs also exclude Worker: Web pins Core+Addon SDK; Desktop pins Core+Addon SDK+Web; Download Site consumes public Desktop release data.

The browser PWA Service Worker is Web-owned and unrelated to this Cloudflare gateway.

Therefore Cloudflare credentials and a production Worker route are **not a 1.0 release prerequisite while this optional gateway has no production consumer**. The prior missing-credential observation remains true, but is reclassified from release blocker to disabled optional deployment. If a production consumer is introduced before release, this classification becomes invalid and real deployment/smoke becomes mandatory.

See `.agnir/evidence/2026-09-19-unused-gateway-consumer-audit.md`.

This docs/checkpoint revision requires its own two main CI runs after merge; code behavior is unchanged.

Project identity `urn:cineharbor:project:cineharbor-worker`, lineage `urn:cineharbor:lineage:cineharbor-worker`, Agnir Core/Profile 1.0 / repository-filesystem/1.0 and operations 1.0.2 remain unchanged. License: CC-BY-NC-SA-4.0.
