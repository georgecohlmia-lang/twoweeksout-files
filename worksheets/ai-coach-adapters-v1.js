/* AI Ownership Coach: explicit worksheet snapshots, v1. No network calls. */
(function(root){
"use strict";
const text=(id,max=800)=>{const el=document.getElementById(id);return el?String(el.value||"").trim().slice(0,max):""};
const number=(id)=>{const el=document.getElementById(id);if(!el||String(el.value).trim()==="")return null;const n=Number(el.value);if(!Number.isFinite(n))throw Error("Correct the numeric field: "+id);return n};
const present=(v)=>typeof v==="string"&&v.length>0;
const specs={
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
