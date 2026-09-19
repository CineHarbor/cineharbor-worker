# CineHarbor Addon Gateway

An optional, thin Cloudflare Workers ingress for **one administrator-selected HTTPS addon**. It does not fetch arbitrary websites, parse content, rewrite HLS, or implement a second media data plane. The Rust addon owns those responsibilities, including media tokens and SSRF protection.

Target package version: **1.0.0**. Release and production acceptance are not yet complete.

## Security boundary

`UPSTREAM_BASE_URL` is a trusted public HTTPS addon base; `ALLOWED_ORIGINS` is an explicit comma-separated list of Web origins. Missing or invalid configuration fails closed with 503. Only declared content/media paths and GET/HEAD/OPTIONS are forwarded. Caller cookies, authorization, proxy headers and upstream cookies are never forwarded. Redirects are rejected. Range and download-intent headers are preserved; response bytes and HLS playlists are streamed unchanged. Authenticated media is never stored in shared caches. Do not use a control-plane server as the upstream.

CORS is not authentication. The upstream addon must authorize media, validate every target and redirect, and be configured with its **externally reachable public base**. There is no generic `/https://...` proxy route or proxy credential bypass. The gateway cannot sanitize an insecure addon.

## Build and deploy

Node 22 is required. Wrangler is pinned exactly to 4.135.0. The temporary `toolchain-lock.yml` workflow materializes the initial lockfile in an isolated runner; this preparation is not a release gate. Once the lock is checked in, clean builds use `npm ci`, `npm run check`, `npm test`, `npm run build`, and `npm run dry-run`.

`wrangler.json` deliberately contains no production origin, domain, account or credentials and does not expose a workers.dev preview. Before production deployment, use the account secret store for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, configure the exact addon base and Web origin allowlist, and select the intended Worker route. Do not print or commit secret values. `/healthz` reports only service name, version and whether configuration is valid. Disable raw URL/query logging: media URLs may contain tokens.

A successful dry-run is not deployment proof. Production acceptance requires a configured health response, real cross-origin catalog/media requests, rejected origins, Range, HLS/key/segment and auth failures. Versioned source and deployment IDs must be recorded before readiness can be claimed. Rollback uses the previous known-good deployment, not the retired open proxy.

## Retired surfaces

The former arbitrary-target `proxy.worker.js` forwarded caller credentials to user-chosen origins and is removed. The unused `service-worker.ts` prototype is retired: a seven-repository tracked-source inventory found no active registration/import/build consumer. Web already owns its PWA lifecycle in `cineharbor-web/worker/index.js` and downloads in `src/lib/download/`. Those implementations and their persisted `cineharbor-vod-download-v1` user cache are unchanged. Do not reintroduce the prototype as a fallback.

## License

CC BY-NC-SA 4.0; see [LICENSE](LICENSE).

## Agnir Project Instructions

Read [AGNIR.md](AGNIR.md). The declared Project identity and selected lineage in `AGNIR.yaml` remain authoritative.
