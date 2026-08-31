# cineharbor-worker Current State

CineHarbor 边缘代理与浏览器下载 Service Worker。P6 阶段迁入并改名。

- `proxy.worker.js`：Cloudflare Workers 边缘代理（`addEventListener('fetch')`），根路径返回状态页，其余按路径转发。
- `service-worker.ts`：浏览器端下载 Service Worker，把带 `x-cineharbor-download-intent` 的 vod 请求下沉为后台缓存下载（`cineharbor-vod-download-v1` 缓存、Range 支持）。
- 许可证：CC BY-NC-SA 4.0。
