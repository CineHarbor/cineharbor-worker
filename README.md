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

本项目使用 **Agnir**（project-owned durable continuity protocol）持久保存可恢复的 Project 连续性，本仓库根目录是已授权的 Project Entry Point。开始任何 Project 工作前：

1. 读取顶层 `AGNIR.yaml`；
2. 加载 Current State（`.agnir/state.md`）与 Next Actions（`.agnir/next-actions.md`）；
3. 需要时再加载 Decisions（`.agnir/decisions.md`）与 Evidence（`.agnir/evidence/`）；
4. durable Agnir Project truth 优先于聊天记录与 Agent 私有记忆，除非被更新的 Principal 指令或直接观测到的当前 Project 事实覆盖；
5. 在保存进度、checkpoint 或结束工作时，把重要的 state / next-action / decision / evidence 变更写回 `AGNIR.yaml` 声明的 durable memory 位置。
