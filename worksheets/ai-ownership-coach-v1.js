(() => {
  "use strict";
  if (!location.pathname.includes("/two-13-week-projection")) return;

  const style = document.createElement("style");
  style.textContent = `
    #two-coach-launch {position:fixed;right:22px;bottom:22px;z-index:9998;background:#2747f5;color:#fff;border:0;border-radius:999px;padding:14px 20px;font:700 14px Inter,Arial,sans-serif;box-shadow:0 8px 28px #10131a35;cursor:pointer}
    #two-coach-panel {position:fixed;right:22px;bottom:78px;width:min(420px,calc(100vw - 32px));height:min(570px,calc(100dvh - 110px));z-index:9999;background:#fbfaf6;color:#10131a;border:1px solid #d5d9e4;border-radius:16px;box-shadow:0 18px 55px #10131a40;display:none;flex-direction:column;font:14px Inter,Arial,sans-serif;overflow:hidden}
    #two-coach-panel[data-open="true"]{display:flex}
    #two-coach-panel header {display:flex;align-items:center;justify-content:space-between;padding:17px 19px;margin:0;background:#10131a;color:white;border:0}
    #two-coach-panel h2{font-size:17px;line-height:1.2;margin:0;color:white;font-weight:750}
    #two-coach-close{background:transparent;color:white;border:0;font-size:24px;cursor:pointer}
    #two-coach-intro{font-size:12px;color:#59616e;padding:11px 18px;border-bottom:1px solid #d5d9e4}
    #two-coach-log{flex:1;overflow:auto;padding:17px;display:flex;flex-direction:column;gap:12px}
    .two-coach-msg{padding:11px 13px;border-radius:11px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
    .two-coach-msg.user{background:#e9ecf5;align-self:flex-end;max-width:90%}
    .two-coach-msg.assistant{background:#fff;border:1px solid #d5d9e4;align-self:flex-start;max-width:100%}
    #two-coach-prompts{display:flex;flex-wrap:wrap;gap:6px;padding:9px 14px}
    #two-coach-prompts button{background:#e9ecf5;border:1px solid #d5d9e4;border-radius:16px;padding:7px 10px;cursor:pointer;font:12px Inter,Arial,sans-serif}
    #two-coach-form{display:flex;gap:8px;padding:12px 14px 16px;border-top:1px solid #d5d9e4}
    #two-coach-question{flex:1;min-width:0;border:1px solid #a9afbb;border-radius:8px;padding:10px;font:14px Inter,Arial,sans-serif}
    #two-coach-send{background:#2747f5;color:white;border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}
    #two-coach-send:disabled{opacity:.5;cursor:wait}
    @media print {#two-coach-launch,#two-coach-panel{display:none!important}}
    @media(max-width:550px){#two-coach-launch{right:12px;bottom:12px}#two-coach-panel{right:12px;bottom:66px}}
  `;
  document.head.appendChild(style);

  const launch = document.createElement("button");
  launch.id = "two-coach-launch";
  launch.type = "button";
  launch.textContent = "Ask the Ownership Coach";
  launch.setAttribute("aria-expanded", "false");
  launch.setAttribute("aria-controls", "two-coach-panel");

  const panel = document.createElement("section");
  panel.id = "two-coach-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "AI Ownership Coach");
  panel.dataset.open = "false";
  panel.innerHTML = `
    <header><h2>AI Ownership Coach</h2><button id="two-coach-close" type="button" aria-label="Close Coach">×</button></header>
    <div id="two-coach-intro">Explore the decisions behind your 13-week cash forecast. Only weekly totals are shared with the Coach; no line-item names or company identifiers.</div>
    <div id="two-coach-log" role="log" aria-live="polite"></div>
    <div id="two-coach-prompts">
      <button type="button" data-coach-prompt="risk">Biggest cash risk</button>
      <button type="button" data-coach-prompt="assumptions">Challenge assumptions</button>
      <button type="button" data-coach-prompt="options">Explore options</button>
      <button type="button" data-coach-prompt="habit">Monday review</button>
    </div>
    <form id="two-coach-form">
      <input id="two-coach-question" maxlength="1500" aria-label="Question for the Coach" placeholder="Ask about your cash decisions…" required>
      <button id="two-coach-send" type="submit">Ask</button>
    </form>`;
  document.body.append(launch, panel);

  const log = panel.querySelector("#two-coach-log");
  const form = panel.querySelector("#two-coach-form");
  const question = panel.querySelector("#two-coach-question");
  const send = panel.querySelector("#two-coach-send");
  const history = [];
  let busy = false;

  function addMessage(role, content) {
    const el = document.createElement("div");
    el.className = "two-coach-msg " + role;
    el.textContent = content;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function readSnapshot() {
    const openingEl = document.querySelector("#openingBalance");
    const thresholdEl = document.querySelector("#threshold");
    const openingProvided = !!openingEl && openingEl.value.trim() !== "";
    const thresholdProvided = !!thresholdEl && thresholdEl.value.trim() !== "";
    const openingBalance = openingProvided ? Number(openingEl.value) : 0;
    const threshold = thresholdProvided ? Number(thresholdEl.value) : 0;
    if (![openingBalance, threshold].every(Number.isFinite)) throw Error("Check the opening balance and minimum cash threshold.");

    const totals = { cashIn: Array(13).fill(0), cashOut: Array(13).fill(0) };
    let entered = 0;
    for (const section of ["cashIn", "cashOut"]) {
      for (const el of document.querySelectorAll('input[data-section="' + section + '"][data-week]')) {
        const w = Number(el.dataset.week);
        if (!Number.isInteger(w) || w < 0 || w > 12) continue;
        const raw = el.value.trim();
        if (!raw) continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) throw Error("Please correct an invalid cash amount.");
        totals[section][w] += value;
        entered++;
      }
    }
    let running = openingBalance;
    const weeks = Array.from({ length: 13 }, (_, i) => {
      const week = { week: i + 1, opening: running, cashIn: totals.cashIn[i], cashOut: totals.cashOut[i], closing: running + totals.cashIn[i] - totals.cashOut[i] };
      running = week.closing;
      return week;
    });
    return { scenario: "current", openingProvided, thresholdProvided, entered, openingBalance, threshold, weeks };
  }

  async function ask(message) {
    if (busy) return;
    let snapshot;
    try { snapshot = readSnapshot(); }
    catch (error) {
      addMessage("assistant", error.message || "Unable to read the forecast.");
      return;
    }
    if (!snapshot.openingProvided || snapshot.entered === 0) {
      addMessage("assistant", "Start by entering your opening bank balance and some expected cash receipts or payments. Then I can challenge your actual forecast.");
      return;
    }
    busy = true;
    send.disabled = true;
    addMessage("user", ({risk:"Where is my biggest cash risk?",assumptions:"Challenge my assumptions.",options:"What options should I evaluate?",habit:"Help me run a Monday cash review."})[message] || message);
    const pending = addMessage("assistant", "Reviewing your forecast…");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ snapshot, message, history: history.slice(-8) })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(response.status === 503 ? "The Coach connection is not enabled in this environment yet." : (result.error || "The Coach is temporarily unavailable."));
      if (typeof result.reply !== "string" || !result.reply.trim()) throw Error("The Coach returned an empty response.");
      pending.textContent = result.reply;
      history.push({ role:"user", content:message }, { role:"assistant", content:result.reply });
      if (history.length > 8) history.splice(0, history.length - 8);
    } catch (error) {
      pending.textContent = error.message || "The Coach is temporarily unavailable.";
    } finally {
      busy = false;
      send.disabled = false;
      question.focus();
    }
  }

  launch.addEventListener("click", () => {
    const open = panel.dataset.open !== "true";
    panel.dataset.open = String(open);
    launch.setAttribute("aria-expanded", String(open));
    if (open) question.focus();
  });
  panel.querySelector("#two-coach-close").addEventListener("click", () => {
    panel.dataset.open = "false";
    launch.setAttribute("aria-expanded", "false");
    launch.focus();
  });
  panel.querySelectorAll("[data-coach-prompt]").forEach(button => button.addEventListener("click", () => ask(button.dataset.coachPrompt)));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = question.value.trim();
    if (!message) return;
    question.value = "";
    ask(message).catch(error => addMessage("assistant", error.message || "Unable to read the forecast."));
  });
  addMessage("assistant", "Your cash forecast is a decision tool, not a prediction. What assumption would you like to pressure-test?");
})();