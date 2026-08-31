# Agnir Decisions

## 2026-08-31 — Agnir initialization

- 本仓库以 `CineHarbor/cineharbor-worker` 作为 Project 身份，identity `urn:cineharbor:project:cineharbor-worker`。
- 采用 `repository-filesystem/0.1`，durable memory 落于 `.agnir/`；`AGNIR.yaml` 为 discovery anchor；根 `AGENTS.md` 仅作 locator；README `## Agnir Project Instructions` 为 canonical activation instruction。

## 2026-08-31 — 既有 Project 决策（源自 README）

- 边缘代理与浏览器下载 Service Worker 分工：`proxy.worker.js` 边缘转发，`service-worker.ts` 浏览器下载缓存。
