import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('production module handles real workerd requests and streams authorized ranges', { timeout: 30000 }, async (t) => {
  let upstreamCalls = 0;
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    scriptPath: path.join(root, 'proxy.worker.js'),
    compatibilityDate: '2026-09-18',
    cf: false,
    bindings: {
      UPSTREAM_BASE_URL: 'https://addons.example.com/vod',
      ALLOWED_ORIGINS: 'https://app.example.com',
    },
    outboundService: async (request) => {
      upstreamCalls++;
      assert.equal(new URL(request.url).origin, 'https://addons.example.com');
      assert.equal(request.headers.get('authorization'), null);
      assert.equal(request.headers.get('cookie'), null);
      if (new URL(request.url).pathname.endsWith('/manifest.json'))
        return new Response(JSON.stringify({id: 'runtime-fixture', version: '1.0.0', resources: ['catalog'], types: ['movie'], catalogs: []}), { headers: { 'Content-Type': 'application/json' } });
      if (new URL(request.url).searchParams.get('token') !== 'runtime-fixture')
        return new Response('unauthorized', { status: 401 });
      assert.equal(request.headers.get('range'), 'bytes=1-3');
      return new Response(new Uint8Array([1, 2, 3]), { status: 206, headers: {
        'Content-Type': 'video/mp2t', 'Content-Range': 'bytes 1-3/9', 'Content-Length': '3',
        'Accept-Ranges': 'bytes', 'Set-Cookie': 'must-not-leak=1',
      } });
    },
  }));
  t.after(() => runtime.dispose());
  const health = await runtime.dispatchFetch('https://gateway.example.com/healthz');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).version, '1.0.0');
  const catalog = await runtime.dispatchFetch('https://gateway.example.com/manifest.json', { headers: { Origin: 'https://app.example.com' } });
  assert.equal(catalog.status, 200);
  assert.equal((await catalog.json()).id, 'runtime-fixture');
  assert.equal(catalog.headers.get('access-control-allow-origin'), 'https://app.example.com');
  const badOrigin = await runtime.dispatchFetch('https://gateway.example.com/manifest.json', { headers: { Origin: 'https://evil.example.com' } });
  assert.equal(badOrigin.status, 403);
  const unknown = await runtime.dispatchFetch('https://gateway.example.com/https://untrusted.example.com/private');
  assert.equal(unknown.status, 404);
  const unauthenticated = await runtime.dispatchFetch('https://gateway.example.com/media/vod/segment');
  assert.equal(unauthenticated.status, 401);
  const range = await runtime.dispatchFetch('https://gateway.example.com/media/vod/segment?token=runtime-fixture', { headers: {
    Range: 'bytes=1-3', Authorization: 'Bearer do-not-forward', Cookie: 'private=1',
  } });
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('content-range'), 'bytes 1-3/9');
  assert.equal(range.headers.get('set-cookie'), null);
  assert.equal(range.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual([...new Uint8Array(await range.arrayBuffer())], [1, 2, 3]);
  assert.equal(upstreamCalls, 3);
});
