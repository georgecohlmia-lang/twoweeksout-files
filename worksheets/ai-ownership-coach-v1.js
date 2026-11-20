(() => {
  "use strict";
  const worksheetId = location.pathname.split("/").filter(Boolean)[0];
  const cashPilot = worksheetId === "two-13-week-projection";
  const adapter = cashPilot ? null : window.TWO_COACH_ADAPTERS?.[worksheetId];
  if (!cashPilot && !adapter) return;

  const style = document.createElement("style");
  style.textContent = `
    #two-coach-launch {position:fixed;right:22px;bottom:22px;z-index:9998;background:#2747f5;color:#fff;border:0;border-radius:999px;padding:14px 20px;font:700 14px Inter,Arial,sans-serif;box-shadow:0 8px 28px #10131a35;cursor:pointer}
    #two-coach-panel {position:fixed;right:22px;bottom:78px;width:min(580px,calc(100vw - 32px));height:min(760px,calc(100dvh - 100px));z-index:9999;background:#fbfaf6;color:#10131a;border:1px solid #d5d9e4;border-radius:16px;box-shadow:0 18px 55px #10131a40;display:none;flex-direction:column;font:14px Inter,Arial,sans-serif;overflow:hidden}
    #two-coach-panel[data-open="true"]{display:flex}
    #two-coach-panel header {display:flex;align-items:center;justify-content:space-between;padding:17px 19px;margin:0;background:#10131a;color:white;border:0}
    #two-coach-panel h2{font-size:17px;line-height:1.2;margin:0;color:white;font-weight:750}
    #two-coach-close{background:transparent;color:white;border:0;font-size:24px;cursor:pointer}
    #two-coach-intro{font-size:12px;color:#59616e;padding:11px 18px;border-bottom:1px solid #d5d9e4}
    #two-coach-log{flex:1;min-height:180px;overflow-y:auto;padding:17px;display:flex;flex-direction:column;gap:12px}
    .two-coach-msg{padding:11px 13px;border-radius:11px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
    .two-coach-msg.user{background:#e9ecf5;align-self:flex-end;max-width:90%}
    .two-coach-msg.assistant{background:#fff;border:1px solid #d5d9e4;align-self:flex-start;max-width:100%}
    #two-coach-prompts{display:flex;flex-wrap:wrap;gap:6px;padding:9px 14px}
    #two-coach-prompts button{background:#e9ecf5;border:1px solid #d5d9e4;border-radius:16px;padding:7px 10px;cursor:pointer;font:12px Inter,Arial,sans-serif}
    #two-coach-style-row{display:flex;align-items:center;gap:10px;padding:8px 14px;border-top:1px solid #d5d9e4;font-size:12px}
    #two-coach-style{flex:1;min-width:0;padding:8px;border:1px solid #a9afbb;border-radius:8px;background:#fff;color:#10131a}
    #two-coach-form{display:flex;gap:8px;padding:12px 14px 16px;border-top:1px solid #d5d9e4}
    #two-coach-question{flex:1;min-width:0;border:1px solid #a9afbb;border-radius:8px;padding:10px;font:14px Inter,Arial,sans-serif}
    #two-coach-send{background:#2747f5;color:white;border:0;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer}
    #two-coach-send:disabled{opacity:.5;cursor:wait}
    #two-coach-close{min-width:40px;min-height:40px}
    #two-coach-prompts button{min-height:38px}
    #two-coach-send{min-height:44px}
    #two-coach-style{min-height:42px}
    #two-coach-question{font-size:16px}
    #two-coach-log{min-height:0;overscroll-behavior:contain}
    @media(min-width:601px) and (max-height:650px){#two-coach-panel{height:calc(100dvh - 92px);bottom:76px}}\n    @media(max-width:600px){
      #two-coach-launch{right:max(12px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));padding:13px 16px;font-size:13px;max-width:calc(100vw - 24px)}
      #two-coach-panel{position:fixed;inset:0;width:100%;height:100%;height:100dvh;max-height:none;border:0;border-radius:0;box-shadow:none}
      #two-coach-panel header{padding:12px max(16px,env(safe-area-inset-right)) 12px max(16px,env(safe-area-inset-left));flex-shrink:0}
      #two-coach-intro{padding:9px 14px;line-height:1.35;flex-shrink:0}
      #two-coach-log{padding:12px 14px;flex:1}
      #two-coach-prompts{flex-wrap:nowrap;overflow-x:auto;padding:8px 12px;scrollbar-width:thin;flex-shrink:0}
      #two-coach-prompts button{flex:0 0 auto;white-space:nowrap}
      #two-coach-style-row{padding:7px 12px;flex-shrink:0}
      #two-coach-form{padding:9px 12px max(12px,env(safe-area-inset-bottom));flex-shrink:0}
      #two-coach-question{min-height:44px}
      .two-coach-msg{font-size:14px}
    }
    @media(max-width:360px){#two-coach-intro{font-size:11px}#two-coach-style-row{gap:6px}#two-coach-style-row label{font-size:11px}}
    @media print {#two-coach-launch,#two-coach-panel{display:none!important}}
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
    <div id="two-coach-intro"><span id="two-coach-disclosure"></span></div>
    <div id="two-coach-log" role="log" aria-live="polite"></div>
    <div id="two-coach-prompts">
      <button type="button" data-coach-prompt="risk">Biggest cash risk</button>
      <button type="button" data-coach-prompt="assumptions">Challenge assumptions</button>
      <button type="button" data-coach-prompt="options">Explore options</button>
      <button type="button" data-coach-prompt="habit">Monday review</button>
    </div>
    <div id="two-coach-consent-row" hidden style="padding:8px 14px;font-size:12px"><label><input type="checkbox" id="two-coach-consent"> I agree to share the worksheet answers described above with the AI Coach.</label></div>
    <div id="two-coach-style-row"><label for="two-coach-style">Coaching style</label><select id="two-coach-style"><option value="balanced">Balanced (default)</option><option value="direct">Direct and demanding</option><option value="socratic">Question-led</option></select></div>
    <form id="two-coach-form">
      <input id="two-coach-question" maxlength="1500" aria-label="Question for the Coach" placeholder="Ask about your cash decisions…" required>
      <button id="two-coach-send" type="submit">Ask</button>
    </form>`;
  document.body.append(launch, panel);

  const log = panel.querySelector("#two-coach-log");
  const form = panel.querySelector("#two-coach-form");
  const question = panel.querySelector("#two-coach-question");
  const send = panel.querySelector("#two-coach-send");
  const coachingStyle = panel.querySelector("#two-coach-style");
  const disclosure = panel.querySelector("#two-coach-disclosure");
  const consentRow = panel.querySelector("#two-coach-consent-row");
  const consent = panel.querySelector("#two-coach-consent");
  if (cashPilot) {
    disclosure.textContent = "Explore your 13-week cash forecast. Only weekly totals are shared; no line-item names or company identifiers.";
  } else {
    disclosure.textContent = worksheetId === "affordability-test"
      ? "The Coach receives salary, loading, ramp, cash and burn figures, plus whether you entered timing notes. No role name or notes are sent."
      : worksheetId === "business-model-canvas"
      ? "The Coach receives your riskiest-box rationale and proposed customer test. Written answers may contain confidential information. Business name and nine canvas boxes are excluded."
      : worksheetId === "recruiting-talent" ? "The Coach receives written role, pitch, outcomes and fit answers. These may contain confidential information. Candidate names and contact lists are excluded." : "The Coach receives selected figures, choices and written worksheet answers. Some entries may contain confidential or personal information. Review your entries before consenting.";
    consentRow.hidden = false;
    panel.querySelectorAll("[data-coach-prompt]").forEach(button => {
      button.textContent = adapter.prompts[button.dataset.coachPrompt];
    });
  }
  const history = [];
  let busy = false;
  const mobileView = () => window.matchMedia("(max-width:600px)").matches;
  let focusBeforeOpen = null;

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
    try { snapshot = cashPilot ? readSnapshot() : adapter.snapshot(); }
    catch (error) {
      addMessage("assistant", error.message || "Unable to read the forecast.");
      return;
    }
    if (cashPilot && (!snapshot.openingProvided || snapshot.entered === 0)) {
      addMessage("assistant", "Start by entering your opening bank balance and some expected cash receipts or payments. Then I can challenge your actual forecast.");
      return;
    }
    if (!snapshot) {
      addMessage("assistant", "Complete some worksheet fields first, then ask the Coach to review your decisions.");
      return;
    }
    if (!cashPilot && !consent.checked) {
      addMessage("assistant", "Review the data-sharing description and check the consent box before sending worksheet answers.");
      return;
    }
    busy = true;
    send.disabled = true;
    const cashPrompts = {risk:"Where is my biggest cash risk?",assumptions:"Challenge my assumptions.",options:"What options should I evaluate?",habit:"Help me run a Monday cash review."};
    addMessage("user", cashPilot ? (cashPrompts[message] || message) : (adapter.prompts[message] || message));
    const pending = addMessage("assistant", "Reviewing your forecast…");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ snapshot, message, history: history.slice(-8), coachingStyle: coachingStyle.value, ...(cashPilot ? {} : { worksheetId, narrativeConsent: consent.checked }) })
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
      if (!mobileView()) question.focus();
    }
  }

  function closeCoach() {
    panel.dataset.open = "false";
    launch.setAttribute("aria-expanded", "false");
    document.body.style.overflow = panel.dataset.previousOverflow || "";
    (focusBeforeOpen || launch).focus();
  }
  launch.addEventListener("click", () => {
    if (panel.dataset.open === "true") { closeCoach(); return; }
    focusBeforeOpen = document.activeElement;
    panel.dataset.previousOverflow = document.body.style.overflow;
    panel.dataset.open = "true";
    launch.setAttribute("aria-expanded", "true");
    if (mobileView()) {
      document.body.style.overflow = "hidden";
      panel.querySelector("#two-coach-close").focus({ preventScroll: true });
    } else question.focus();
  });
  panel.querySelector("#two-coach-close").addEventListener("click", closeCoach);
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); closeCoach(); }
  });
  panel.querySelectorAll("[data-coach-prompt]").forEach(button => button.addEventListener("click", () => ask(button.dataset.coachPrompt)));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const message = question.value.trim();
    if (!message) return;
    question.value = "";
    ask(message).catch(error => addMessage("assistant", error.message || "Unable to read the forecast."));
  });
  addMessage("assistant", cashPilot ? "Your cash forecast is a decision tool, not a prediction. What assumption would you like to pressure-test?" : "Your worksheet is a decision tool. What assumption should we challenge first?");
})();