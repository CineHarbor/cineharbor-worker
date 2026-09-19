# cineharbor-worker Next Actions

1. Verify two complete CI runs at the cleanup revision. Preserve locked install, syntax, security contracts, workerd, build, Wrangler dry-run, audit and clean-tree gates. The two observed predecessor passes do not certify changed main.
2. Resolve production prerequisites through approved stores, deploy and perform real health/CORS/Range/HLS/auth smoke. CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, UPSTREAM_BASE_URL, ALLOWED_ORIGINS and WORKER_ROUTE were absent at the last prerequisite check; do not invent values or export credentials.
3. Complete the seven-repository 1.0.0 acceptance matrix, reconcile final evidence and fresh-resolve continuity. Keep RELEASE_READY false until every mandatory gate passes. No final public release is authorized.
