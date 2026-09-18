# cineharbor-worker

CineHarbor 边缘代理与浏览器下载 Service Worker。P6 阶段从旧项目迁入并改名。

## 内容

- `proxy.worker.js` —— Cloudflare Workers 边缘代理（`addEventListener('fetch')`），根路径返回状态页，其余按路径转发目标请求。
- `service-worker.ts` —— 浏览器端下载 Service Worker，把带 `x-cineharbor-download-intent` 的 vod 请求下沉为后台缓存下载（`cineharbor-vod-download-v1` 缓存、Range 支持）。

## 部署

- `proxy.worker.js`：`wrangler deploy` 到 Cloudflare Workers；跨域/Range 按文件内注释调整。
- `service-worker.ts`：由 Web 应用构建管线（esbuild/wrangler）编译后注册到浏览器；旧项目内源文件位于 `worker/index.ts`，此处重命名为 `service-worker.ts`。

## 许可证

CC BY-NC-SA 4.0
## Agnir Project Instructions

Agnir 的 canonical Project 激活与操作说明位于 [`AGNIR.md`](AGNIR.md)。本节仅作为旧版 Agnir `1.0.0` 激活路径的向后兼容 locator，不复制第二份 procedure。
