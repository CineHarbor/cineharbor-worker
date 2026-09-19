# cineharbor-worker Next Actions

1. Verify two complete current-main ci runs, then remove the completed temporary lock publisher. Retain npm ci, security contracts, real workerd, build, Wrangler dry-run and audit gates.
2. Resolve EXTERNAL_BLOCKER: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, UPSTREAM_BASE_URL, ALLOWED_ORIGINS and WORKER_ROUTE were all absent in the verified prerequisite check. Configure through approved stores, deploy and perform actual production health/CORS/Range/HLS/auth smoke.
3. Complete cross-repository 1.0.0 acceptance evidence. Do not publish or claim release readiness while mandatory gates remain unresolved.
