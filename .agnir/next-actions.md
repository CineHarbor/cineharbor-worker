# cineharbor-worker Next Actions

1. Run the consumer-audit checkpoint through CI; after merge require two complete successful executions on the exact final main SHA.
2. Keep the optional gateway disabled unless a real production consumer is introduced. If that changes before 1.0 publication, re-open deployment as a hard gate and require approved Cloudflare credentials plus real health/CORS/Range/HLS/auth smoke.
3. Include the verified final Worker SHA and the unused-component classification in the facade release matrix.
4. Preserve the fixed-upstream security boundary and locked toolchain; do not broaden it into an arbitrary proxy for release convenience.

Continue autonomously under the Principal's release authorization.
