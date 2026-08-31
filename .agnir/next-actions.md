# cineharbor-worker Next Actions

0. **提交并推送本次 Agnir 初始化**（`AGNIR.yaml` / `AGENTS.md` / `.agnir/` / README 段），当前均为未提交改动。

1. `proxy.worker.js`：`wrangler deploy` 到 Cloudflare Workers；跨域/Range 按文件内注释调整。
2. `service-worker.ts`：由 Web 应用构建管线（esbuild/wrangler）编译后注册到浏览器。
