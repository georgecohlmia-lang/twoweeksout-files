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

// Server-owned worksheet schemas. Legacy 13-week requests remain unchanged.
const allowedStyles = new Set(["balanced", "direct", "socratic"]);
const worksheetSchemas = {
  "cash-timing-diagnostic": {kind:"batch1-cash-timing-diagnostic",keys:["kind","values"],batch1:true},
  "extending-runway": {kind:"batch1-extending-runway",keys:["kind","values"],batch1:true},
  "mapping-founder-salary": {kind:"batch1-mapping-founder-salary",keys:["kind","values"],batch1:true},
  "defining-financial-success": {kind:"batch1-defining-financial-success",keys:["kind","values"],batch1:true},
  "choosing-your-pricing-model": {kind:"batch1-choosing-your-pricing-model",keys:["kind","values"],batch1:true},
  "setting-first-price": {kind:"batch1-setting-first-price",keys:["kind","values"],batch1:true},
  "when-to-raise-prices": {kind:"batch1-when-to-raise-prices",keys:["kind","values"],batch1:true},
  "two-estimating-revenue": {kind:"batch1-two-estimating-revenue",keys:["kind","values"],batch1:true},
  "pipeline-forecasting": {kind:"batch1-pipeline-forecasting",keys:["kind","values"],batch1:true},
  "affordability-test": {
    kind: "hire-affordability",
    keys: ["kind", "salary", "loadingFactor", "rampMonths", "cashOnHand", "monthlyNetBurn", "hasRampReasoning", "hasTimingPlan"],
    numeric: ["salary", "loadingFactor", "rampMonths", "cashOnHand", "monthlyNetBurn"],
    boolean: ["hasRampReasoning", "hasTimingPlan"]
  },
  "business-model-canvas": {
    kind: "business-model-canvas",
    keys: ["kind", "test", "riskRationale", "hasResults"],
    boolean: ["hasResults"]
  },
  "recruiting-talent": {
    kind: "recruiting-plan",
    keys: ["kind", "fields"]
  }
};
const safeKeys = (obj, keys) => obj && typeof obj === "object" && !Array.isArray(obj) &&
  Object.keys(obj).every(k => keys.includes(k));
const boundedText = (v, max) => typeof v === "string" && v.length <= max;
function validWorksheetRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if (!boundedText(body.message, 1500) || !body.message.trim()) return false;
  if (body.coachingStyle != null && !allowedStyles.has(body.coachingStyle)) return false;
  if (body.history != null && (!Array.isArray(body.history) || body.history.length > 8 ||
    !body.history.every(h => safeKeys(h, ["role", "content"]) &&
      ["user", "assistant"].includes(h.role) && boundedText(h.content, 1500)))) return false;
  if (body.worksheetId == null) {
    // Backward-compatible cash-flow pilot.
    return Array.isArray(body.snapshot?.weeks) && body.snapshot.weeks.length === 13;
  }
  const schema = worksheetSchemas[body.worksheetId], snap = body.snapshot;
  if (!schema || !safeKeys(body, ["worksheetId", "snapshot", "message", "history", "coachingStyle", "narrativeConsent"])) return false;
  if (!safeKeys(snap, schema.keys) || snap.kind !== schema.kind) return false;
  if (schema.batch1) {
    if (body.narrativeConsent !== true || !safeKeys(snap, ["kind","values"]) || !snap.values || typeof snap.values !== "object" || Array.isArray(snap.values)) return false;
    const fields=Object.entries(snap.values);
    return fields.length <= 45 && fields.every(([k,v]) => /^[a-zA-Z][a-zA-Z0-9_]{0,40}$/.test(k) && (v === null || (typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e9) || boundedText(v,300) || (Array.isArray(v) && v.length <= 8 && v.every(x=>typeof x==="number" && Number.isFinite(x) && Math.abs(x)<=1e9))));
  }
  if (body.worksheetId === "affordability-test") {
    return schema.numeric.every(k => snap[k] === null || (typeof snap[k] === "number" &&
      Number.isFinite(snap[k]) && snap[k] >= 0 && snap[k] <= 1000000000)) &&
      snap.loadingFactor !== 0 && schema.boolean.every(k => typeof snap[k] === "boolean");
  }
  if (body.narrativeConsent !== true) return false;
  if (body.worksheetId === "business-model-canvas") {
    return safeKeys(snap.test, ["who", "action", "rejectionCriterion", "dueDate"]) &&
      boundedText(snap.test.who, 400) && boundedText(snap.test.action, 400) &&
      boundedText(snap.test.rejectionCriterion, 400) && boundedText(snap.test.dueDate, 20) &&
      boundedText(snap.riskRationale, 600) && typeof snap.hasResults === "boolean";
  }
  return safeKeys(snap.fields, ["lever_scope", "lever_proximity", "lever_speed", "lever_stake",
    "pitch_owns", "pitch_90", "pitch_2y", "fit_norms", "fit_complement"]) &&
    Object.values(snap.fields).every(v => boundedText(v, 500)) &&
    Object.keys(snap.fields).length === 9;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/connection-test") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      if (!(await verifyAccess(request, env))) return json({ error: "Unauthorized" }, 401);
      if (!env.AI_COACH) return json({ connected: false, error: "Service binding missing" }, 503);
      try {
        const response = await env.AI_COACH.fetch(
          "https://two-ai-ownership-coach.georgecohlmia.workers.dev/"
        );
        return json({ authenticated: true, connected: response.status === 405, targetStatus: response.status });
      } catch {
        return json({ connected: false, error: "Connection failed" }, 502);
      }
    }
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
    if (!validWorksheetRequest(body)) {
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
