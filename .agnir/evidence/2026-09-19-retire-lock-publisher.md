# Retire the completed initial lock publisher

Baseline: `0d2a383673e3b53f44f8f2626671e7a733fd4b05`; source tree `15f394e1cb281cb85c895efdac91f2d41f1d6389`. This baseline was independently resolved through GitHub and matched the verified source audit `35424839669`, attempt 2, artifact `10582965396`.

Two baseline CI runs were inspected, including every job step:

- https://github.com/CineHarbor/cineharbor-worker/actions/runs/35426573655 — quality job `105853470723`: all mandatory steps succeeded.
- https://github.com/CineHarbor/cineharbor-worker/actions/runs/35426574616 — quality job `105853511862`: all mandatory steps succeeded.

Both executed npm ci, syntax, contract tests, real workerd, build, Wrangler dry-run, dependency audit and git diff. The repeat helper is intentionally inactive on workflow_dispatch and is not a product gate.

Removed only `.github/workflows/toolchain-lock.yml`, a completed temporary publisher that still held contents/actions write permissions. Product code, lockfile and normal CI are unchanged. Node v22.16.0 revalidation in the local executor passed syntax, all 13 gateway tests (zero skips) and source build.

Checkpoint evaluation reconciled actual repository truth; state and next actions were updated coherently. Identity, selected lineage, compatibility and operational provenance remain unchanged. Publication must be non-force against this parent; reject stale publication as AGNIR_CHECKPOINT_CONFLICT. After publication, verify destination ref and fresh-read AGNIR.yaml and selected state. New-main CI and production acceptance are separate obligations, not inferred here.
