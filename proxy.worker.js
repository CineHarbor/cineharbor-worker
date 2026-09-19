// Thin addon ingress. Content fetching, HLS rewriting and media authorization
// belong to the configured addon, never to a second generic edge data plane.
const VERSION = '1.0.0';
const METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const REQUEST_HEADERS = new Set([
  'accept', 'range', 'if-range', 'if-none-match', 'if-modified-since',
  'x-cineharbor-download-intent',
]);
const RESPONSE_HEADERS = new Set([
  'content-type', 'content-length', 'content-encoding', 'content-range',
  'accept-ranges', 'etag', 'last-modified', 'content-disposition',
]);
const CONTENT_PATH = /^\/(?:manifest\.json|(?:catalog|meta|stream|subtitles)\/(?:movie|series|tv|channel)\/[^?#]+\.json|media\/(?:vod|live)\/(?:m3u8|segment|key))$/;

export function readConfig(env = {}) {
  const upstream = new URL(env.UPSTREAM_BASE_URL);
  const host = upstream.hostname.toLowerCase().replace(/\.$/, '');
  if (upstream.protocol !== 'https:' || !host || upstream.username ||
      upstream.password || upstream.search || upstream.hash ||
      /^[\d.]+$/.test(host) || host.includes(':') ||
      /(^|\.)(localhost|local|internal|invalid)$/.test(host))
    throw new Error('Invalid UPSTREAM_BASE_URL');
  const origins = new Set();
  for (const raw of String(env.ALLOWED_ORIGINS || '').split(',')) {
    if (!raw.trim()) continue;
    const origin = new URL(raw.trim());
    if (!['http:', 'https:'].includes(origin.protocol) || origin.username ||
        origin.password || origin.pathname !== '/' || origin.search || origin.hash)
      throw new Error('Invalid ALLOWED_ORIGINS');
    origins.add(origin.origin);
  }
  if (!origins.size) throw new Error('ALLOWED_ORIGINS must be explicit');
  return { upstream, origins };
}

function headersFor(origin) {
  const headers = new Headers({
    'Cache-Control': 'private, no-store',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; sandbox",
  });
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag');
  }
  return headers;
}

function errorResponse(code, status, origin) {
  const headers = headersFor(origin);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify({ error: code }), { status, headers });
}

export async function handleRequest(request, env, fetchUpstream = fetch) {
  let config;
  try { config = readConfig(env); }
  catch { return errorResponse('GATEWAY_NOT_CONFIGURED', 503); }
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && !config.origins.has(origin))
    return errorResponse('ORIGIN_NOT_ALLOWED', 403);
  if (!METHODS.has(request.method)) {
    const response = errorResponse('METHOD_NOT_ALLOWED', 405, origin);
    response.headers.set('Allow', 'GET, HEAD, OPTIONS');
    return response;
  }
  if (url.pathname === '/' || url.pathname === '/healthz') {
    const headers = headersFor(origin);
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({
      service: 'cineharbor-addon-gateway', version: VERSION, configured: true,
    }), { headers });
  }
  if (!CONTENT_PATH.test(url.pathname))
    return errorResponse('CONTENT_ROUTE_NOT_FOUND', 404, origin);
  if (request.method === 'OPTIONS') {
    const method = request.headers.get('access-control-request-method');
    const requested = (request.headers.get('access-control-request-headers') || '')
      .split(',').map((name) => name.trim().toLowerCase()).filter(Boolean);
    if (!origin || !['GET', 'HEAD'].includes(method) || requested.some((name) => !REQUEST_HEADERS.has(name)))
      return errorResponse('PREFLIGHT_NOT_ALLOWED', 403, origin);
    const headers = headersFor(origin);
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', [...REQUEST_HEADERS].join(', '));
    headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    return new Response(null, { status: 204, headers });
  }
  // Assignment to pathname cannot replace the administrator-selected origin.
  // Never interpret a caller-supplied path or query as an upstream base URL.
  const destination = new URL(config.upstream);
  destination.pathname = config.upstream.pathname.replace(/\/$/, '') + url.pathname;
  destination.search = url.search;
  const requestHeaders = new Headers();
  for (const [name, value] of request.headers)
    if (REQUEST_HEADERS.has(name.toLowerCase())) requestHeaders.set(name, value);
  try {
    const response = await fetchUpstream(new Request(destination, {
      method: request.method,
      headers: requestHeaders,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    }));
    if (response.status >= 300 && response.status < 400 && response.status !== 304) {
      await response.body?.cancel();
      return errorResponse('UPSTREAM_REDIRECT_REJECTED', 502, origin);
    }
    if (response.status >= 500 || /(?:text\/html|image\/svg\+xml)/i.test(response.headers.get('content-type') || '')) {
      await response.body?.cancel();
      return errorResponse('INVALID_UPSTREAM_RESPONSE', 502, origin);
    }
    const headers = headersFor(origin);
    for (const [name, value] of response.headers)
      if (RESPONSE_HEADERS.has(name.toLowerCase())) headers.set(name, value);
    const noBody = request.method === 'HEAD' || [204, 205, 304].includes(response.status);
    if (noBody) await response.body?.cancel();
    // Stream unchanged. The addon owns token checks, ranges and HLS rewriting.
    return new Response(noBody ? null : response.body, { status: response.status, headers });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return errorResponse(timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNAVAILABLE', timedOut ? 504 : 502, origin);
  }
}

export default { fetch: (request, env) => handleRequest(request, env) };
