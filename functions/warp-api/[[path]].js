/**
 * Cloudflare Pages Function — WARP API DIRECT proxy (personal use only)
 *
 * WARNING: Only suitable for personal/private deployments. Do NOT use for public because:
 *
 *   1. No rate limiting — anyone who finds your URL can hammer the WARP API
 *      on your behalf, potentially getting your IP/account banned.
 *
 *   2. TLS version cannot be capped at 1.2 from Cloudflare Workers.
 *      The WARP API expects TLS 1.2 max (see wgcf reference below).
 *      cf: { minTlsVersion: '1.2' } only sets the minimum, not maximum.
 *      This may cause intermittent failures or 403/1020 errors.
 *      See: https://github.com/ViRb3/wgcf/blob/master/cloudflare/api.go
 *
 * --- Note ---
 * 1. No environment variables needed
 * 2. Deploy to Cloudflare Pages
 */

const CF_API_BASE = 'https://api.cloudflareclient.com/v0a1922';
const FORWARD_HEADERS = {
  'User-Agent': 'okhttp/3.12.1',
  'CF-Client-Version': 'a-6.3-1922',
  'Content-Type': 'application/json',
};

export async function onRequest(context) {
  const { request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const url = new URL(request.url);
  const apiPath = url.pathname.replace(/^\/warp-api/, '') || '/';
  const target = CF_API_BASE + apiPath + (url.search || '');

  const headers = { ...FORWARD_HEADERS };

  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;

  // Forward Teams JWT only if user explicitly provided one.
  // Cloudflare Access also injects cf-access-jwt-assertion automatically on
  // protected branches — but that one targets Access, not the WARP API, and
  // would cause error 2001 "invalid claim type".
  // We distinguish user-supplied vs Access-injected by checking if the request
  // also has cf-access-authenticated-user-email (only present on Access-protected
  // requests). If Access is active, we skip forwarding to avoid the conflict.
  const jwt = request.headers.get('cf-access-jwt-assertion');
  const isAccessProtected = !!request.headers.get('cf-access-authenticated-user-email');
  if (jwt && !isAccessProtected) {
    headers['CF-Access-Jwt-Assertion'] = jwt;
  }

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      cf: { minTlsVersion: '1.2' },
    });
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Upstream error', message: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
