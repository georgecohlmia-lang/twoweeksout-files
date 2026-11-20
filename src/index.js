// Two Weeks Out AI Coach gateway. No API credentials are exposed to browsers.
// The endpoint remains unavailable until Access settings and secrets are configured.
const json = (body, status = 200) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store" }
});

function decodeBase64Url(part) {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(bytes, c => c.charCodeAt(0));
}

async function verifyAccess(request, env) {
  const team = env.ACCESS_TEAM_DOMAIN;
  const aud = env.ACCESS_AUD;
  if (!team || !aud || !/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(team)) return false;
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  let header, payload;
  try {
    header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
  } catch { return false; }
  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== `https://${team}` ||
      !Array.isArray(payload.aud) || !payload.aud.includes(aud) ||
      typeof payload.exp !== "number" || payload.exp <= now ||
      typeof payload.iat !== "number" || payload.iat > now + 60 ||
      (payload.nbf != null && (typeof payload.nbf !== "number" || payload.nbf > now)) ||
      typeof payload.sub !== "string" || !payload.sub) return false;

  try {
    const keysResponse = await fetch(`https://${team}/cdn-cgi/access/certs`, {
      cf: { cacheTtl: 300, cacheEverything: true }
    });
    if (!keysResponse.ok) return false;
    const jwks = await keysResponse.json();
    const jwk = jwks.keys?.find(k => k.kid === header.kid && k.kty === "RSA");
    if (!jwk) return false;
    const key = await crypto.subtle.importKey(
      "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
    );
    return await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5", key, decodeBase64Url(parts[2]),
      new TextEncoder().encode(parts[0] + "." + parts[1])
    );
  } catch { return false; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/coach") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

    // Never accept a pilot token or Access JWT supplied in the JSON body.
    if (!env.AI_COACH || !env.AI_COACH_PILOT_TOKEN ||
        !env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) {
      return json({ error: "AI Coach integration not yet enabled" }, 503);
    }
    if (!(await verifyAccess(request, env))) {
      return json({ error: "Student authentication required" }, 401);
    }
    if (Number(request.headers.get("content-length") || 0) > 50000) {
      return json({ error: "Request too large" }, 413);
    }
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
    if (!body || typeof body !== "object" || !Array.isArray(body.snapshot?.weeks) ||
        body.snapshot.weeks.length !== 13 || typeof body.message !== "string") {
      return json({ error: "Invalid coach request" }, 400);
    }

    try {
      const target = new URL(request.url);
      target.pathname = "/";
      const response = await env.AI_COACH.fetch(new Request(target.toString(), {
        method: "POST",
        headers: {
          "Origin": "https://two-weeks-out-worksheets.georgecohlmia.workers.dev",
          "Authorization": `Bearer ${env.AI_COACH_PILOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }));
      const reply = await response.text();
      return new Response(reply, {
        status: response.status,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
      });
    } catch {
      return json({ error: "AI Coach service temporarily unavailable" }, 502);
    }
  }
};
