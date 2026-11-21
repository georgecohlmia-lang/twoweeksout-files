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
  "mvp-scoping": {kind:"batch3-mvp-scoping",keys:["kind","values"],batch1:true},
  "interviewing-for-journey": {kind:"batch3-interviewing-for-journey",keys:["kind","values"],batch1:true},
  "customer-journey-map": {kind:"batch3-customer-journey-map",keys:["kind","values"],batch1:true},
  "cash-timing-diagnostic": {kind:"batch1-cash-timing-diagnostic",keys:["kind","values"],batch1:true},
  "extending-runway": {kind:"batch1-extending-runway",keys:["kind","values"],batch1:true},
  "mapping-founder-salary": {kind:"batch1-mapping-founder-salary",keys:["kind","values"],batch1:true},
  "defining-financial-success": {kind:"batch1-defining-financial-success",keys:["kind","values"],batch1:true},
  "choosing-your-pricing-model": {kind:"batch1-choosing-your-pricing-model",keys:["kind","values"],batch1:true},
  "setting-first-price": {kind:"batch1-setting-first-price",keys:["kind","values"],batch1:true},
  "when-to-raise-prices": {kind:"batch1-when-to-raise-prices",keys:["kind","values"],batch1:true},
  "two-estimating-revenue": {kind:"batch1-two-estimating-revenue",keys:["kind","values"],batch1:true},
  "pipeline-forecasting": {kind:"batch1-pipeline-forecasting",keys:["kind","values"],batch1:true},
  "two-building-sales-process": {kind:"batch2-two-building-sales-process",keys:["kind","values"],batch1:true},
  "two-sales-motions": {kind:"batch2-two-sales-motions",keys:["kind","values"],batch1:true},
  "two-discovery-conversation": {kind:"batch2-two-discovery-conversation",keys:["kind","values"],batch1:true},
  "prospecting-without-cold-calling": {kind:"batch2-prospecting-without-cold-calling",keys:["kind","values"],batch1:true},
  "proposal-price-objections": {kind:"batch2-proposal-price-objections",keys:["kind","values"],batch1:true},
  "handling-pricing-conversations": {kind:"batch2-handling-pricing-conversations",keys:["kind","values"],batch1:true},
  "go-to-market": {kind:"batch2-go-to-market",keys:["kind","values"],batch1:true},
  "strategic-partnerships-referrals": {kind:"batch2-strategic-partnerships-referrals",keys:["kind","values"],batch1:true},
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

    // Server-calculated first-price economics. unitCost is the worksheet's
    // fully loaded total; overheadAllocation is already included in it.
    if (body.worksheetId === "setting-first-price") {
      const v = body.snapshot.values;
      const price = v.gutPrice, cost = v.unitCost, discount = v.discountPct, targetMargin = v.targetMargin;
      const validMoney = n => typeof n === "number" && Number.isFinite(n) && n >= 0;
      const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
      if (validMoney(price) && price > 0 && validMoney(cost)) {
        v.calculatedMarginPct = round((price - cost) / price * 100);
        v.calculatedUnitProfit = round(price - cost);
        if (validMoney(discount) && discount <= 100) {
          const discountedPrice = round(price * (1 - discount / 100));
          v.calculatedDiscountedPrice = discountedPrice;
          v.calculatedDiscountedUnitProfit = round(discountedPrice - cost);
          v.calculatedDiscountedMarginPct = discountedPrice > 0
            ? round((discountedPrice - cost) / discountedPrice * 100) : null;
        }
        if (validMoney(targetMargin) && targetMargin < 100) {
          v.calculatedTargetPrice = round(cost / (1 - targetMargin / 100));
        }
        const calculated = [
          "SERVER-VERIFIED PRICING FACTS (use these exact values; do not recalculate):",
          "The worksheet's unitCost already INCLUDES overheadAllocation; NEVER add overheadAllocation again.",
          "Price: $" + price + "; fully loaded unit cost: $" + cost + ".",
          "Margin at proposed price: " + v.calculatedMarginPct + "%.",
          "Unit contribution after worksheet costs: $" + v.calculatedUnitProfit + ".",
          v.calculatedDiscountedPrice == null ? "" : "Price after stated discount: $" + v.calculatedDiscountedPrice + "; margin: " + (v.calculatedDiscountedMarginPct == null ? "undefined at zero price" : v.calculatedDiscountedMarginPct + "%") + "; unit contribution: $" + v.calculatedDiscountedUnitProfit + ".",
          v.calculatedTargetPrice == null ? "" : "Price to meet target margin: $" + v.calculatedTargetPrice + ".",
          "These are fully loaded worksheet-cost margins, not necessarily accounting gross margins. Cost assumptions remain unverified."
        ].filter(Boolean).join("\\n");
        body.message = calculated + "\\n\\nOWNER QUESTION: " + body.message;
      }
    }

    // Estimating Revenue: force separation of evidence and hypotheses in the test coach.
    // The backend is a separate Worker, so reference lesson instructions in this repo
    // are not automatically applied to its prompts.
    if (body.worksheetId === "two-estimating-revenue") {
      const v = body.snapshot.values;
      const n = k => typeof v[k] === "number" && Number.isFinite(v[k]) && v[k] >= 0 ? v[k] : null;
      const traffic = n("hypTraffic"), conv = n("hypConv"), aov = n("hypAOV");
      const hypotheticalOrders = traffic != null && conv != null ? traffic * conv / 100 : null;
      const hypotheticalMonthlyRevenue = hypotheticalOrders != null && aov != null ? hypotheticalOrders * aov : null;
      const evidence = [
        "ESTIMATING REVENUE — REQUIRED COACHING DISCIPLINE:",
        "Treat the no-signal channel's traffic, conversion rate and order value as an UNVALIDATED HYPOTHESIS, never as booked revenue, proven demand, or a reliable forecast.",
        "Explicitly distinguish identified weighted pipeline opportunities (if supplied) from untested channel assumptions; stage-weighted opportunities are estimates, not guaranteed receipts.",
        "Challenge the basis of the conversion rate, whether traffic means qualified prospects versus impressions/visits, acquisition cost, sales-cycle timing, and capacity to sell and fulfill.",
        "If an attractive three-point range or survival-line result relies heavily on unvalidated digital assumptions, say it cannot establish survival or justify fixed spending.",
        "Recommend a small, capped acquisition experiment with measurable qualified leads, actual conversion, acquisition economics, cash collection and fulfillment throughput BEFORE scaling advertising or permanent hiring.",
        "Do not assume the worksheet snapshot contains pipeline details, client counts, or capacity metrics unless they are actually supplied.",
        traffic == null ? "" : "Hypothetical monthly traffic/reach input: " + traffic + ".",
        conv == null ? "" : "Unvalidated assumed conversion: " + conv + "%.",
        aov == null ? "" : "Assumed average order value: $" + aov + ".",
        hypotheticalMonthlyRevenue == null ? "" : "Mathematical hypothetical monthly revenue (NOT validated): $" + Math.round(hypotheticalMonthlyRevenue * 100) / 100 + ".",
        n("weightedPipelineTotal") == null ? "" : "Identified opportunity weighted pipeline total (NOT cash collected): $" + n("weightedPipelineTotal") + ".",
        "Use the actual owner question to select the most consequential risk; avoid a generic checklist."
      ].filter(Boolean).join("\\n");
      body.message = evidence + "\\n\\nOWNER QUESTION: " + body.message;
    }

    if (body.worksheetId === "pipeline-forecasting") {
      const v = body.snapshot.values;
      const n = k => typeof v[k] === "number" && Number.isFinite(v[k]) && v[k] >= 0 ? v[k] : null;
      const buckets = [["Committed","committed"],["Best-case","bestCase"],["Pipeline","pipeline"],["Does not fit","dontFit"]];
      const lines = buckets.map(([label,key]) =>
        label + ": $" + (n(key+"Total") ?? "unknown") +
        "; valid deals: " + (n(key+"Count") ?? "unknown") +
        "; invalid amount entries: " + (n(key+"InvalidCount") ?? "unknown") +
        "; listed deals: " + (v[key+"Deals"] || "none captured"));
      const committed = n("committedTotal"), best = n("bestCaseTotal");
      const ownerQuestion = body.message;
      // Identify a closing target by its nearby action words, never by the first dollar figure.
      const targetPatterns = [
        /(?:expect|project|forecast|anticipate|plan|aim|target)[^.!?\n]{0,90}?\$([\d,]+(?:\.\d+)?)\s*([kKmM])?[^.!?\n]{0,70}?\b(?:clos(?:e|ing)|collect|book)\b/i,
        /(?:expect|project|forecast|anticipate|plan|aim|target)[^.!?\n]{0,35}?\$([\d,]+(?:\.\d+)?)\s*([kKmM])?/i,
        /\$([\d,]+(?:\.\d+)?)\s*([kKmM])?[^.!?\n]{0,45}?\b(?:clos(?:e|ing)|collect|book)\b/i
      ];
      let target = null;
      for (const pattern of targetPatterns) {
        const m = ownerQuestion.match(pattern);
        if (!m) continue;
        target = Number(m[1].replace(/,/g,"")) * (m[2]?.toLowerCase()==="k"?1000:m[2]?.toLowerCase()==="m"?1000000:1);
        if (Number.isFinite(target)) break;
        target = null;
      }
      const ageLines = [1,2,3,4].map(i => {
        const raw = String(v["p"+i+"_age"] ?? "").trim();
        const m = raw.match(/^(\d+(?:\.\d+)?)\s*(days?|d|weeks?|w)$/i);
        return "Stage "+i+" age: "+(m ? m[1]+" "+(/^(d|days?)$/i.test(m[2])?"days":"weeks") : raw ? raw+" (unit not verified)" : "not provided")+".";
      });
      const discipline = [
        "PIPELINE FORECASTING — REQUIRED COACHING DISCIPLINE:",
        "The following figures are WORKSHEET BUCKET TOTALS, not confirmed receipts. Treat committed as pending signature/payment, not banked cash; best-case is not guaranteed.",
        ...lines,
        ...ageLines,
        "AGE UNIT INTEGRITY: d means DAYS, w means WEEKS. Never change a supplied day figure into weeks. If unit is absent or ambiguous, say so rather than inventing it.",
        target != null && committed != null && best != null ?
          "OWNER'S STATED CLOSING TARGET: $" + target + "; committed $" + committed + "; committed plus best-case $" + (committed+best) + "; target minus committed-plus-best-case $" + (target-committed-best) + ". State this numeric comparison explicitly near the beginning of your answer; a positive gap cannot be covered even if all best-case deals close. Do not treat best-case as guaranteed." : "",
        committed != null && best != null ? "Committed plus best-case ceiling, IF every best-case deal closes: $" + (committed + best) + "." : "",
        "When the owner states a closing target and horizon, explicitly compare it with committed and committed-plus-best-case totals. If the target exceeds the latter, quantify the shortfall and explain that it requires additional uncommitted deals or new opportunities; never describe the best-case sum as an expected forecast.",
        "Do not invent a closing target if none is supplied. If any invalid deal amounts exist, acknowledge incomplete totals.",
        "Question unsupported stage conversion estimates, deal age, stalled prospects, buyer evidence, decision dates, and cash collection timing. Prioritize the strongest specific contradiction before general pipeline hygiene.",
        "Recommend an evidence-based 60-day deal-by-deal forecast before irreversible hiring decisions."
      ].filter(Boolean).join("\\n");
      body.message = discipline + "\\n\\nOWNER QUESTION: " + body.message;
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
