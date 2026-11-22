/* AI Ownership Coach: explicit worksheet snapshots, v1. No network calls. */
(function(root){
"use strict";
const text=(id,max=800)=>{const el=document.getElementById(id);return el?String(el.value||"").trim().slice(0,max):""};
const number=(id)=>{const el=document.getElementById(id);if(!el||String(el.value).trim()==="")return null;const n=Number(el.value);if(!Number.isFinite(n))throw Error("Correct the numeric field: "+id);return n};
const present=(v)=>typeof v==="string"&&v.length>0;
const specs={
"two-building-culture":{title:"Your Culture Artifact",objective:"Challenge the mismatch between what the owner says the culture should be and what actions, rewards, operating norms and tolerated behaviors actually teach. Respect acquirer versus greenfield context, preserve inherited strengths, and distinguish observed evidence from aspiration.",prompts:{"risk":"What behavior is quietly shaping the culture against my intent?","assumptions":"Challenge the gap between my culture principles and what actually happens.","options":"What should I preserve, change, or stop tolerating?","habit":"What owner behavior will make these norms real?"},snapshot(){const values={};const put=(k,v)=>{const x=String(v??"").trim();if(x)values[k]=x.slice(0,300)};for(const id of ["position","context","read-artifacts","read-patterns","read-residue","safety-problem","safety-disagreement","safety-commitment","stop"]){put(id.replace(/-/g,"_"),document.getElementById(id)?.value)};for(const group of ["keep","change","design","resist"]){document.querySelectorAll("#"+group+"-list .pair-row").forEach((row,i)=>{if(i>=3)return;const inputs=row.querySelectorAll('input[type="text"]');put(group+"_"+i+"_item",inputs[0]?.value);put(group+"_"+i+"_why",inputs[1]?.value)})};document.querySelectorAll("#norms-list .norm-row").forEach((row,i)=>{if(i>=4)return;const inputs=row.querySelectorAll('input[type="text"]');put("norm_"+i,inputs[0]?.value);put("norm_"+i+"_test",inputs[1]?.value)});const multi=document.getElementById("ml-toggle")?.checked;put("multiple_locations",multi?"yes":"no");if(multi){put("ml_presence",document.getElementById("ml-presence")?.value);put("ml_rituals",document.getElementById("ml-rituals")?.value)}if(!Object.keys(values).some(k=>k!=="multiple_locations"))return null;return {kind:"batch8-two-building-culture",values};}},

"when-whom-hire":{title:"Your First Three Hires",objective:"Challenge whether proposed first hires address a durable bottleneck, considering scored impact, constraint relief, cost of waiting, time-to-contribution, multiplier/doer type, readiness checks and hire form. Never confuse a score with proven economics or management capacity.",prompts:{"risk":"Which proposed hire creates the biggest execution or cash risk?","assumptions":"Challenge my hiring order: do we need more qualified leads or more capacity to convert existing leads?","options":"Should I hire, contract, redesign, or wait?","habit":"What evidence should trigger the next hire?"},snapshot(){const values={};const put=(k,v)=>{const x=String(v??"").trim();if(x)values[k]=x.slice(0,300)};document.querySelectorAll("#zb-list .zb-row:not(.header)").forEach((row,i)=>{if(i>=3)return;const fields=row.querySelectorAll("select,input");put("seat_"+i+"_role",fields[0]?.value==="Other (custom)"?(fields[1]?.value||"Other (custom)"):fields[0]?.value);put("seat_"+i+"_status",fields[2]?.value)});document.querySelectorAll("#score-section .score-card").forEach((card,i)=>{if(i>=3)return;put("candidate_"+i+"_role",card.querySelector(".score-card-role")?.textContent);put("candidate_"+i+"_status",card.querySelector(".score-card-cat")?.textContent);const selects=card.querySelectorAll("select");for(let j=0;j<Math.min(selects.length,5);j++)put("candidate_"+i+"_score_"+j,selects[j].value);put("candidate_"+i+"_notes",card.querySelector('input[type="text"]')?.value)});document.querySelectorAll("#ready-section .ready-card").forEach((card,i)=>{if(i>=3)return;put("ready_"+i+"_role",card.querySelector(".ready-card-role")?.textContent);card.querySelectorAll('input[type="checkbox"]').forEach((el,j)=>{if(j<3)put("ready_"+i+"_gate_"+j,el.checked?"yes":"no")})});document.querySelectorAll("#form-section .form-card").forEach((card,i)=>{if(i>=3)return;put("form_"+i,card.querySelector("select")?.value)});if(!Object.keys(values).length)return null;return {kind:"batch8-when-whom-hire",values};}},

"credit-line-strategy":{title:"Credit Line Strategy",objective:"CREDIT LINE STRATEGY: Examine whether credit is used to bridge a documented timing gap rather than permanently finance operating losses. Compare current balances and limits with available borrowing headroom, monthly operating cash generation, interest and repayment obligations. Never equate credit limit with cash or assume revenue is free cash. Respect the owner's explicit permitted and prohibited uses. Test whether a realistic downside collection delay leaves capacity to repay within the stated window; do not recommend using credit to fund structurally unprofitable spending. Do not invent interest rates or repayment terms. Choose one decision-relevant cash consequence and one concrete check.",prompts:{"risk":"Where could my borrowing plan put cash at risk?","assumptions":"Challenge my assumptions about repaying the credit line.","options":"What would be a safer way to cover this cash need?","habit":"What borrowing rule should I enforce?"},snapshot(){const values={};for(const id of ["biz-stage","monthly-sga","monthly-revenue","loc-limit","loc-balance","cc-limit","cc-balance","rbf-balance","rbf-take-rate","monthly-interest","max-exposure","sga-allowed","sga-forbidden","repayment-window","repayment-rule"]){const el=document.getElementById(id);if(!el)continue;const v=String(el.value||"").trim();if(v)values[id.replace(/-/g,"_")]=v.slice(0,300)}if(!Object.keys(values).length)return null;return {kind:"batch7-credit-line-strategy",values};}},
"sequencing-funding":{title:"Sequencing Funding",objective:"SEQUENCING FUNDING: Distinguish current business evidence from self-assessed readiness to raise. Assess whether the proposed trigger and cost of waiting justify financing now versus later, including dilution, cash runway, irreversible commitments and missed opportunity. Do not presume raising is better because growth is possible. Challenge whether the proposed funding use unlocks a measurable milestone and whether cash will last until that milestone. Honor the actual yes/no readiness gates; do not invent customer traction or term sheets. Make one economically consequential sequencing recommendation.",prompts:{"risk":"What could go wrong with my funding sequence?","assumptions":"Challenge the trigger I chose for raising capital.","options":"Should I fund this stage differently?","habit":"What evidence should determine when I raise?"},snapshot(){const values={};for(const id of ["months-in","monthly-revenue","monthly-fixed","self-assessed-stage","signal-trigger","signal-cost","signal-uses"]){const el=document.getElementById(id);if(!el)continue;const v=String(el.value||"").trim();if(v)values[id.replace(/-/g,"_")]=v.slice(0,300)}document.querySelectorAll('input[type="radio"]:checked').forEach(el=>{if(/^g[1-9][a-z]$/.test(el.name))values[el.name]=String(el.value).slice(0,300)});if(!Object.keys(values).length)return null;return {kind:"batch7-sequencing-funding",values};}},
"two-capital-plan":{title:"Capital Plan",objective:"CAPITAL PLAN: Evaluate whether the capital allocation plan funds the highest-value milestones without exhausting the cash reserve or overlooking the timing of obligations. Distinguish total available capital, cash reserves, allocated amounts and committed spending. If allocations exceed deployable capital after reserve, quantify the gap using actual worksheet figures; never assume all capital is unrestricted cash. Challenge whether each major spend has a measurable milestone and whether contingencies cover the largest specific downside. Do not invent funding sources, cost figures or financing terms. Prioritize one irreversible capital decision and one practical correction.",prompts:{"risk":"What is the biggest risk in my capital allocation?","assumptions":"Challenge my capital and reserve assumptions.","options":"What should I fund first or delay?","habit":"What milestone should control the next release of funds?"},snapshot(){const values={};for(const id of ["plan-period","plan-headline","total-capital","cash-reserves"]){const el=document.getElementById(id);if(!el)continue;const v=String(el.value||"").trim();if(v)values[id.replace(/-/g,"_")]=v.slice(0,300)}document.querySelectorAll('#allocation-list .allocation-row').forEach((row,i)=>{if(i>=5)return;row.querySelectorAll('input,select,textarea').forEach((el,j)=>{const v=String(el.value||"").trim();if(v)values["allocation_"+i+"_"+j]=v.slice(0,300)})});document.querySelectorAll('#risk-list .risk-row').forEach((row,i)=>{if(i>=5)return;row.querySelectorAll('input,textarea').forEach((el,j)=>{const v=String(el.value||"").trim();if(v)values["risk_"+i+"_"+j]=v.slice(0,300)})});if(!Object.keys(values).length)return null;return {kind:"batch7-two-capital-plan",values};}},
"market-fit-assessment":{title:"Market Fit Assessment",objective:"MARKET FIT ASSESSMENT: Compare customer groups separately using actual retention, referrals and sample sizes. Do not average away a strong segment, mistake word-of-mouth anecdotes for verified referrals, or treat a pre-launch test as proven retention. Challenge whether the strongest group is large enough and economically attractive enough to concentrate investment, and whether the proposed stop-spending choice follows the evidence. Do not invent cohort sizes, revenue, or conversion. Identify the most consequential uncertainty about repeatable customer value and one targeted evidence check.",prompts:{"risk":"Which customer group actually shows the strongest fit?","assumptions":"Challenge my conclusion about product-market fit.","options":"Where should I focus and what should I stop?","habit":"What evidence should I track next?"},snapshot(){const values={};for(const id of ["kind","win","stop","why","askWho","askStart","askWhere","noFix"]){const el=document.getElementById(id);if(!el)continue;const v=String(el.value||"").trim();if(v)values[id.replace(/-/g,"_")]=v.slice(0,300)}try{const stored=JSON.parse(localStorage.getItem("two_pmf_v1")||"null");if(stored&&Array.isArray(stored.groups))stored.groups.slice(0,6).forEach((g,i)=>{["name","how","n","stay","send"].forEach(k=>{if(g[k]!=null&&String(g[k]).trim())values["group_"+i+"_"+k]=String(g[k]).slice(0,300)})})}catch(_){};document.querySelectorAll('#groups [data-g][data-f]').forEach(el=>{const i=Number(el.dataset.g);if(i>=0&&i<6){const k="group_"+i+"_"+el.dataset.f;const v=String(el.value||"").trim();if(v)values[k]=v.slice(0,300)}});if(!Object.keys(values).length)return null;return {kind:"batch7-market-fit-assessment",values};}},

"what-corp-taught":{
 title:"The Mindset Shift",
 objective:"Challenge a corporate assumption that could mislead a new owner; preserve strengths that transfer.",
 prompts:{risk:"Which corporate habit could hurt me most as an owner?",assumptions:"Challenge an assumption I brought from corporate work.",options:"Which habit should I keep, change, or drop?",habit:"What should I test before relying on that assumption?"},
 snapshot(){
  const keys=["a1","a2","a3","h1n","h2n","h3n","h4n","sb1","sb2","d1","d2","asn1","asn2"];
  const values={}; for(const k of keys){const el=document.querySelector('[data-key="'+k+'"]');if(el&&String(el.value||"").trim())values[k.replace(/[^a-zA-Z0-9]/g,"_")]=String(el.value).trim().slice(0,300)}
  if(!Object.keys(values).length)return null;
  return {kind:"batch6-what-corp-taught",values};
 }
},
"emotional-reality":{
 title:"The Emotional Reality of Founder Finances",
 objective:"Coach sound business decisions under pressure without collecting private emotional or family details.",
 prompts:{risk:"Which financial decision habit could hurt the business?",assumptions:"Challenge my approach to a tough money decision.",options:"How can I avoid a rushed or delayed decision?",habit:"What simple decision rule should I use this week?"},
 snapshot(){
  // Exclude f1/f2, personal reflections, family details and emotional disclosures.
  const keys=["p1n","p2n","p3n","c1","c2","asn1","asn2","asn3"];
  const values={};for(const k of keys){const el=document.querySelector('[data-key="'+k+'"]');if(el&&String(el.value||"").trim())values[k]=String(el.value).trim().slice(0,300)}
  if(!Object.keys(values).length)return null;
  return {kind:"batch6-emotional-reality",values};
 }
},
"designing-business-self-fund":{
 title:"Designing Your Business to Self-Fund",
 objective:"Test the cash timing and margin assumptions behind a self-funding business model.",
 prompts:{risk:"Where could this business run short of cash?",assumptions:"Challenge the assumptions behind my self-funding plan.",options:"Which lever could improve cash timing most?",habit:"What should I verify before committing to this model?"},
 snapshot(){
  const values={};
  const numeric={"price-onetime":"oneTimePrice","margin-onetime":"oneTimeMargin","price-monthly":"monthlyPrice","margin-recurring":"recurringMargin","churn-pct":"churnPct","fixed-monthly":"fixedMonthly","reserves":"reserves","be-fixed":"breakEvenFixed","be-churn":"breakEvenChurn","be-reserves":"breakEvenReserves"};
  for(const [id,key] of Object.entries(numeric)){const el=document.getElementById(id);if(el&&String(el.value).trim()!==""){const n=Number(el.value);if(Number.isFinite(n))values[key]=n}}
  for(const [id,key] of [["lever-1","collectFaster"],["lever-2","shiftCosts"],["lever-3","improveMargin"]]){const v=text(id,300);if(v)values[key]=v}
  if(!Object.keys(values).length)return null;
  return {kind:"batch6-designing-business-self-fund",values};
 }
},
"two-customers-as-investors":{
 title:"Customers as Your First Investors",
 objective:"Test founding-customer prepayments, offer credibility, delivery obligations and cash timing without sharing candidate identities.",
 prompts:{risk:"What could go wrong with my founding-customer offer?",assumptions:"Challenge the assumptions behind customer prepayments.",options:"How can I improve the offer without overpromising?",habit:"What should I test with a prospective founding customer?"},
 snapshot(){
  const values={};
  const numeric={"standard-price":"standardPrice","founding-price":"foundingPrice","cohort-size":"cohortSize"};
  for(const [id,key] of Object.entries(numeric)){const el=document.getElementById(id);if(el&&String(el.value).trim()!==""){const n=Number(el.value);if(Number.isFinite(n))values[key]=n}}
  const fields={"biz-stage":"stage","price-unit":"priceUnit","price-locked-for":"priceLock","price-reason":"priceReason","cohort-deadline":"cohortDeadline","benefit-1":"benefitOne","benefit-2":"benefitTwo","benefit-3":"benefitThree","roadmap-now":"deliveryNow","roadmap-next":"deliveryNext","prepay-funds":"prepayUse","problem-solved":"customerProblem","experience-now":"firstMonthExperience","next-step":"nextStep"};
  for(const [id,key] of Object.entries(fields)){const v=text(id,300);if(v)values[key]=v}
  // No business name, candidate roster, contact information or relationship-context field.
  if(!Object.keys(values).length)return null;
  return {kind:"batch6-two-customers-as-investors",values};
 }
},

"two-capital-efficient-scaling":{title:"Capital-Efficient Scaling",objective:"CAPITAL-EFFICIENT SCALING: Evaluate the entered existing-customer expansion opportunities, lifecycle reactivation, pricing actions and mix shifts against current revenue, margin and customer count and the stated targets. Do not confuse planned actions or example rows with signed revenue or achieved margin. Distinguish B2B from B2C strategies. Challenge whether incremental contribution margin and delivery capacity support the revenue target without added fixed costs. Respect the existing review cadence and actions; do not recommend repeating them. Identify the most consequential untested unit-economics assumption and a measurable low-capital experiment.",prompts:{risk:"Where could this scaling plan consume more cash than expected?",assumptions:"Challenge the assumption behind my margin and revenue targets.",options:"Which existing-customer lever should be tested first?",habit:"What should we measure before adding fixed costs?"},snapshot(){const values={};let p;try{p=JSON.parse(localStorage.getItem("Two Weeks Out_capitalEfficient_v2")||"null")}catch(e){return null}if(!p)return null;const d=p;const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};add("business_revenue",get(d,"business.revenue"));add("business_margin",get(d,"business.margin"));add("business_customers",get(d,"business.customers"));add("model",get(d,"model"));add("cadenceNotes",get(d,"cadenceNotes"));add("targets_revenue",get(d,"targets.revenue"));add("targets_margin",get(d,"targets.margin"));add("targets_customers",get(d,"targets.customers"));add("targets_cadence",get(d,"targets.cadence"));(Array.isArray(d.expansion)?d.expansion:[]).slice(0,3).forEach((o,i)=>{add("expansion"+(i+1)+"_today",get(o,"today"));add("expansion"+(i+1)+"_next",get(o,"next"));add("expansion"+(i+1)+"_owner",get(o,"owner"));add("expansion"+(i+1)+"_target",get(o,"target"));});(Array.isArray(d.lifecycle)?d.lifecycle:[]).slice(0,2).forEach((o,i)=>{add("lifecycle"+(i+1)+"_segment",get(o,"segment"));add("lifecycle"+(i+1)+"_trigger",get(o,"trigger"));add("lifecycle"+(i+1)+"_next",get(o,"next"));add("lifecycle"+(i+1)+"_cadence",get(o,"cadence"));});(Array.isArray(d.pricing)?d.pricing:[]).slice(0,2).forEach((o,i)=>{add("pricing"+(i+1)+"_service",get(o,"service"));add("pricing"+(i+1)+"_current",get(o,"current"));add("pricing"+(i+1)+"_lift",get(o,"lift"));add("pricing"+(i+1)+"_reviewDate",get(o,"reviewDate"));});(Array.isArray(d.mixShift)?d.mixShift:[]).slice(0,1).forEach((o,i)=>{add("mixShift"+(i+1)+"_customer",get(o,"customer"));add("mixShift"+(i+1)+"_offer",get(o,"offer"));});(Array.isArray(d.mixShiftB2C)?d.mixShiftB2C:[]).slice(0,1).forEach((o,i)=>{add("mixShiftB2C"+(i+1)+"_customer",get(o,"customer"));add("mixShiftB2C"+(i+1)+"_offer",get(o,"offer"));});if(!Object.keys(values).length)return null;return {kind:"batch5-two-capital-efficient-scaling",values};}},
"building-scalable-system":{title:"Building a Scalable System",objective:"BUILDING A SCALABLE SYSTEM: The worked example says owner-run onboarding, hand-built monthly reporting and owner-held sales pipeline are constraints on moving from about 90 to 140 clients with two hires and less owner dependency. The proposed first build is a shared CRM, with operations lead ownership and owner sign-off; do not redundantly recommend adopting a CRM. Challenge whether this system actually removes the specific bottleneck and has measurable adoption, owner-independence and a sequencing gate. Distinguish Build now from Hold for proof. Do not recommend building every system at once or mistake a planned system for a deployed one. Give one operationally specific test.",prompts:{risk:"What is the first system likely to break as we grow?",assumptions:"Challenge the sequencing of my systems investments.",options:"How can we remove owner dependence without overbuilding?",habit:"What proves the first system is working?"},snapshot(){const values={};let p;try{p=JSON.parse(localStorage.getItem("Two Weeks Out_scalableSystems_v1")||"null")}catch(e){return null}if(!p)return null;const d=(p.state||p);const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};add("business_revenue",get(d,"business.revenue"));add("business_team",get(d,"business.team"));add("business_customers",get(d,"business.customers"));add("business_manualNow",get(d,"business.manualNow"));add("stage_nextStage",get(d,"stage.nextStage"));add("stage_blockers",get(d,"stage.blockers"));add("plan_first",get(d,"plan.first"));add("plan_owner",get(d,"plan.owner"));add("plan_start",get(d,"plan.start"));add("plan_success",get(d,"plan.success"));add("plan_notBuilding",get(d,"plan.notBuilding"));(Array.isArray(d.systems)?d.systems:[]).slice(0,5).forEach((o,i)=>{add("systems"+(i+1)+"_name",get(o,"name"));add("systems"+(i+1)+"_category",get(o,"category"));add("systems"+(i+1)+"_does",get(o,"does"));add("systems"+(i+1)+"_verdict",get(o,"verdict"));});if(!Object.keys(values).length)return null;return {kind:"batch5-building-scalable-system",values};}},
"performance-measurement":{title:"Performance Measurement",objective:"PERFORMANCE MEASUREMENT: Evaluate the actual six entered dimensions and their metric, source, current value, trigger threshold and specified decision. Distinguish a leading signal from a lagging outcome and a threshold from an observed breach. The example already establishes a weekly spreadsheet review, Friday updates by the operations lead, and an explicit reduction in ad-hoc meetings; do not suggest simply setting up a dashboard or a weekly meeting again. Challenge whether the most important metric reliably triggers a decision early enough and whether data sources can be refreshed as planned. Focus on one specific blind spot or conflicting trigger and a practical correction, not a generic KPI list.",prompts:{risk:"Which metric could give false confidence?",assumptions:"Challenge whether my triggers lead to timely decisions.",options:"Where is the biggest blind spot in this scorecard?",habit:"What should change at the next review?"},snapshot(){const values={};let p;try{p=JSON.parse(localStorage.getItem("Two Weeks Out_performanceMeasurement_v1")||"null")}catch(e){return null}if(!p)return null;const d=p;const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};add("business_revenue",get(d,"business.revenue"));add("business_quarterFocus",get(d,"business.quarterFocus"));add("cadence_when",get(d,"cadence.when"));add("cadence_day",get(d,"cadence.day"));add("cadence_who",get(d,"cadence.who"));add("commit_firstReview",get(d,"commit.firstReview"));add("commit_owner",get(d,"commit.owner"));add("commit_setup",get(d,"commit.setup"));add("commit_drop",get(d,"commit.drop"));Object.entries(d.dims||{}).slice(0,6).forEach(([k,v])=>{["metric","source","value","movement","decision"].forEach(f=>add(k+"_"+f,v&&v[f]))});if(!Object.keys(values).length)return null;return {kind:"batch5-performance-measurement",values};}},
"two-24-month-roadmap":{title:"24-Month Roadmap",objective:"24-MONTH ROADMAP: This worksheet is a 24-month offer-based revenue and weighted pipeline model, with per-offer price, customers, units, monthly close likelihood, default close rate and growth rate, plus three phase assumptions and notes. It is NOT a complete hiring or capital-expenditure schedule. Do not invent hires, investments, milestone dates, signed deals or monthly cash flows. Distinguish nominal pipeline, probability-weighted pipeline and booked revenue. Challenge the sensitivity of the projection to close likelihood, pricing, unit counts and growth-rate assumptions; identify one explicit evidence gate or scenario test tied to the owner's phase assumptions. Avoid presenting forecasts as actual results.",prompts:{risk:"Which assumption makes this 24-month projection most fragile?",assumptions:"Challenge my close-rate and growth assumptions.",options:"What downside scenario should I model?",habit:"Which evidence should change the next phase plan?"},snapshot(){const values={};let p;try{p=JSON.parse(localStorage.getItem("two_24_month_roadmap_v1")||"null")}catch(e){return null}if(!p)return null;const d=p;const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};add("growthRate",get(d,"growthRate"));add("defaultClose",get(d,"defaultClose"));add("startMonth",get(d,"startMonth"));add("a1",get(d,"a1"));add("a1_notes",get(d,"a1_notes"));add("a2",get(d,"a2"));add("a2_notes",get(d,"a2_notes"));add("a3",get(d,"a3"));add("a3_notes",get(d,"a3_notes"));(Array.isArray(d.offers)?d.offers:[]).slice(0,5).forEach((o,i)=>{add("offers"+(i+1)+"_name",get(o,"name"));add("offers"+(i+1)+"_price",get(o,"price"));add("offers"+(i+1)+"_customers",get(o,"customers"));add("offers"+(i+1)+"_units",get(o,"units"));});Object.entries(d.closeLikelihoods||{}).slice(0,3).forEach(([offer,months])=>{if(months&&typeof months==="object")Object.entries(months).slice(0,4).forEach(([month,v])=>add("close"+offer+"m"+month,v))});if(!Object.keys(values).length)return null;return {kind:"batch5-two-24-month-roadmap",values};}},
"growth-frameworks":{title:"Growth Frameworks",objective:"GROWTH FRAMEWORKS: Compare actual scored growth options using capital demand, strategic fit, time to return and recurrence, not vague enthusiasm. A ranked option is a judgment based on entered scores, not evidence of achieved growth. Respect the selected first move and explicitly deferred alternatives. Challenge whether the top option has an evidenced path to customers and whether the owner has a measurable early gate. Do not recommend pursuing all options.",prompts:{risk:"Which growth option is most vulnerable to an unproven assumption?",assumptions:"Challenge the evidence behind my highest-ranked growth option.",options:"What should I stop doing to fund the first move?",habit:"What leading indicator should trigger reconsideration?"},snapshot(){const values={};const raw=localStorage.getItem("Two Weeks Out_growthFrameworks_v1");if(!raw)return null;let p;try{p=JSON.parse(raw)}catch(e){return null}const d=p;const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);add("business_revenue",get(d,"business.revenue"));add("business_team",get(d,"business.team"));add("business_industry",get(d,"business.industry"));add("commit_start",get(d,"commit.start"));add("commit_success",get(d,"commit.success"));add("commit_notDoing",get(d,"commit.notDoing"));(Array.isArray(d.options)?d.options:[]).slice(0,5).forEach((item,i)=>{add("item"+(i+1)+"_name",get(item,"name"));add("item"+(i+1)+"_desc",get(item,"desc"));add("item"+(i+1)+"_scores_cap",get(item,"scores.cap"));add("item"+(i+1)+"_scores_fit",get(item,"scores.fit"));add("item"+(i+1)+"_scores_time",get(item,"scores.time"));add("item"+(i+1)+"_scores_rec",get(item,"scores.rec"));});if(!Object.keys(values).length)return null;return {kind:"batch4-growth-frameworks",values};}},
"product-extension":{title:"Product Extension",objective:"PRODUCT EXTENSION: Evaluate the selected adjacency against existing customer demand, delivery capability, positioning and incremental economics. The example deliberately chooses one horizontal extension for existing finance clients, targets first paid engagement by month three, three active engagements by month six and roughly 300K incremental annual revenue with improved blended margin by month twelve. These are targets, not actual results. Respect the explicit refusal to launch other extensions. Identify the most consequential unsupported demand or capacity assumption and propose one bounded test before hiring or committing to scale.",prompts:{risk:"What is the riskiest assumption behind my selected extension?",assumptions:"Challenge the evidence of customer demand for this adjacency.",options:"What should I verify before adding delivery capacity?",habit:"Which milestone should be a go or no-go gate?"},snapshot(){const values={};const raw=localStorage.getItem("Two Weeks Out_productExtension_v1");if(!raw)return null;let p;try{p=JSON.parse(raw)}catch(e){return null}const d=(p.state||p);const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);add("business_core",get(d,"business.core"));add("business_positioning",get(d,"business.positioning"));add("chosenType",get(d,"chosenType"));add("typeRationale",get(d,"typeRationale"));add("plan_milestones",get(d,"plan.milestones"));add("plan_success",get(d,"plan.success"));add("plan_notAdding",get(d,"plan.notAdding"));(Array.isArray(d.candidates)?d.candidates:[]).slice(0,5).forEach((item,i)=>{add("item"+(i+1)+"_name",get(item,"name"));add("item"+(i+1)+"_desc",get(item,"desc"));add("item"+(i+1)+"_answers_demand",get(item,"answers.demand"));add("item"+(i+1)+"_answers_capability",get(item,"answers.capability"));add("item"+(i+1)+"_answers_positioning",get(item,"answers.positioning"));});if(!Object.keys(values).length)return null;return {kind:"batch4-product-extension",values};}},
"market-expansion":{title:"Market Expansion",objective:"MARKET EXPANSION: Distinguish a prospective anchor engagement from a signed contract. The example proposes Phoenix because an existing portfolio client is expanding there, but the anchor commitment is verbal and the letter is expected within thirty days. Monthly senior visits and no local office or senior hire are deliberate capital constraints. Three active clients with two beyond the anchor in twelve months is a target, not traction. Test whether the anchor is contractually secured and whether service capacity and local referral acquisition support the plan. Recommend a bounded go or no-go condition rather than broad market research.",prompts:{risk:"What must be true before we commit to this new market?",assumptions:"Challenge my most consequential expansion assumption.",options:"Where could the expansion strain the existing business?",habit:"What is the clearest go or no-go gate?"},snapshot(){const values={};const raw=localStorage.getItem("Two Weeks Out_marketExpansion_v1");if(!raw)return null;let p;try{p=JSON.parse(raw)}catch(e){return null}const d=p;const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);add("model",get(d,"model"));add("business_home",get(d,"business.home"));add("business_revenue",get(d,"business.revenue"));add("business_service",get(d,"business.service"));add("city_name",get(d,"city.name"));add("city_why",get(d,"city.why"));add("setup_anchor",get(d,"setup.anchor"));add("setup_cadence",get(d,"setup.cadence"));add("setup_target",get(d,"setup.target"));add("setup_budget",get(d,"setup.budget"));add("commit_actions",get(d,"commit.actions"));add("commit_success",get(d,"commit.success"));Object.entries(d.preconditions||{}).forEach(([k,v])=>{add("precondition_"+k,v.answer);add("evidence_"+k,get(v,"evidence."+(d.model||"b2b")))});if(!Object.keys(values).length)return null;return {kind:"batch4-market-expansion",values};}},
"strategic-partnerships":{title:"Strategic Partnerships and Acquisitions",objective:"STRATEGIC PARTNERSHIPS AND ACQUISITIONS: Follow the actual chosen route, partnership or acquisition, rather than conflating them. The acquisition example targets a smaller advisory firm with roughly thirty clients and four senior associates, cash plus earnout and rolled equity, and assumes a three-year cash payback on standalone economics without synergies. Distinguish claimed diligence from verified evidence. Preserve acquired client relationships and senior autonomy while phasing common systems and brand. Challenge client retention, integration bandwidth, deal economics or ownership continuity using the actual plan. For a partnership, challenge delivery capacity and protection of distinctive advisory voice. Give one bounded diligence or operating gate, not a generic integration checklist.",prompts:{risk:"What is the largest hidden risk in this deal structure?",assumptions:"Challenge my most consequential acquisition or partnership assumption.",options:"What would make this move a no-go?",habit:"What should I verify before committing?"},snapshot(){const values={};const raw=localStorage.getItem("Two Weeks Out_strategicPartnerships_v1");if(!raw)return null;let p;try{p=JSON.parse(raw)}catch(e){return null}const d=p;const add=(k,v)=>{if(v===null||v===undefined)return;const s=String(v).trim();if(s)values[k]=s.slice(0,300)};const get=(o,path)=>path.split(".").reduce((a,k)=>a&&a[k],o);add("business_revenue",get(d,"business.revenue"));add("business_coreStrength",get(d,"business.coreStrength"));add("move",get(d,"move"));add("moveDescribe",get(d,"moveDescribe"));add("partnership_infra",get(d,"partnership.infra"));add("partnership_diff",get(d,"partnership.diff"));add("integration_keep",get(d,"integration.keep"));add("integration_change",get(d,"integration.change"));add("integration_retention",get(d,"integration.retention"));add("integration_culture",get(d,"integration.culture"));add("operations_capacity",get(d,"operations.capacity"));add("commit_actions",get(d,"commit.actions"));add("commit_success",get(d,"commit.success"));Object.entries(d.preconditions||{}).forEach(([k,v])=>{add("precondition_"+k,v.answer);add("evidence_"+k,v.evidence)});if(!Object.keys(values).length)return null;return {kind:"batch4-strategic-partnerships",values};}},

"two-ai-tools-marketing":{
 title:"AI Tools for Marketing",
 objective:"Separate repeatable marketing production from the original judgment and perspective that make the business distinctive; choose only useful tools and define a nondelegable guardrail.",
 prompts:{risk:"What is the weakest boundary in my AI production plan?",assumptions:"Challenge my assumptions about which marketing work AI should handle.",options:"Where can AI save time without diluting what makes my work valuable?",habit:"How can I check whether my AI workflow preserves my original perspective?"},
 snapshot(){
  const values={};
  const what=text("guard-what",300),why=text("guard-why",300);
  if(what)values.protectedWork=what;if(why)values.guardrailReason=why;
  const rows=Array.from(document.querySelectorAll("#task-list .task-row")).slice(0,15);
  rows.forEach((row,i)=>{
   const name=String(row.querySelector(".task-name")?.value||"").trim();
   const sort=String(row.querySelector(".task-sort")?.value||"").trim();
   if(name)values["task"+(i+1)]=name.slice(0,230);
   if(sort)values["task"+(i+1)+"Classification"]=sort;
  });
  Array.from(document.querySelectorAll(".cat-pick")).slice(0,8).forEach((el,i)=>{
   const choice=String(el.value||"").trim();
   if(choice)values["tool"+(i+1)+"Category"]=String(el.dataset.cat||"").slice(0,90);
   if(choice)values["tool"+(i+1)+"Choice"]=choice.slice(0,250);
  });
  if(!what&&!rows.some(row=>String(row.querySelector(".task-name")?.value||"").trim()))return null;
  return {kind:"batch3-two-ai-tools-marketing",values};
 }
},
"two-email-marketing":{
 title:"Email Marketing",
 objective:"Build a sustainable email publication and opt-in funnel, a useful welcome sequence, and a measured reply-based learning habit without unnecessary automation.",
 prompts:{risk:"What is the weakest part of my email marketing plan?",assumptions:"Challenge my biggest unproven assumption.",options:"Where should I concentrate my next effort?",habit:"What should I learn from subscriber replies before adding automation?"},
 snapshot(){
  const ids=["pub-cadence","pub-format","eop-ask","magnet-name","magnet-piece","magnet-why","refusal-why","reply-baseline","reply-sends","reply-action"];
  const names=["cadence","format","endOfPieceAsk","magnetName","magnetSource","magnetRationale","automationRefusalRationale","measuredReplyRate","measurementWindow","replyBasedAdjustment"];
  const values={};ids.forEach((id,i)=>{const v=text(id,300);if(v)values[names[i]]=v});
  Array.from(document.querySelectorAll(".subject-input")).slice(0,3).forEach((el,i)=>{const v=String(el.value||"").trim();if(v)values["subject"+(i+1)]=v.slice(0,300)});
  Array.from(document.querySelectorAll(".email-subject")).slice(0,3).forEach((el,i)=>{const v=String(el.value||"").trim();if(v)values["welcomeSubject"+(i+1)]=v.slice(0,300)});
  Array.from(document.querySelectorAll(".email-body")).slice(0,3).forEach((el,i)=>{const v=String(el.value||"").trim();if(v)values["welcomeBody"+(i+1)]=v.slice(0,300)});
  const channels=Array.from(document.querySelectorAll(".channel-checkbox")).filter(el=>el.checked).map(el=>String(el.dataset.item||"").trim());
  const refusals=Array.from(document.querySelectorAll(".refusal-checkbox")).filter(el=>el.checked).map(el=>String(el.dataset.item||"").trim());
  values.optInChannels=channels.join("; ").slice(0,300);
  values.automationNotPlanned=refusals.join("; ").slice(0,300);
  if(!values.cadence&&!values.endOfPieceAsk&&!values.magnetName)return null;
  return {kind:"batch3-two-email-marketing",values};
 }
},
"social-media-community":{
 title:"Social Media & Community",
 objective:"Choose one sustainable platform, engage selectively with relevant people, and participate in communities to learn and build trust rather than broadcast.",
 prompts:{risk:"What is the weakest part of my social and community plan?",assumptions:"Challenge the most consequential unproven assumption in this plan.",options:"Where should I focus my limited engagement time?",habit:"How do I know whether this routine produces useful relationships and learning?"},
 snapshot(){
  const ids=["audience-where","motion-sustain","platform-pick","platform-custom","platform-tradeoff","selection-filter","commenting-minutes","commenting-when","negative-space","community-discipline"];
  const names=["audienceWhere","sustainableMotion","platform","customPlatform","platformTradeoff","commentSelectionRule","dailyMinutes","commentingTime","willNotDo","communityBoundaries"];
  const values={};ids.forEach((id,i)=>{const v=text(id,300);if(v)values[names[i]]=v});
  const engagement=Array.from(document.querySelectorAll("#engagement-list .engagement-row"));
  values.engagementCount=engagement.filter(row=>String(row.querySelector(".eng-name")?.value||"").trim()).length;
  engagement.slice(0,10).forEach((row,i)=>{
   const name=String(row.querySelector(".eng-name")?.value||"").trim();
   const why=String(row.querySelector(".eng-why")?.value||"").trim();
   if(name)values["person"+(i+1)]=name.slice(0,180);
   if(why)values["person"+(i+1)+"Why"]=why.slice(0,240);
  });
  const communities=Array.from(document.querySelectorAll("#community-list .community-row")).slice(0,4);
  communities.forEach((row,i)=>{
   const name=String(row.querySelector(".comm-name")?.value||"").trim();
   const type=String(row.querySelector(".comm-type")?.value||"").trim();
   const why=String(row.querySelector(".comm-why")?.value||"").trim();
   if(name)values["community"+(i+1)]=name.slice(0,180);
   if(type)values["community"+(i+1)+"Type"]=type;
   if(why)values["community"+(i+1)+"Why"]=why.slice(0,240);
  });
  if(!values.audienceWhere&&!values.platform&&!values.engagementCount)return null;
  return {kind:"batch3-social-media-community",values};
 }
},
"two-content-marketing":{
 title:"Content Marketing",
 objective:"Build a differentiated anchor piece and a distribution strategy grounded in audience questions, owned reach, and realistic earned-media relationships.",
 prompts:{risk:"What is the weakest link in my content and distribution plan?",assumptions:"Which part of my content strategy is still an assumption rather than demonstrated traction?",options:"What should I prioritize before producing the full anchor piece?",habit:"How do I turn audience questions into a repeatable content and follow-up loop?"},
 snapshot(){
  const ids=["anchor-title","anchor-coverage","prop-credibility","prop-depth","prop-question","owned-channel","owned-context","followup-channel","followup-thread","relationships"];
  const names=["anchorTitle","anchorCoverage","credibility","distinctiveDepth","audienceQuestion","ownedChannel","ownedContext","followupChannel","followupThread","relationships"];
  const values={};ids.forEach((id,i)=>{const v=text(id,300);if(v)values[names[i]]=v});
  const phrases=Array.from(document.querySelectorAll("#phrasings-list .phrasing-row input")).map(el=>String(el.value||"").trim()).filter(Boolean);
  values.audiencePhrasingCount=phrases.length;
  phrases.slice(0,12).forEach((v,i)=>values["audiencePhrase"+(i+1)]=v.slice(0,180));
  const earned=Array.from(document.querySelectorAll("#earned-list .earned-row")).slice(0,5);
  earned.forEach((row,i)=>{
   const p=String(row.querySelector(".earned-placement")?.value||"").trim();
   const state=String(row.querySelector(".earned-state")?.value||"").trim();
   const detail=String(row.querySelector(".earned-relationship")?.value||"").trim();
   if(p)values["placement"+(i+1)]=p.slice(0,240);
   if(state)values["placement"+(i+1)+"Status"]=state;
   if(detail)values["placement"+(i+1)+"Relationship"]=detail.slice(0,280);
  });
  if(!values.anchorTitle&&!values.anchorCoverage&&!values.ownedChannel)return null;
  return {kind:"batch3-two-content-marketing",values};
 }
},
"marketing-strategy":{
 title:"Marketing Strategy Fundamentals",
 objective:"Turn specific positioning and one identifiable audience into a focused, executable marketing strategy with a primary channel, supporting channel, realistic owner hours, and a credible outcome.",
 prompts:{risk:"What is the weakest link in my one-page marketing strategy?",assumptions:"Challenge the most consequential unsupported assumption in my channel strategy.",options:"What should I prioritize or stop doing with the time I have?",habit:"How should I tell if this strategy is working?"},
 snapshot(){
  const ids=["pos-for","pos-against","audience-desc","audience-size","primary-channel","primary-type","primary-distribution","primary-why","supporting-channel","supporting-type","supporting-distribution","supporting-why","weekly-hours","viability"];
  const names=["positionFor","positionAgainst","audience","audienceSize","primaryChannel","primaryType","primaryDistribution","primaryWhy","supportingChannel","supportingType","supportingDistribution","supportingWhy","weeklyHours","viability"];
  const values={};ids.forEach((id,i)=>{const value=text(id,300);if(value)values[names[i]]=value});
  if(!values.positionFor&&!values.audience&&!values.primaryChannel)return null;
  return {kind:"batch3-marketing-strategy",values};
 }
},
"prototyping":{
 title:"Prototyping",
 objective:"Use actual prototype delivery and customer behavior to find the operational bottleneck, distinguish demand from deliverability, and test whether service hours can scale.",
 prompts:{risk:"What is the biggest delivery risk this prototype exposed?",assumptions:"Challenge my assumptions about the hours and people needed to deliver this.",options:"What is the simplest change to test before scaling?",habit:"What should I measure in the next delivery run?"},
 snapshot(){
  const fields=["claim","deliver","level","parts","price","c1","c2","c3","c4","same","nInv","nYes","nBar","back","asked","skipped","assumed","bn","bnEv","bnAns","bnHow","eventual","fte","verdict","t1","t2"];
  const values={};
  for(const k of fields){
    const radio=document.querySelectorAll('input[type="radio"][data-k="'+k+'"]');
    const el=radio.length?Array.from(radio).find(x=>x.checked):document.querySelector('[data-k="'+k+'"]');
    values[k]=el?(el.type==="checkbox"?(el.checked?"yes":"no"):String(el.value||"").trim().slice(0,300)):"";
  }
  // Include only aggregate hours by category; exclude staff names, business identity and full service line descriptions.
  let per=0,fixed=0,hasHours=false;
  document.querySelectorAll('#lines [data-l][data-f="sort"]').forEach(el=>{
    const row=el.closest('.cline');if(!row)return;
    const vis=row.querySelector('[data-f="vis"]')?.value?.trim()||"";
    const prep=row.querySelector('[data-f="prep"]')?.value?.trim()||"";
    if(vis===""&&prep==="")return;
    const a=Number(vis),b=Number(prep);
    if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<0)return;
    hasHours=true;
    if(el.value==="fixed")fixed+=a+b;else per+=a+b;
  });
  values.hoursPerCustomer=hasHours?per:null;
  values.fixedGroupHours=hasHours?fixed:null;
  // No names, customer identifiers, staff roster, or localStorage transmitted.
  if(!["claim","bn","bnEv","skipped","verdict"].some(k=>present(values[k]))&&!present(values.nYes))return null;
  return {kind:"batch3-prototyping",values};
 }
},

"mvp-scoping":{
 title:"Minimum Viable Product Scoping",
 objective:"Determine whether the MVP isolates one falsifiable customer claim, removes nonessential scope, targets the right buyers, charges a meaningful price and commits to an observable kill criterion before results arrive.",
 prompts:{risk:"What makes this MVP test incapable of giving us a useful answer?",assumptions:"Challenge the claim, audience and willingness-to-pay assumptions.",options:"What should we remove or change to make this a cleaner test?",habit:"What evidence should determine whether we continue or stop?"},
 snapshot(){
  const fields=["claim","box","boxNote","parked","scopeIn","scopeOut","audType","audN","audWho","days","afterEnd","priceType","price","killN","killOf","killWhat","killThen","agreed","abandon","can","result","line","nextQ"];
  const values={};
  for(const k of fields){
    const radios=document.querySelectorAll('input[type="radio"][data-k="'+k+'"]');
    const el=radios.length?Array.from(radios).find(x=>x.checked):document.querySelector('[data-k="'+k+'"]');
    values[k]=el?(el.type==="checkbox"?(el.checked?"yes":"no"):String(el.value||"").trim().slice(0,300)):"";
  }
  for(const k of ["sc1","sc2","sc3"])values[k]=document.querySelector('input[data-k="'+k+'"]')?.checked?"yes":"no";
  // Exclude business and concept names, named decision makers, full initial build wishlist, contact information and localStorage.
  // Do not infer test outcomes from the example or from an empty result.
  if(!["claim","scopeIn","audWho","killWhat","abandon","result"].some(k=>present(values[k])))return null;
  return {kind:"batch3-mvp-scoping",values};
 }
},

"interviewing-for-journey":{
 title:"Interviewing for the Journey",
 objective:"Test whether interview evidence actually changes the customer's trigger, stall and unresolved belief, and choose a behavior-based next interview rather than relying on assumptions.",
 prompts:{risk:"What is the biggest gap between our draft and what customers described?",assumptions:"Challenge whether the interviews support my interpretation.",options:"What should we investigate about the longest stall?",habit:"What should I verify in the next interview?"},
 snapshot(){
  const ids=["trigDraft","trigHeard","stallDraft","stallHeard","belief","resolve","whoRoom"];
  const values=Object.fromEntries(ids.map(k=>{const el=document.querySelector('[data-k="'+k+'"]');return [k,el?String(el.value||"").trim().slice(0,300):""];}));
  const sit=document.querySelector('input[name="sit"]:checked')?.value||"";
  values.situation=["book","hand","none"].includes(sit)?sit:"unspecified";
  for(const id of ["tr1","tr2","tr3","tr4"])values[id]=!!document.querySelector('input[data-k="'+id+'"]')?.checked?"yes":"no";
  // Never transmit business name, participant identities, interview notes, row text or localStorage.
  if(!ids.some(k=>present(values[k])))return null;
  return {kind:"batch3-interviewing-for-journey",values};
 }
},

"customer-journey-map":{
 title:"Customer Journey Map",
 objective:"Distinguish assumed customer triggers from observed behavior, identify the unresolved belief behind the longest stall, and choose one interview question to test it.",
 prompts:{risk:"Where is the weakest assumption in my customer journey?",assumptions:"What am I assuming about why customers begin looking?",options:"How should I investigate the longest stall?",habit:"What should I ask a customer next?"},
 snapshot(){
 const keys=["trigger","stallWhy","stallTime","askNext"];
 const values=Object.fromEntries(keys.map(k=>[k,text(k,300)]));
 values.mapStatus=document.getElementById("status")?.value==="v2"?"interview-revised":"draft";
 values.businessStage=document.querySelector('input[name="mode"]:checked')?.value==="live"?"existing-customers":document.querySelector('input[name="mode"]:checked')?.value==="pre"?"pre-launch":"unspecified";
 // Business name, contact information, and individual customer-row narratives are excluded.
 if(!keys.some(k=>present(values[k])))return null;
 return {kind:"batch3-customer-journey-map",values};
 }
},

"cash-timing-diagnostic":{title:"Cash Timing Diagnostic",objective:"Challenge cash timing, minimum balances, and concentration of outflows.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["openingBalance"]=number("openingBalance");
const extra="cash-timing-diagnostic";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"extending-runway":{title:"Extending Runway",objective:"Evaluate the trade-off between extending runway and damaging revenue capacity.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["monthlyBurn"]=number("monthlyBurn");values["cashAccel"]=number("cashAccel");values["move1"]=text("move1",300);values["move2"]=text("move2",300);values["move3"]=text("move3",300);values["protected"]=text("protected",300);
const extra="extending-runway";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"mapping-founder-salary":{title:"Mapping Founder Salary",objective:"Examine owner draw sustainability against cash resources and business milestones.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["capSavings"]=number("capSavings");values["capStartup"]=number("capStartup");values["capSpouse"]=number("capSpouse");values["capOther"]=number("capOther");values["milestoneAmount"]=number("milestoneAmount");values["milestoneMonth"]=number("milestoneMonth");values["salaryMin"]=number("salaryMin");values["salaryTriggerRev"]=number("salaryTriggerRev");
const extra="mapping-founder-salary";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"defining-financial-success":{title:"Defining Financial Success",objective:"Separate leading indicators of business health from reassuring but weak signals.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};
const extra="defining-financial-success";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"choosing-your-pricing-model":{title:"Choosing Your Pricing Model",objective:"Test pricing cadence, route to customer and capacity constraints.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["whatSold"]=text("what-sold",300);values["hopedModel"]=text("hoped-model",300);
const extra="choosing-your-pricing-model";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"setting-first-price":{title:"Setting Your First Price",objective:"Test unit economics, competitive evidence, and value before choosing a first price.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["gutPrice"]=number("gut-price");values["targetMargin"]=number("target-margin");values["marketLow"]=number("market-low");values["marketHigh"]=number("market-high");values["discountPct"]=number("discount-pct");values["valueStatement"]=text("value-statement",300);values["triggerEvent"]=text("trigger-event",300);const costInputs=Array.from(document.querySelectorAll("input[data-cost-field]"));const enteredCosts=costInputs.filter(el=>el.value.trim()!=="");if(enteredCosts.length){const amounts=enteredCosts.map(el=>Number(el.value));if(amounts.some(n=>!Number.isFinite(n)||n<0))throw Error("Correct invalid delivery costs.");values.unitCost=Math.round(amounts.reduce((a,b)=>a+b,0)*100)/100;values.costItemsEntered=enteredCosts.length;values.overheadAllocation=number("cost-overhead");}
const extra="setting-first-price";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"when-to-raise-prices":{title:"When to Raise Prices",objective:"Assess price increase readiness against evidence, retention and capacity.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["currentPrice"]=number("current-price");values["targetPrice"]=number("target-price");values["monthsIn"]=number("months-in");values["foundingClients"]=number("founding-clients");values["transitionCap"]=number("transition-cap");values["triggerText"]=text("trigger-text",300);values["referenceEvidence"]=text("reference-evidence",300);
const extra="when-to-raise-prices";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"two-estimating-revenue":{title:"Estimating Revenue",objective:"Distinguish evidenced revenue from speculative conversion assumptions and capacity.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["hypTraffic"]=number("hypTraffic");values["hypConv"]=number("hypConv");values["hypAOV"]=number("hypAOV");values["consvPct"]=number("consvPct");values["upsidePct"]=number("upsidePct");values["survivalLine"]=number("survivalLine");values["noteSales"]=text("noteSales",300);values["noteFulfil"]=text("noteFulfil",300);values["noteOwner"]=text("noteOwner",300);
values["signalChannel"]=text("signalChannel",150);
values["nosignalChannel"]=text("nosignalChannel",150);
// Capture the actual opportunity values and selected conversion rates from the
// visible pipeline rows, not merely the hypothetical digital-channel inputs.
let pipelineTotal=0,pipelineCount=0;
for(const row of document.querySelectorAll("#pipelineBody tr")){
  const val=row.querySelector('[data-field="value"]');
  const rate=row.querySelector('[data-field="rate"]');
  if(!val||!rate)continue;
  const v=Number(val.value.replace(/[$,\\s]/g,""));
  const p=Number(rate.value.replace(/[%,\\s]/g,""));
  if(!Number.isFinite(v)||!Number.isFinite(p)||v<0||p<0||p>100)continue;
  pipelineTotal+=v*p/100;pipelineCount++;
}
values["weightedPipelineTotal"]=Math.round(pipelineTotal*100)/100;
values["pipelineOpportunityCount"]=pipelineCount;
const extra="two-estimating-revenue";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"pipeline-forecasting":{title:"Pipeline Forecasting",objective:"Challenge stage conversion assumptions and forecast confidence.",prompts:{"risk":"What is the most consequential risk in these answers?","assumptions":"Challenge my most important assumption.","options":"Which alternative should I evaluate?","habit":"What should I verify next?"},snapshot(){const values={};values["dataGaps"]=text("data-gaps",300);values["leaveOff"]=text("leave-off",300);
for(const [bucket,key] of [["committed","committed"],["best-case","bestCase"],["pipeline","pipeline"],["dontfit","dontFit"]]){
  let total=0,count=0,invalid=0;
  const names=[];
  for(const row of document.querySelectorAll("#"+bucket+"-list .deal-row")){
    const name=(row.querySelector('[data-role="name"]')?.value||"").trim();
    const raw=(row.querySelector('[data-role="value"]')?.value||"").trim();
    if(!name&&!raw)continue;
    const match=raw.replace(/[$,\s]/g,"").match(/^(\d+(?:\.\d+)?)([kKmM])?$/);
    const amount=match?Number(match[1])*(match[2]?.toLowerCase()==="k"?1000:match[2]?.toLowerCase()==="m"?1000000:1):NaN;
    if(!Number.isFinite(amount)||amount<0){invalid++;continue;}
    total+=amount;count++;
    if(names.length<5)names.push((name||"Unnamed deal").slice(0,55)+": $"+amount);
  }
  values[key+"Total"]=Math.round(total*100)/100;
  values[key+"Count"]=count;
  values[key+"InvalidCount"]=invalid;
  values[key+"Deals"]=names.join("; ").slice(0,300);
}
const extra="pipeline-forecasting";
if(extra==="defining-financial-success"){for(const k of ["q1n","q2n","q3n","q4n","ts1","ts2","ts3"]){const el=document.querySelector('[data-key="'+k+'"]');values[k]=el?String(el.value||"").trim().slice(0,300):"";}}
if(extra==="choosing-your-pricing-model"){for(const k of ["cadence","access"]){values[k]=document.querySelector('input[name="'+k+'"]:checked')?.value||"";}values.cap=Array.from(document.querySelectorAll('input[name="cap"]:checked')).map(x=>x.value).slice(0,5).join(",");}
if(extra==="when-to-raise-prices"){values.primaryTrigger=document.querySelector('input[name="primary-trigger"]:checked')?.value||"";}
if(extra==="pipeline-forecasting"){for(let i=1;i<=4;i++)for(const field of ["count","age","conv"])values["p"+i+"_"+field]=text("p"+i+"-"+field,35);}
if(extra==="cash-timing-diagnostic"){let inflows=Array(8).fill(0),outflows=Array(8).fill(0),entries=0;for(const el of document.querySelectorAll('input[data-section][data-week]')){const w=Number(el.dataset.week),v=el.value.trim(),section=el.dataset.section;if(!v||!Number.isInteger(w)||w<0||w>7||!["inflows","outflows"].includes(section))continue;const n=Number(v);if(!Number.isFinite(n))throw Error("Correct invalid cash amounts.");(section==="inflows"?inflows:outflows)[w]+=n;entries++;}values.weeklyInflows=inflows;values.weeklyOutflows=outflows;values.entries=entries;}
if(extra==="two-estimating-revenue"){for(const k of ["hypTraffic","hypConv","hypAOV","consvPct","upsidePct","survivalLine"]){const el=document.getElementById(k);if(el&&el.value.trim()){const n=Number(el.value.replace(/[$,%\s,]/g,""));values[k]=Number.isFinite(n)?n:null;}}}
if(!Object.values(values).some(v=>Array.isArray(v)?v.some(x=>x!==0):v!==null&&v!==""&&v!==0))return null;return {kind:"batch1-"+extra,values};}},
"two-building-sales-process":{
 title:"Building Your Sales Process",
 objective:"Test whether four sales stages represent verifiable buyer progression and whether a new hire could execute the process without founder intervention.",
 prompts:{
  risk:"Which stage creates the greatest risk of a misleading pipeline?",
  assumptions:"Challenge whether my stages measure buyer progress rather than sales activity.",
  options:"What should I change before hiring another salesperson?",
  habit:"What evidence should I review weekly to improve this process?"
 },
 snapshot(){
  const values={motionType:document.querySelector('input[name="motion-type"]:checked')?.value||"",motionName:text("motion-name",160)};
  for(let i=1;i<=4;i++){
   values["s"+i+"Entry"]=text("s"+i+"-entry",300);
   values["s"+i+"Exit"]=text("s"+i+"-exit",300);
   values["s"+i+"Artifact"]=text("s"+i+"-artifact",300);
  }
  for(let i=1;i<=5;i++)values["inherit"+i]=document.getElementById("inh-"+i)?.checked===true?"yes":"no";
  values.biggestGap=text("biggest-gap",300);
  values.gapAction=text("gap-action",300);
  if(!values.motionType&&!values.motionName&&!values.biggestGap&&!values.gapAction&&![1,2,3,4].some(i=>values["s"+i+"Entry"]||values["s"+i+"Exit"]||values["s"+i+"Artifact"]))return null;
  return {kind:"batch2-two-building-sales-process",values};
 }
},
"two-sales-motions":{
 title:"Choosing Your Sales Motion",
 objective:"Test whether the selling process fits each offer's actual buyer decision cycle, decision makers and initial clarity; challenge one-size-fits-all sales motions.",
 prompts:{risk:"Where does our selling motion most seriously conflict with buyer behavior?",assumptions:"Challenge our assumptions about how buyers make decisions.",options:"Which offer or process should we redesign first?",habit:"What buyer evidence should we collect next?"},
 snapshot(){
  const cards=Array.from(document.querySelectorAll("#offer-list .offer-card")).slice(0,5);
  const values={offerCount:cards.length};
  cards.forEach((card,i)=>{
   const n=i+1;
   values["offer"+n+"Name"]=String(card.querySelector(".offer-name")?.value||"").trim().slice(0,180);
   for(const q of ["cycle","deciders","clarity"])values["offer"+n+q[0].toUpperCase()+q.slice(1)]=String(card.querySelector('.q-select[data-q="'+q+'"]')?.value||"").trim();
   values["offer"+n+"Mismatch"]=String(card.querySelector(".offer-mismatch")?.value||"").trim().slice(0,300);
  });
  if(!cards.some(card=>card.querySelector(".offer-name")?.value.trim()||card.querySelector(".offer-mismatch")?.value.trim()||Array.from(card.querySelectorAll(".q-select")).some(x=>x.value)))return null;
  return {kind:"batch2-two-sales-motions",values};
 }
},
"two-discovery-conversation":{
 title:"The Discovery Conversation",
 objective:"Distinguish substantive buyer discovery from superficial questioning and premature pitching; examine stakes, underlying cause, playback and transition.",
 prompts:{risk:"Where does my discovery conversation fail to uncover the real buying problem?",assumptions:"Challenge my assumption that asking many questions means I have done discovery.",options:"What should I change in the conversation?",habit:"What should I verify in my next discovery call?"},
 snapshot(){
  const ids=["map-open","map-count","map-style","map-pitch","design-open","q-opener","q-peeler","q-stakes","q-success","design-playback","design-transition","layer-1","layer-2","layer-3","layer-4"];
  const values={};
  ids.forEach(id=>{const key=id.replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase());values[key]=text(id,300)});
  if(!Object.values(values).some(v=>v))return null;
  return {kind:"batch2-two-discovery-conversation",values};
 }
},
"prospecting-without-cold-calling":{
 title:"Prospecting Without Cold Calling",
 objective:"Evaluate whether referral and targeted prospecting form a repeatable source of qualified conversations, not just activity; challenge unverified conversion assumptions and vague asks.",
 prompts:{risk:"What is the biggest weakness in my prospecting engine?",assumptions:"Challenge my assumptions about referrals and lead flow.",options:"Which prospecting activity should I prioritize?",habit:"What should I measure over the next four weeks?"},
 snapshot(){
  const values={
   closeRate:text("q1-close-rate",120),qualifiedConversationsPerWeek:text("q2-volume",120),
   existingReferralInboundFlow:text("q3-existing-flow",300),
   referralTarget:text("ask-1",300),referralValue:text("ask-2",300),referralIntroduction:text("ask-3",300),
   narrowUnlocked:!!document.getElementById("narrow-unlock")?.checked
  };
  const rows=Array.from(document.querySelectorAll("#prospect-list .prospect-row")).slice(0,5);
  values.prospectCount=rows.length;
  rows.forEach((row,i)=>{values["prospect"+(i+1)+"Name"]=String(row.querySelector('[data-role="name"]')?.value||"").trim().slice(0,200);values["prospect"+(i+1)+"Reason"]=String(row.querySelector('[data-role="reason"]')?.value||"").trim().slice(0,300)});
  if(!Object.entries(values).some(([k,v])=>typeof v==="string"&&v.trim()))return null;
  values.narrowUnlocked=values.narrowUnlocked?"yes":"no";
  return {kind:"batch2-prospecting-without-cold-calling",values};
 }
},
"proposal-price-objections":{
 title:"Proposal and Price Objections",
 objective:"Test whether the proposal connects buyer-stated situation to a specific recommendation, clear price, committed next step and diagnostic objection response rather than reflexive discounting.",
 prompts:{risk:"What is the biggest weakness in this proposal?",assumptions:"Challenge my assumption that price is the real objection.",options:"How should I handle this objection without discounting reflexively?",habit:"What should I verify before sending this proposal?"},
 snapshot(){
  const ids=["prospect-name","situation","recommendation","price","next-step","silence-note","obj-acknowledge","obj-question","obj-listen"];
  const values={};
  ids.forEach(id=>{values[id.replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase())]=text(id,300)});
  values.objectionType=String(document.querySelector('input[name="obj-type"]:checked')?.value||"");
  values.practiceRepetitions=[1,2,3,4,5].filter(i=>document.getElementById("rep-"+i)?.checked).length;
  if(!Object.entries(values).some(([k,v])=>typeof v==="string"&&v.trim()))return null;
  return {kind:"batch2-proposal-price-objections",values};
 }
},
"handling-pricing-conversations":{
 title:"Handling Pricing Conversations",
 objective:"Assess whether the owner communicates a specific value anchor and confident price, substantiates competitive positioning, and diagnoses objections without inventing ROI or discounting automatically.",
 prompts:{risk:"What is the biggest weakness in my pricing conversation?",assumptions:"Challenge my assumptions about how buyers interpret our price.",options:"How should I respond to a request for a lower price?",habit:"What evidence should I gather before revising price?"},
 snapshot(){
  const ids=["biz-name","what-sold","price","price-context","anchor","delivery-sentence","market-range","diagnose-question","think-response"];
  const values={};
  ids.forEach(id=>{values[id.replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase())]=text(id,300)});
  if(!Object.values(values).some(v=>v))return null;
  return {kind:"batch2-handling-pricing-conversations",values};
 }
},
"go-to-market":{
 title:"Go-to-Market",
 objective:"Evaluate whether the owner has chosen a buyer-evidenced acquisition channel, a repeatable outreach mechanism, a meaningful outcome metric and a realistic decision window.",
 prompts:{risk:"What is the biggest unsupported assumption in my go-to-market plan?",assumptions:"Challenge whether this channel is actually validated by customers.",options:"What should I test before investing more in this channel?",habit:"What evidence should determine whether to continue or stop?"},
 snapshot(){
  const ids=["bizName","gDate","group","how","before","channel","what","toWhom","often","cost","answer","notDo","metric","target","per","start","weeks","decideW"];
  const values={};
  ids.forEach(id=>{values[id]=text(id,300)});
  values.preLaunch=document.querySelector('[data-k="pre"]')?.checked?"yes":"no";
  values.referralRulesChecked=document.querySelector('[data-k="rules"]')?.checked?"yes":"no";
  const ten=Array.from(document.querySelectorAll('[data-arr="ten"]')).slice(0,10).map(el=>String(el.value||"").trim().slice(0,150));
  ten.forEach((v,i)=>{values["customerSource"+(i+1)]=v});
  const logs=Array.from(document.querySelectorAll('[data-obj="log"]')).slice(0,9);
  values.logEntries=logs.length;
  if(!Object.entries(values).some(([k,v])=>typeof v==="string"&&v.trim()&&!["yes","no"].includes(v)))return null;
  return {kind:"batch2-go-to-market",values};
 }
},
"strategic-partnerships-referrals":{
 title:"Strategic Partnerships and Referrals",
 objective:"Evaluate actual versus aspirational peer relationships, earned recognition from recommenders, and natural customer referral asks without confusing a network list with a functioning referral engine.",
 prompts:{risk:"What is the biggest weakness in my partnership and referral plan?",assumptions:"Challenge which relationships are real versus aspirational.",options:"What should I prioritize to earn recommendations?",habit:"What evidence would show referrals are becoming repeatable?"},
 snapshot(){
  const values={};
  const ids=["realistic-assessment","referral-line","personal-ask","refusal-why"];
  ids.forEach(id=>{values[id.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=text(id,300)});
  document.querySelectorAll("#peer-list .entry-row").forEach((row,i)=>{if(i>=5)return;for(const [key,cls] of [["Name","peer-name"],["State","peer-state"],["Overlap","peer-overlap"],["Commitment","peer-commitment"]])values["peer"+(i+1)+key]=String(row.querySelector("."+cls)?.value||"").trim().slice(0,300)});
  document.querySelectorAll("#recommender-list .entry-row").forEach((row,i)=>{if(i>=4)return;for(const [key,cls] of [["Role","rec-role"],["State","rec-state"],["Detail","rec-detail"]])values["recommender"+(i+1)+key]=String(row.querySelector("."+cls)?.value||"").trim().slice(0,300)});
  values.declinedPrograms=Array.from(document.querySelectorAll(".refusal-checkbox:checked")).map(el=>el.dataset.item).join("; ").slice(0,300);
  if(!Object.values(values).some(v=>v))return null;
  return {kind:"batch2-strategic-partnerships-referrals",values};
 }
},
"great-product-manager":{
 title:"The Great Product Manager",
 objective:"Distinguish product judgments the owner must retain from work that can be documented and delegated, while protecting direct customer contact.",
 prompts:{risk:"Where am I still the bottleneck?",assumptions:"Challenge what I think only I can do.",options:"What should I document or hand off first?",habit:"How do I protect regular customer contact?"},
 snapshot(){
  const get=k=>String(document.querySelector('[data-k="'+k+'"]')?.value||"").trim().slice(0,180);
  const check=k=>document.querySelector('[data-k="'+k+'"]')?.checked?"yes":"no";
  const values={week:get("week"),documentationRecipient:get("docTo"),documentationStatus:String(document.querySelector('[data-k="docSt"]:checked')?.value||""),documentationSummary:get("doc"),customerDay:get("ctDay"),customerDuration:get("ctLen"),customerWho:get("ctWho"),customerTimeBooked:check("ctCal"),writtenDown:check("written"),hireSignal1:check("sg1"),hireSignal2:check("sg2"),hireSignal3:check("sg3")};
  const rows=Array.from(document.querySelectorAll("#cal .cal")).slice(0,8);
  values.calendarCount=document.querySelectorAll("#cal .cal").length;
  rows.forEach((row,i)=>{
   const f=k=>String(row.querySelector('[data-f="'+k+'"]')?.value||"").trim().slice(0,120);
   values["item"+(i+1)+"Name"]=f("item");
   values["item"+(i+1)+"Hours"]=f("hrs");
   values["item"+(i+1)+"Delegable"]=f("q");
   values["item"+(i+1)+"Reason"]=f("why");
   values["item"+(i+1)+"Costliest"]=row.querySelector('input[name="top"]')?.checked?"yes":"no";
  });
  if(!rows.some(row=>row.querySelector('[data-f="item"]')?.value?.trim())&&!values.documentationSummary)return null;
  return {kind:"batch3-great-product-manager",values};
 }
},
"learning-while-running":{
 title:"Learning While You Run It",
 objective:"Turn direct customer feedback into a repeatable learning habit and one-change experiments with evidence-based keep, fix or stop decisions.",
 prompts:{risk:"What is the weakest part of my learning loop?",assumptions:"Challenge what I think these customer responses prove.",options:"What single change should I test next?",habit:"How can I make this learning habit stick?"},
 snapshot(){
  const get=k=>String(document.querySelector('[data-k="'+k+'"]')?.value||"").trim().slice(0,160);
  const values={moment:get("moment"),when:get("when"),question:get("question"),behaviorMeasure:get("number"),reviewDay:get("day"),reviewMinutes:get("mins"),calendarBooked:document.querySelector('[data-k="onCal"]')?.checked?"yes":"no"};
  const themes=Array.from(document.querySelectorAll("#themes .theme")).slice(0,4).map(row=>{
   const fields=row.querySelectorAll('[data-f="text"],[data-f="note"]');
   const n=Number(row.querySelector(".tally .v")?.textContent||0);
   return [String(fields[0]?.value||"").trim().slice(0,95),"mentions "+(Number.isFinite(n)?n:0),String(fields[1]?.value||"").trim().slice(0,80)].filter(Boolean).join(" | ");
  });
  const tests=Array.from(document.querySelectorAll("#tests .test")).slice(0,4);
  values.themeCount=document.querySelectorAll("#themes .theme").length;
  values.testCount=document.querySelectorAll("#tests .test").length;
  values.themeEvidence=themes.join("; ").slice(0,300);
  tests.forEach((row,i)=>{
   const f=k=>String(row.querySelector('[data-f="'+k+'"]')?.value||"").trim().slice(0,220);
   const decision=Array.from(row.querySelectorAll('[data-xd][aria-pressed="true"]')).map(x=>x.dataset.d).join("");
   values["test"+(i+1)+"Change"]=f("change");
   values["test"+(i+1)+"Measure"]=f("number")||"not recorded";
   values["test"+(i+1)+"Decision"]=decision||"pending";
   values["test"+(i+1)+"Result"]=f("result")||"not recorded";
   values["test"+(i+1)+"Notes"]=f("notes");
  });
  if(!values.question&&!values.themeCount&&!values.testCount)return null;
  return {kind:"batch3-learning-while-running",values};
 }
},
"roadmapping":{
 title:"Lean Roadmap",
 objective:"Separate committed work from untested priorities, challenge premature dates and dependencies, and protect focus when stakeholders push new ideas.",
 prompts:{risk:"What is the biggest weakness in my roadmap?",assumptions:"Challenge how I have ordered Now, Next and Later.",options:"What should I change before committing?",habit:"What decision should I make next?"},
 snapshot(){
  const values={};
  for(const [name,id] of [["now","itemsNow"],["next","itemsNext"],["later","itemsLater"]]){
   const rows=Array.from(document.querySelectorAll("#"+id+" .item")).slice(0,12);
   const entries=rows.map(row=>{
    const get=f=>String(row.querySelector('[data-f="'+f+'"]')?.value||"").trim().slice(0,200);
    return {idea:get("text"),date:name==="now"?get("date"):"",decided:name==="now"?!!row.querySelector('[data-f="decided"]')?.checked:false,hurt:name==="next"?get("hurt"):"",cost:name==="next"?get("breaks"):"",reason:get("reason")};
   }).filter(x=>x.idea);
   values[name+"Count"]=rows.length;
   values[name+"Summary"]=entries.slice(0,3).map(x=>[x.idea,x.date?"due "+x.date:"",name==="now"?(x.decided?"decision made":"decision open"):"",x.hurt?"risk "+x.hurt:"",x.cost?"cost "+x.cost:"",x.reason?"reason "+x.reason:""].filter(Boolean).join(" | ")).join("; ").slice(0,300);
  }
  values.pushedIdea=String(document.querySelector("#pushId option:checked")?.textContent||"").trim().slice(0,150);
  values.shown=document.querySelector('[data-k="shown"]')?.checked?"yes":"no";
  values.discussionOccurred=String(document.querySelector('[data-k="theySaid"]')?.value||"").trim()?"yes":"no";
  if(!(values.nowCount+values.nextCount+values.laterCount))return null;
  return {kind:"batch3-roadmapping",values};
 }
},
"affordability-test":{
 title:"Hire Affordability Test",
 objective:"Evaluate the full cost, ramp exposure, cash cushion and timing of a proposed hire; distinguish affordability from desirability.",
 prompts:{risk:"Where is the biggest affordability risk?",assumptions:"Challenge my hiring assumptions.",options:"What hiring alternatives should I consider?",habit:"What should I verify before making an offer?"},
 snapshot(){
 const salary=number("salary"),loading=number("loading"),cash=number("cash"),burn=number("burn");
 const ramp=text("ramp",30);
 if([salary,loading,cash,burn].every(v=>v===null))return null;
 if(salary!==null&&salary<0||loading!==null&&loading<=0||cash!==null&&cash<0||burn!==null&&burn<0)throw Error("Review salary, loading, cash and burn values.");
 return {kind:"hire-affordability",salary,loadingFactor:loading,rampMonths:ramp?Number(ramp):null,cashOnHand:cash,monthlyNetBurn:burn,hasRampReasoning:present(text("ramp-reasoning")),hasTimingPlan:present(text("timing"))};
 }
},
"business-model-canvas":{
 title:"Business Model Canvas",
 objective:"Expose unsupported business-model assumptions and define a falsifiable, time-bound customer test.",
 prompts:{risk:"Which business-model assumption needs testing?",assumptions:"Challenge my riskiest box.",options:"How can I design a stronger test?",habit:"What evidence should I collect next?"},
 snapshot(){
 // The nine canvas fields are generated by the worksheet script; do not scrape its private state or names.
 const who=text("tWho",400),what=text("tWhat",400),no=text("tNo",400),by=text("tBy",20),why=text("riskWhy",600);
 if(![who,what,no,why].some(present))return null;
 return {kind:"business-model-canvas",test:{who,action:what,rejectionCriterion:no,dueDate:by},riskRationale:why,hasResults:present(text("result"))};
 }
},
"recruiting-talent":{
 title:"Recruiting Plan",
 objective:"Test role clarity, differentiated offer, early outcomes and sourcing discipline without transmitting candidate identities.",
 prompts:{risk:"What is weakest in my recruiting plan?",assumptions:"Challenge my role and candidate assumptions.",options:"How can I improve the offer?",habit:"What should I do this week to build the pipeline?"},
 snapshot(){
 const keys=["lever-scope","lever-proximity","lever-speed","lever-stake","pitch-owns","pitch-90","pitch-2y","fit-norms","fit-complement"];
 const fields=Object.fromEntries(keys.map(k=>[k.replace(/-/g,"_"),text(k,500)]));
 if(!Object.values(fields).some(present))return null;
 // Candidate lists and role/company identifiers are deliberately excluded.
 return {kind:"recruiting-plan",fields};
 }
}
};
root.TWO_COACH_ADAPTERS=Object.freeze(specs);
})(window);
