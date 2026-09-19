import assert from 'node:assert/strict';
import test from 'node:test';
import { handleRequest, readConfig } from '../proxy.worker.js';

const env = { UPSTREAM_BASE_URL: 'https://addons.example.com/vod', ALLOWED_ORIGINS: 'https://app.example.com,http://localhost:3000' };
const origin = 'https://app.example.com';
const request = (path = '/manifest.json', options = {}) => new Request(`https://gateway.example.com${path}`, options);
const never = () => { throw new Error('Unexpected upstream request'); };

test('unconfigured gateways fail closed without leaking configuration', async () => {
  const response = await handleRequest(request(), {}, never);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'GATEWAY_NOT_CONFIGURED' });
});

test('health is explicit and contains no upstream or credentials', async () => {
  const response = await handleRequest(request('/healthz'), env, never);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { service: 'cineharbor-addon-gateway', version: '1.0.0', configured: true });
});

test('requires a fixed HTTPS public hostname and explicit exact origins', () => {
  for (const base of ['http://a.example.com', 'https://127.0.0.1', 'https://2130706433', 'https://[::1]', 'https://foo.local', 'https://user:secret@a.example.com', 'https://a.example.com/?token=x'])
    assert.throws(() => readConfig({ ...env, UPSTREAM_BASE_URL: base }));
  for (const allowed of ['', '*', 'null', 'https://a.example.com/path', 'https://u:p@a.example.com'])
    assert.throws(() => readConfig({ ...env, ALLOWED_ORIGINS: allowed }));
});

test('legacy arbitrary URLs and control-plane routes cannot reach upstream', async () => {
  for (const path of ['/https%3A%2F%2Fevil.example%2Fsecret', '//evil.example/manifest.json', '/api/login', '/api/admin', '/media/vod/unknown'])
    assert.equal((await handleRequest(request(path), env, never)).status, 404);
});

test('write methods and unapproved origins are rejected', async () => {
  assert.equal((await handleRequest(request('/manifest.json', { method: 'POST' }), env, never)).status, 405);
  assert.equal((await handleRequest(request('/manifest.json', { headers: { origin: 'https://evil.example.com' } }), env, never)).status, 403);
});

test('preflight grants only read/range/download-intent headers for configured origins', async () => {
  const response = await handleRequest(request('/media/vod/segment', { method: 'OPTIONS', headers: {
    origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Range, X-CineHarbor-Download-Intent',
  } }), env, never);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
  for (const headers of [
    { origin, 'Access-Control-Request-Method': 'POST' },
    { origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'Authorization' },
  ]) assert.equal((await handleRequest(request('/manifest.json', { method: 'OPTIONS', headers }), env, never)).status, 403);
});

test('streams media unchanged and never forwards caller credentials or sets cookies', async () => {
  const body = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="/media/vod/key?token=test"\n/media/vod/segment?token=test\n';
  const response = await handleRequest(request('/media/vod/m3u8?source=a&url=https%3A%2F%2Fcdn.example.com%2Fa.m3u8&token=test', { headers: {
    origin, Authorization: 'Bearer private', Cookie: 'session=private', Range: 'bytes=5-9', 'x-cineharbor-download-intent': 'background',
  } }), env, async (upstream) => {
    assert.equal(new URL(upstream.url).origin, 'https://addons.example.com');
    assert.equal(new URL(upstream.url).pathname, '/vod/media/vod/m3u8');
    assert.equal(new URL(upstream.url).searchParams.get('token'), 'test');
    assert.equal(upstream.headers.get('authorization'), null);
    assert.equal(upstream.headers.get('cookie'), null);
    assert.equal(upstream.headers.get('range'), 'bytes=5-9');
    assert.equal(upstream.headers.get('x-cineharbor-download-intent'), 'background');
    assert.equal(upstream.redirect, 'manual');
    return new Response(body, { headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Set-Cookie': 'private=x', 'Cache-Control': 'public,max-age=999' } });
  });
  assert.equal(await response.text(), body);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.match(response.headers.get('vary'), /Origin/);
});

test('partial bytes and range metadata are not buffered or synthesized', async () => {
  const response = await handleRequest(request('/media/vod/segment', { headers: { Range: 'bytes=2-4' } }), env,
    async () => new Response(new Uint8Array([2, 3, 4]), { status: 206, headers: {
      'Content-Type': 'video/mp2t', 'Content-Range': 'bytes 2-4/10', 'Content-Length': '3', 'Accept-Ranges': 'bytes',
    } }));
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 2-4/10');
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [2, 3, 4]);
});

test('HEAD keeps metadata but never includes a body', async () => {
  const response = await handleRequest(request('/media/vod/segment', { method: 'HEAD' }), env,
    async (upstream) => {
      assert.equal(upstream.method, 'HEAD');
      return new Response(null, { headers: { 'Content-Length': '4096', 'Accept-Ranges': 'bytes' } });
    });
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('content-length'), '4096');
});

test('redirects are not followed or returned to the browser', async () => {
  const response = await handleRequest(request(), env, async () => new Response(null, { status: 302, headers: { Location: 'http://169.254.169.254/secret' } }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('location'), null);
});

test('preserves authorization failures and unsatisfiable ranges without caching', async () => {
  for (const status of [401, 403, 416]) {
    const response = await handleRequest(request('/media/vod/segment'), env, async () => new Response('rejected', { status }));
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
  }
});

test('unsafe documents and internal errors are sanitized', async () => {
  for (const response of [new Response('secret', { status: 500 }), new Response('<script>x</script>', { headers: { 'Content-Type': 'text/html' } })]) {
    const result = await handleRequest(request(), env, async () => response);
    assert.equal(result.status, 502);
    assert.equal((await result.text()).includes('secret'), false);
  }
  const result = await handleRequest(request(), env, async () => { throw new Error('https://private/?token=secret'); });
  assert.deepEqual(await result.json(), { error: 'UPSTREAM_UNAVAILABLE' });
});

test('network timeout has explicit diagnostic status', async () => {
  const result = await handleRequest(request(), env, async () => { throw new DOMException('secret', 'TimeoutError'); });
  assert.equal(result.status, 504);
  assert.deepEqual(await result.json(), { error: 'UPSTREAM_TIMEOUT' });
});
